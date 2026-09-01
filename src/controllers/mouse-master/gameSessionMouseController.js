import GameSessionMouse    from '../../models/mouse-master/GameSessionMouse.js';
import MouseLevel           from '../../models/mouse-master/MouseLevel.js';
import UserProgressMouse    from '../../models/mouse-master/UserProgressMouse.js';
import SkillCategoryMouse   from '../../models/mouse-master/SkillCategoryMouse.js';
import SkillBadgeMouse      from '../../models/mouse-master/SkillBadgeMouse.js';
import UserStatistic        from '../../models/shared/UserStatistic.js';
import UserAchievement      from '../../models/shared/UserAchievement.js';
import Achievement          from '../../models/shared/Achievement.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/mouse-master/sessions
// Start a new game session — creates the session document in 'in_progress' state
// ─────────────────────────────────────────────────────────────────────────────
export const startSession = async (req, res) => {
  try {
    const { userAccountId, levelId, gameModeId, deviceInfo } = req.body;

    // Verify the level exists (also provides the unlock check point)
    const level = await MouseLevel.findById(levelId);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found.' });

    const session = await GameSessionMouse.create({
      userAccountId,
      levelId,
      gameModeId,
      startedAt: new Date(),
      deviceInfo: deviceInfo || {}
    });

    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/mouse-master/sessions/:id/complete
// End session — records results and runs all post-session hooks:
//   1. Upsert UserProgressMouse (best-of compare)
//   2. Update UserStatistic.gameStats.mouse_master (running avg)
//   3. Award SkillBadgeMouse if category fully completed
//   4. Award UserAchievement for cross-game achievements
// ─────────────────────────────────────────────────────────────────────────────
export const completeSession = async (req, res) => {
  try {
    const {
      endedAt, durationMs,
      targetsShown, targetsHit, targetsMissed,
      accuracyPct, avgReactionTimeMs, fastestReactionMs, slowestReactionMs,
      overshootCount, deviationScore,
      passed, starsEarned, xpEarned
    } = req.body;

    // ── 1. Finalize the session document ─────────────────────────────────────
    const session = await GameSessionMouse.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          endedAt:           endedAt || new Date(),
          durationMs,
          targetsShown,      targetsHit,       targetsMissed,
          accuracyPct,       avgReactionTimeMs,
          fastestReactionMs, slowestReactionMs,
          overshootCount,    deviationScore,
          passed,            starsEarned,      xpEarned
        }
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });

    const { userAccountId, levelId } = session;
    const postSessionResults = { badgeAwarded: null, achievementsUnlocked: [] };

    // ── 2. Upsert UserProgressMouse (best-of compare) ────────────────────────
    const existing = await UserProgressMouse.findOne({ userAccountId, levelId });

    const progressUpdate = {
      $inc: { attemptsCount: 1 },
      $set: { lastPlayedAt: new Date() }
    };

    if (passed) {
      progressUpdate.$set.status = 'completed';
      if (!existing?.firstCompletedAt) {
        progressUpdate.$set.firstCompletedAt = new Date();
      }
      // Store best-of values
      if (!existing || accuracyPct > (existing.bestAccuracyPct || 0)) {
        progressUpdate.$set.bestAccuracyPct = accuracyPct;
      }
      if (!existing || !existing.bestAvgReactionMs || avgReactionTimeMs < existing.bestAvgReactionMs) {
        progressUpdate.$set.bestAvgReactionMs = avgReactionTimeMs;
      }
      if (!existing || starsEarned > (existing.bestStars || 0)) {
        progressUpdate.$set.bestStars = starsEarned;
      }
    } else if (!existing || existing.status === 'locked') {
      progressUpdate.$set.status = 'unlocked';
    }

    await UserProgressMouse.findOneAndUpdate(
      { userAccountId, levelId },
      progressUpdate,
      { upsert: true, returnDocument: 'after' }
    );

    // ── 3. Update UserStatistic.gameStats.mouse_master ────────────────────────
    // Uses $set on a Mixed sub-field for flexible, per-game stats storage
    // consistent with the `categoryStats: [Mixed]` pattern in the shared model
    try {
      const statDoc = await UserStatistic.findOne({ userAccountId });
      if (statDoc) {
        const prev = statDoc.toObject().gameStats?.mouse_master || {
          levelsCompleted: 0, totalSessionsPlayed: 0,
          accuracyPct: 0, avgReactionTimeMs: 0, skillBadgesEarned: 0
        };

        const newTotal = prev.totalSessionsPlayed + 1;
        const newCompleted = passed ? prev.levelsCompleted + 1 : prev.levelsCompleted;

        // Rolling average for accuracy
        const newAccuracy = Math.round(
          ((prev.accuracyPct * prev.totalSessionsPlayed) + accuracyPct) / newTotal * 10
        ) / 10;

        // Rolling average for reaction time (only when valid)
        const newReaction = avgReactionTimeMs
          ? Math.round(
              ((prev.avgReactionTimeMs * prev.totalSessionsPlayed) + avgReactionTimeMs) / newTotal
            )
          : prev.avgReactionTimeMs;

        await UserStatistic.findOneAndUpdate(
          { userAccountId },
          {
            $set: {
              'gameStats.mouse_master': {
                levelsCompleted:   newCompleted,
                totalSessionsPlayed: newTotal,
                accuracyPct:       newAccuracy,
                avgReactionTimeMs: newReaction,
                skillBadgesEarned: prev.skillBadgesEarned,
                lastPlayedAt:      new Date()
              }
            }
          }
        );
      }
    } catch (statErr) {
      // Non-fatal — log but don't fail the session response
      console.error('[Mouse Master] UserStatistic update failed:', statErr.message);
    }

    // ── 4. Check & award SkillBadgeMouse (category completion) ───────────────
    if (passed) {
      try {
        const level = await MouseLevel.findById(levelId).populate('categoryId');
        const category = level?.categoryId;

        if (category) {
          // Check if all levels in this category are now completed
          const categoryLevels = await MouseLevel.find({ categoryId: category._id });
          const levelIds = categoryLevels.map(l => l._id);

          const completedCount = await UserProgressMouse.countDocuments({
            userAccountId,
            levelId: { $in: levelIds },
            status: 'completed'
          });

          if (completedCount === categoryLevels.length) {
            // Award the category badge (upsert prevents duplicates)
            const badgeNameMap = {
              click_basics:      'Clicker Badge',
              double_right_click:'Double-Click Master Badge',
              drag_drop:         'Dragger Badge',
              scroll_precision:  'Scroller Badge',
              mixed_challenge:   'Mouse Master Badge'
            };

            const badge = await SkillBadgeMouse.findOneAndUpdate(
              { userAccountId, categoryKey: category.categoryKey },
              {
                $setOnInsert: {
                  userAccountId,
                  categoryKey:    category.categoryKey,
                  badgeName:      badgeNameMap[category.categoryKey] || `${category.name} Badge`,
                  earnedAt:       new Date(),
                  levelIdOnEarn:  levelId
                }
              },
              { returnDocument: 'after', upsert: true }
            );

            if (badge.createdAt?.toISOString() === badge.updatedAt?.toISOString()) {
              // Freshly inserted — increment badge count in UserStatistic
              postSessionResults.badgeAwarded = badge;
              await UserStatistic.findOneAndUpdate(
                { userAccountId },
                { $inc: { 'gameStats.mouse_master.skillBadgesEarned': 1 } }
              );
            }
          }

          // ── 5. Check & award UserAchievement (cross-game, e.g. Mouse Master title) ─
          // Only award 'mouse_master_completed' when the mixed_challenge category badge is earned
          if (category.categoryKey === 'mixed_challenge' && postSessionResults.badgeAwarded) {
            try {
              const achievementDef = await Achievement.findOne({ achievementId: 'mouse_master_completed' });
              if (achievementDef) {
                await UserAchievement.findOneAndUpdate(
                  { userId: userAccountId, achievementId: achievementDef._id },
                  {
                    $setOnInsert: {
                      userId:           userAccountId,
                      achievementId:    achievementDef._id,
                      achievementSlug:  'mouse_master_completed',
                      earnedAt:         new Date(),
                      earnedInSession:  session._id,
                      notified:         false,
                      isDisplayed:      false
                    }
                  },
                  { upsert: true, returnDocument: 'after' }
                );
                postSessionResults.achievementsUnlocked.push('mouse_master_completed');
              }
            } catch (achErr) {
              console.error('[Mouse Master] Achievement check failed:', achErr.message);
            }
          }
        }
      } catch (badgeErr) {
        console.error('[Mouse Master] Badge check failed:', badgeErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: session,
      postSession: postSessionResults
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mouse-master/sessions/user/:userId
// Paginated session history for a user
// ─────────────────────────────────────────────────────────────────────────────
export const getSessionsByUser = async (req, res) => {
  try {
    const { levelId, passed, page = 1, limit = 20 } = req.query;

    const filter = { userAccountId: req.params.userId };
    if (levelId) filter.levelId = levelId;
    if (passed  !== undefined) filter.passed = passed === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      GameSessionMouse.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('levelId', 'levelNumber challengeType difficulty')
        .populate('gameModeId', 'modeKey name'),
      GameSessionMouse.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true, count: data.length, total,
      page: Number(page), pages: Math.ceil(total / Number(limit)), data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mouse-master/sessions/user/:userId/best
// Best session (highest accuracy, fastest reaction) for a user
// ─────────────────────────────────────────────────────────────────────────────
export const getBestSessionByUser = async (req, res) => {
  try {
    const session = await GameSessionMouse.findOne({
      userAccountId: req.params.userId,
      passed: true
    })
      .sort({ accuracyPct: -1, avgReactionTimeMs: 1 })
      .populate('levelId', 'levelNumber challengeType difficulty');

    if (!session) return res.status(404).json({ success: false, message: 'No completed sessions found.' });
    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mouse-master/sessions/:id
// Single session detail
// ─────────────────────────────────────────────────────────────────────────────
export const getSessionById = async (req, res) => {
  try {
    const session = await GameSessionMouse.findById(req.params.id)
      .populate('levelId', 'levelNumber challengeType difficulty passThreshold xpReward')
      .populate('gameModeId', 'modeKey name affectsLeaderboard');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/mouse-master/sessions/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteSession = async (req, res) => {
  try {
    const session = await GameSessionMouse.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    return res.status(200).json({ success: true, message: 'Session deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
