import GameSessionLink    from '../../models/link-number/GameSessionLink.js';
import PuzzleBoard        from '../../models/link-number/PuzzleBoard.js';
import BoardProgress      from '../../models/link-number/BoardProgress.js';
import DifficultyProgression from '../../models/link-number/DifficultyProgression.js';
import UserStatistic      from '../../models/shared/UserStatistic.js';
import UserAchievement    from '../../models/shared/UserAchievement.js';
import Achievement        from '../../models/shared/Achievement.js';

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/link-number/sessions
// Start a new game session — validates the board exists, creates an in_progress document
// Body: { userAccountId, boardId, device? }
// ─────────────────────────────────────────────────────────────────────────────
export const startSession = async (req, res) => {
  try {
    const { userAccountId, boardId, device } = req.body;

    if (!userAccountId || !boardId) {
      return res.status(400).json({ success: false, message: 'userAccountId and boardId are required.' });
    }

    const board = await PuzzleBoard.findById(boardId);
    if (!board) {
      return res.status(404).json({ success: false, message: 'Puzzle board not found.' });
    }

    const session = await GameSessionLink.create({
      userAccountId,
      boardId,
      boardNumber: board.boardNumber,
      difficulty:  board.difficulty,
      gridSize:    board.gridSize,
      timing: { startedAt: new Date() },
      device: device || {}
    });

    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/link-number/sessions/:id/complete
// Finalize a session and run all post-session hooks:
//   1. Update session document with result data
//   2. Upsert BoardProgress (best-of compare)
//   3. Update UserStatistic.gameStats.link_number
//   4. Update DifficultyProgression tier counts
//   5. Check & award UserAchievement
// Body: { timing, result, moveHistory?, paths?, userActions?, analytics? }
// ─────────────────────────────────────────────────────────────────────────────
export const completeSession = async (req, res) => {
  try {
    const { timing, result, moveHistory, paths, userActions, analytics } = req.body;

    // ── 1. Finalize the session document ─────────────────────────────────────
    const session = await GameSessionLink.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(timing      && { timing }),
          ...(result      && { result }),
          ...(moveHistory && { moveHistory }),
          ...(paths       && { paths }),
          ...(userActions && { userActions }),
          ...(analytics   && { analytics })
        }
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const { userAccountId, boardId, boardNumber, difficulty } = session;
    const puzzleSolved = result?.puzzleSolved ?? session.result.puzzleSolved;
    const starRating   = result?.starRating   ?? session.result.starRating;
    const score        = result?.score        ?? session.result.score;
    const durationSecs = timing?.durationSeconds ?? session.timing.durationSeconds;
    const mistakes     = result?.mistakesMade ?? session.result.mistakesMade;

    const postSessionResults = { achievementsUnlocked: [] };

    // ── 2. Upsert BoardProgress ───────────────────────────────────────────────
    try {
      const existing = await BoardProgress.findOne({ userAccountId, boardId });

      const progressUpdate = {
        $inc: { totalAttempts: 1 },
        $set: { 'performanceTrend.currentBestTime': durationSecs }
      };

      const attemptSnap = {
        attemptNumber: (existing?.totalAttempts ?? 0) + 1,
        status:        puzzleSolved ? 'completed' : (result?.status ?? 'quit'),
        starRating:    starRating ?? 0,
        score:         score ?? 0,
        time:          durationSecs ?? null,
        mistakes:      mistakes ?? 0,
        attemptedAt:   new Date()
      };
      progressUpdate.$push = { attempts: attemptSnap };

      if (puzzleSolved) {
        progressUpdate.$set.status      = 'completed';
        progressUpdate.$set.completedAt = progressUpdate.$set.completedAt || new Date();
        if (!existing?.firstAttemptAt) {
          progressUpdate.$set.firstAttemptAt = new Date();
        }
        if (!existing?.completedAt) {
          progressUpdate.$set.completedAt = new Date();
          progressUpdate.$set['rewardsClaimed.firstCompletionBonus'] = true;
        }
        // Best-of compare
        if (!existing || starRating > (existing.currentStars ?? 0)) {
          progressUpdate.$set.currentStars         = starRating;
          progressUpdate.$set['bestAttempt.stars'] = starRating;
        }
        if (!existing || score > (existing.bestAttempt?.score ?? 0)) {
          progressUpdate.$set['bestAttempt.score'] = score;
        }
        if (!existing || !existing.bestAttempt?.time || durationSecs < existing.bestAttempt.time) {
          progressUpdate.$set['bestAttempt.time'] = durationSecs;
        }
        // Star reward flags
        if (starRating >= 1) progressUpdate.$set['rewardsClaimed.starBonuses.oneStar']   = true;
        if (starRating >= 2) progressUpdate.$set['rewardsClaimed.starBonuses.twoStar']   = true;
        if (starRating >= 3) progressUpdate.$set['rewardsClaimed.starBonuses.threeStar'] = true;
      } else if (!existing || existing.status === 'locked') {
        progressUpdate.$set.status = 'in_progress';
        if (!existing?.firstAttemptAt) {
          progressUpdate.$set.firstAttemptAt = new Date();
        }
      }

      await BoardProgress.findOneAndUpdate(
        { userAccountId, boardId },
        progressUpdate,
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
    } catch (progErr) {
      console.error('[Link Number] BoardProgress update failed:', progErr.message);
    }

    // ── 3. Update UserStatistic.gameStats.link_number ─────────────────────────
    try {
      const statDoc = await UserStatistic.findOne({ userAccountId });
      if (statDoc) {
        const prev = statDoc.toObject().gameStats?.link_number ?? {
          boardsCompleted: 0,
          totalSessionsPlayed: 0,
          totalStarsEarned: 0,
          averageTime: 0,
          perfectRuns: 0
        };

        const newTotal     = prev.totalSessionsPlayed + 1;
        const newCompleted = puzzleSolved ? prev.boardsCompleted + 1 : prev.boardsCompleted;
        const newStars     = puzzleSolved ? prev.totalStarsEarned + (starRating ?? 0) : prev.totalStarsEarned;
        const newPerfect   = (starRating === 3) ? prev.perfectRuns + 1 : prev.perfectRuns;
        const newAvgTime   = durationSecs
          ? Math.round(((prev.averageTime * prev.totalSessionsPlayed) + durationSecs) / newTotal)
          : prev.averageTime;

        await UserStatistic.findOneAndUpdate(
          { userAccountId },
          {
            $set: {
              'gameStats.link_number': {
                boardsCompleted:     newCompleted,
                totalSessionsPlayed: newTotal,
                totalStarsEarned:    newStars,
                averageTime:         newAvgTime,
                perfectRuns:         newPerfect,
                lastPlayedAt:        new Date()
              }
            }
          }
        );
      }
    } catch (statErr) {
      console.error('[Link Number] UserStatistic update failed:', statErr.message);
    }

    // ── 4. Update DifficultyProgression tier counters ─────────────────────────
    if (puzzleSolved) {
      try {
        await DifficultyProgression.findOneAndUpdate(
          { userAccountId, 'difficultyTiers.tierName': difficulty },
          {
            $inc: { 'difficultyTiers.$.boardsCompleted': 1 }
          }
        );
      } catch (diffErr) {
        console.error('[Link Number] DifficultyProgression update failed:', diffErr.message);
      }
    }

    // ── 5. Check & award achievements ─────────────────────────────────────────
    try {
      const achievementChecks = [];

      // Perfect run (3 stars)
      if (starRating === 3) {
        achievementChecks.push('link_perfect_solver');
      }
      // Speed run (under 60 seconds)
      if (puzzleSolved && durationSecs && durationSecs < 60) {
        achievementChecks.push('link_speed_demon');
      }

      for (const slug of achievementChecks) {
        const achievementDef = await Achievement.findOne({ achievementId: slug });
        if (achievementDef) {
          const result = await UserAchievement.findOneAndUpdate(
            { userId: userAccountId, achievementId: achievementDef._id },
            {
              $setOnInsert: {
                userId:          userAccountId,
                achievementId:   achievementDef._id,
                achievementSlug: slug,
                earnedAt:        new Date(),
                earnedInSession: session._id,
                notified:        false,
                isDisplayed:     false
              }
            },
            { upsert: true, returnDocument: 'after' }
          );
          if (result) {
            postSessionResults.achievementsUnlocked.push(slug);
          }
        }
      }
    } catch (achErr) {
      console.error('[Link Number] Achievement check failed:', achErr.message);
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
// GET /api/link-number/sessions/user/:userId
// Paginated session history for a user
// Query: boardId, status, page, limit
// ─────────────────────────────────────────────────────────────────────────────
export const getSessionsByUser = async (req, res) => {
  try {
    const { boardId, status, page = 1, limit = 20 } = req.query;

    const filter = { userAccountId: req.params.userId };
    if (boardId) filter.boardId             = boardId;
    if (status)  filter['result.status']    = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      GameSessionLink.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('boardId', 'boardNumber title difficulty gridSize'),
      GameSessionLink.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/sessions/:id
// Single session detail
// ─────────────────────────────────────────────────────────────────────────────
export const getSessionById = async (req, res) => {
  try {
    const session = await GameSessionLink.findById(req.params.id)
      .populate('boardId', 'boardNumber title difficulty gridSize grid rewards');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }
    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/link-number/sessions/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteSession = async (req, res) => {
  try {
    const session = await GameSessionLink.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }
    return res.status(200).json({ success: true, message: 'Session deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
