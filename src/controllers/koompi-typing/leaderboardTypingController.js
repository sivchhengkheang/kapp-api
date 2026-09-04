import LeaderboardTyping from '../../models/koompi-typing/LeaderboardTyping.js';
import GameSessionTyping from '../../models/koompi-typing/GameSessionTyping.js';
import UserAccount from '../../models/shared/UserAccount.js';

// GET /api/koompi-typing/leaderboards
// Supports query: ?boardType=global|by_language|weekly|friends&language=en|km
export const getLeaderboard = async (req, res) => {
  try {
    const { boardType = 'global', language } = req.query;

    const filter = { boardType };
    if (boardType === 'by_language' && language) {
      filter.language = language;
    }

    const leaderboard = await LeaderboardTyping.findOne(filter).sort({ computedAt: -1 });

    if (!leaderboard) {
      return res.json({
        success: true,
        data: {
          boardType,
          language: language || null,
          rankings: [],
          computedAt: new Date()
        }
      });
    }

    return res.json({ success: true, data: leaderboard });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/koompi-typing/leaderboards/recompute
// Computes fresh ranking snapshots from GameSessionTyping documents
export const recomputeLeaderboard = async (req, res) => {
  try {
    const { boardType = 'global', language } = req.body;

    const matchStage = { passed: true };
    if (language) {
      matchStage.language = language;
    }

    // Weekly board filter
    let periodStart = null;
    let periodEnd = null;
    if (boardType === 'weekly') {
      const now = new Date();
      periodStart = new Date(now.setDate(now.getDate() - 7));
      periodEnd = new Date();
      matchStage.createdAt = { $gte: periodStart, $lte: periodEnd };
    }

    // Aggregation: Best score per user, where score = netWpm * (accuracyPct / 100)
    const aggregated = await GameSessionTyping.aggregate([
      { $match: matchStage },
      {
        $project: {
          userAccountId: 1,
          wpm: 1,
          netWpm: 1,
          accuracyPct: 1,
          score: {
            $multiply: [
              { $ifNull: ['$netWpm', '$wpm'] },
              { $divide: [{ $ifNull: ['$accuracyPct', 100] }, 100] }
            ]
          }
        }
      },
      {
        $sort: { score: -1 }
      },
      {
        $group: {
          _id: '$userAccountId',
          bestScore: { $first: '$score' },
          wpm: { $first: '$wpm' },
          accuracyPct: { $first: '$accuracyPct' }
        }
      },
      {
        $sort: { bestScore: -1 }
      },
      {
        $limit: 100
      }
    ]);

    // Populate user display names
    const rankings = [];
    let currentRank = 1;

    for (const item of aggregated) {
      const user = await UserAccount.findById(item._id).select('username');
      rankings.push({
        userAccountId: item._id,
        displayName: user?.username || 'Typing Champion',
        score: Math.round(item.bestScore * 10) / 10,
        wpm: item.wpm,
        accuracyPct: item.accuracyPct,
        rank: currentRank++
      });
    }

    const leaderboard = await LeaderboardTyping.findOneAndUpdate(
      {
        boardType,
        language: language || null,
        ...(periodStart ? { periodStart } : {})
      },
      {
        $set: {
          rankings,
          periodStart,
          periodEnd,
          computedAt: new Date()
        }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: 'Leaderboard recomputed successfully.',
      count: rankings.length,
      data: leaderboard
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
