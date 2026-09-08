import GameSessionTyping from '../../models/koompi-typing/GameSessionTyping.js';
import TypingLesson from '../../models/koompi-typing/TypingLesson.js';
import UserProgressTyping from '../../models/koompi-typing/UserProgressTyping.js';
import UserStreakTyping from '../../models/koompi-typing/UserStreakTyping.js';
import KeyboardHeatmapStat from '../../models/koompi-typing/KeyboardHeatmapStat.js';
import UserStatistic from '../../models/shared/UserStatistic.js';
import UserAchievement from '../../models/shared/UserAchievement.js';
import Achievement from '../../models/shared/Achievement.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/koompi-typing/sessions
// Start a new game session
// ─────────────────────────────────────────────────────────────────────────────
export const startSession = async (req, res) => {
  try {
    const { userAccountId, lessonId, gameModeId, language, deviceInfo } = req.body;

    if (!userAccountId) {
      return res.status(400).json({ success: false, message: 'userAccountId is required.' });
    }

    let resolvedLanguage = language || 'en';

    if (lessonId) {
      const lesson = await TypingLesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Typing lesson not found.' });
      }
      resolvedLanguage = lesson.language;

      // Check unlock status (allow if no progress record exists yet for lesson 1, or status is unlocked/completed)
      const progress = await UserProgressTyping.findOne({ userAccountId, lessonId });
      if (progress && progress.status === 'locked') {
        return res.status(403).json({ success: false, message: 'This lesson is currently locked.' });
      }
    }

    const session = await GameSessionTyping.create({
      userAccountId,
      lessonId: lessonId || null,
      gameModeId: gameModeId || null,
      language: resolvedLanguage,
      startedAt: new Date(),
      deviceInfo: deviceInfo || {}
    });

    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/koompi-typing/sessions/:id/complete
// End session, record results, and execute post-session hooks:
//   1. Upsert UserProgressTyping & unlock next lesson
//   2. Upsert UserStreakTyping (daily streak)
//   3. Rollup KeyboardHeatmapStat
//   4. Update UserStatistic.gameStats.koompi_typing
//   5. Check & award achievements
// ─────────────────────────────────────────────────────────────────────────────
export const completeSession = async (req, res) => {
  try {
    const {
      endedAt,
      durationMs,
      charactersTyped,
      charactersCorrect,
      charactersIncorrect,
      accuracyPct,
      wpm,
      netWpm,
      backspaceCount,
      passed,
      starsEarned,
      xpEarned,
      keyStats
    } = req.body;

    // ── 1. Update session document ───────────────────────────────────────────
    const session = await GameSessionTyping.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          endedAt: endedAt || new Date(),
          durationMs: durationMs ?? 0,
          charactersTyped: charactersTyped ?? 0,
          charactersCorrect: charactersCorrect ?? 0,
          charactersIncorrect: charactersIncorrect ?? 0,
          accuracyPct: accuracyPct ?? 0,
          wpm: wpm ?? 0,
          netWpm: netWpm ?? 0,
          backspaceCount: backspaceCount ?? 0,
          passed: Boolean(passed),
          starsEarned: starsEarned ?? 0,
          xpEarned: xpEarned ?? 0
        }
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const { userAccountId, lessonId, language } = session;
    const postSessionResults = {
      progressUpdated: null,
      nextLessonUnlocked: null,
      streak: null,
      achievementsUnlocked: []
    };

    // ── 2. Hook A: UserProgressTyping ────────────────────────────────────────
    if (lessonId) {
      try {
        const existing = await UserProgressTyping.findOne({ userAccountId, lessonId });
        const attemptsCount = (existing?.attemptsCount || 0) + 1;
        const bestAccuracyPct = Math.max(existing?.bestAccuracyPct || 0, session.accuracyPct);
        const bestWpm = Math.max(existing?.bestWpm || 0, session.wpm);
        const bestNetWpm = Math.max(existing?.bestNetWpm || 0, session.netWpm);
        const bestStars = Math.max(existing?.bestStars || 0, session.starsEarned);
        const isCompleted = session.passed || existing?.status === 'completed';

        const updatedProgress = await UserProgressTyping.findOneAndUpdate(
          { userAccountId, lessonId },
          {
            $set: {
              status: isCompleted ? 'completed' : (existing?.status || 'unlocked'),
              bestAccuracyPct,
              bestWpm,
              bestNetWpm,
              bestStars,
              attemptsCount,
              firstCompletedAt: isCompleted ? (existing?.firstCompletedAt || new Date()) : null,
              lastPlayedAt: new Date()
            }
          },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
        );

        postSessionResults.progressUpdated = updatedProgress;

        // If passed, unlock next lesson in sequence
        if (session.passed) {
          const currentLesson = await TypingLesson.findById(lessonId);
          if (currentLesson) {
            const nextLesson = await TypingLesson.findOne({
              unitId: currentLesson.unitId,
              order: currentLesson.order + 1
            });

            if (nextLesson) {
              const nextProgress = await UserProgressTyping.findOneAndUpdate(
                { userAccountId, lessonId: nextLesson._id },
                {
                  $setOnInsert: {
                    status: 'unlocked',
                    attemptsCount: 0,
                    bestAccuracyPct: 0,
                    bestWpm: 0,
                    bestNetWpm: 0,
                    bestStars: 0
                  }
                },
                { upsert: true, returnDocument: 'after' }
              );
              postSessionResults.nextLessonUnlocked = nextLesson._id;
            }
          }
        }
      } catch (progErr) {
        console.error('[KOOMPI Typing] UserProgress update failed:', progErr.message);
      }
    }

    // ── 3. Hook B: UserStreakTyping ──────────────────────────────────────────
    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      let streakDoc = await UserStreakTyping.findOne({ userAccountId });
      let dayContributed = false;

      if (!streakDoc) {
        streakDoc = await UserStreakTyping.create({
          userAccountId,
          currentStreakDays: 1,
          longestStreakDays: 1,
          lastActivityDate: now,
          streakFreezesAvailable: 1,
          history: [{ date: now, sessionsPlayed: 1, xpEarned: session.xpEarned }]
        });
        dayContributed = true;
      } else {
        const lastDateStr = streakDoc.lastActivityDate
          ? new Date(streakDoc.lastActivityDate).toISOString().split('T')[0]
          : null;

        if (lastDateStr === todayStr) {
          // Already played today: update today's history entry
          const todayEntry = streakDoc.history.find(
            h => new Date(h.date).toISOString().split('T')[0] === todayStr
          );
          if (todayEntry) {
            todayEntry.sessionsPlayed += 1;
            todayEntry.xpEarned += session.xpEarned;
          } else {
            streakDoc.history.push({ date: now, sessionsPlayed: 1, xpEarned: session.xpEarned });
          }
          dayContributed = true;
        } else {
          // Check day diff
          const lastDate = new Date(lastDateStr);
          const diffDays = Math.round((new Date(todayStr) - lastDate) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Consecutive day
            streakDoc.currentStreakDays += 1;
            if (streakDoc.currentStreakDays > streakDoc.longestStreakDays) {
              streakDoc.longestStreakDays = streakDoc.currentStreakDays;
            }
          } else if (diffDays === 2 && streakDoc.streakFreezesAvailable > 0) {
            // Used streak freeze
            streakDoc.streakFreezesAvailable -= 1;
            streakDoc.currentStreakDays += 1;
            if (streakDoc.currentStreakDays > streakDoc.longestStreakDays) {
              streakDoc.longestStreakDays = streakDoc.currentStreakDays;
            }
          } else {
            // Streak broken
            streakDoc.currentStreakDays = 1;
          }

          streakDoc.lastActivityDate = now;
          streakDoc.history.push({ date: now, sessionsPlayed: 1, xpEarned: session.xpEarned });
          dayContributed = true;
        }

        await streakDoc.save();
      }

      session.streakDayContribution = dayContributed;
      await session.save();
      postSessionResults.streak = {
        currentStreakDays: streakDoc.currentStreakDays,
        longestStreakDays: streakDoc.longestStreakDays
      };
    } catch (streakErr) {
      console.error('[KOOMPI Typing] Streak update failed:', streakErr.message);
    }

    // ── 4. Hook C: KeyboardHeatmapStat ───────────────────────────────────────
    if (keyStats && typeof keyStats === 'object') {
      try {
        let heatmap = await KeyboardHeatmapStat.findOne({ userAccountId, language });
        if (!heatmap) {
          heatmap = new KeyboardHeatmapStat({
            userAccountId,
            language,
            keyStats: new Map()
          });
        }

        for (const [key, stat] of Object.entries(keyStats)) {
          const current = heatmap.keyStats.get(key) || { attempts: 0, correct: 0, avgTimeMs: 0 };
          const newAttempts = current.attempts + (stat.attempts || 0);
          const newCorrect = current.correct + (stat.correct || 0);
          const newAvgTime = newAttempts > 0
            ? Math.round(((current.attempts * current.avgTimeMs) + ((stat.attempts || 0) * (stat.avgTimeMs || 0))) / newAttempts)
            : current.avgTimeMs;

          heatmap.keyStats.set(key, {
            attempts: newAttempts,
            correct: newCorrect,
            avgTimeMs: newAvgTime
          });
        }

        await heatmap.save();
      } catch (hmErr) {
        console.error('[KOOMPI Typing] Heatmap update failed:', hmErr.message);
      }
    }

    // ── 5. Hook D: UserStatistic.gameStats.koompi_typing ──────────────────────
    try {
      const statDoc = await UserStatistic.findOne({ userAccountId });
      if (statDoc) {
        const prev = statDoc.toObject().gameStats?.koompi_typing || {
          lessonsCompleted: 0,
          wpm: 0,
          accuracyPct: 0,
          currentStreakDays: 0,
          totalSessionsPlayed: 0,
          languagesPracticed: [],
          lastPlayedAt: null
        };

        const totalCompleted = await UserProgressTyping.countDocuments({
          userAccountId,
          status: 'completed'
        });

        const newTotal = (prev.totalSessionsPlayed || 0) + 1;
        const newAccuracy = Math.round(
          (((prev.accuracyPct || 0) * (prev.totalSessionsPlayed || 0)) + session.accuracyPct) / newTotal * 10
        ) / 10;
        const newWpm = Math.max(prev.wpm || 0, session.wpm);

        const langs = new Set(prev.languagesPracticed || []);
        if (session.language) langs.add(session.language);

        await UserStatistic.findOneAndUpdate(
          { userAccountId },
          {
            $set: {
              'gameStats.koompi_typing': {
                lessonsCompleted: totalCompleted,
                wpm: newWpm,
                accuracyPct: newAccuracy,
                currentStreakDays: postSessionResults.streak?.currentStreakDays || prev.currentStreakDays,
                totalSessionsPlayed: newTotal,
                languagesPracticed: Array.from(langs),
                lastPlayedAt: new Date()
              }
            }
          }
        );
      }
    } catch (statErr) {
      console.error('[KOOMPI Typing] UserStatistic update failed:', statErr.message);
    }

    // ── 6. Hook E: Cross-game UserAchievement check ──────────────────────────
    try {
      const streakDays = postSessionResults.streak?.currentStreakDays || 0;
      const candidateAchievements = [];

      if (session.wpm >= 40) {
        candidateAchievements.push({ key: 'typing_speed_40wpm', name: 'Swift Typist', points: 40 });
      }
      if (session.wpm >= 60) {
        candidateAchievements.push({ key: 'typing_speed_60wpm', name: 'Speed Demon', points: 60 });
      }
      if (streakDays >= 7) {
        candidateAchievements.push({ key: 'typing_streak_7', name: '7-Day Streak', points: 30 });
      }
      if (streakDays >= 30) {
        candidateAchievements.push({ key: 'typing_streak_30', name: 'Monthly Dedication', points: 100 });
      }

      for (const ach of candidateAchievements) {
        const alreadyEarned = await UserAchievement.findOne({
          userAccountId,
          achievementKey: ach.key
        });

        if (!alreadyEarned) {
          const newAch = await UserAchievement.create({
            userAccountId,
            achievementKey: ach.key,
            title: ach.name,
            points: ach.points,
            sourceGame: 'koompi_typing',
            earnedAt: new Date()
          });
          postSessionResults.achievementsUnlocked.push(newAch);
        }
      }
    } catch (achErr) {
      // Achievements are non-fatal
    }

    return res.json({
      success: true,
      data: session,
      postSessionResults
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/koompi-typing/sessions/user/:userId
// Fetch history of sessions for a user
// ─────────────────────────────────────────────────────────────────────────────
export const getSessionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { lessonId, language, passed, page = 1, limit = 20 } = req.query;

    const filter = { userAccountId: userId };
    if (lessonId) filter.lessonId = lessonId;
    if (language) filter.language = language;
    if (passed !== undefined) filter.passed = passed === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [sessions, total] = await Promise.all([
      GameSessionTyping.find(filter)
        .populate('lessonId', 'lessonNumber title difficulty')
        .populate('gameModeId', 'modeKey name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      GameSessionTyping.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      count: sessions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: sessions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/koompi-typing/sessions/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getSessionById = async (req, res) => {
  try {
    const cacheKey = generateKey('session', 'typing', req.params.id);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const session = await GameSessionTyping.findById(req.params.id)
      .populate('lessonId', 'lessonNumber title targetKeys difficulty xpReward')
      .populate('gameModeId', 'modeKey name')
      .populate('userAccountId', 'username email');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const responseData = { success: true, data: session };
    await set(cacheKey, responseData, TTL.SESSION);
    return res.json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/koompi-typing/sessions/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteSession = async (req, res) => {
  try {
    const session = await GameSessionTyping.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    await del(generateKey('session', 'typing', req.params.id));
    return res.json({ success: true, message: 'Session deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
