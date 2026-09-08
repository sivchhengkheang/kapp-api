import LeaderboardMouse from '../../models/mouse-master/LeaderboardMouse.js';
import GameSessionMouse from '../../models/mouse-master/GameSessionMouse.js';
import UserAccount from '../../models/shared/UserAccount.js';
import { get, set, delPattern, generateKey, TTL } from '../../utils/cache.js';

// ── GET /api/mouse-master/leaderboards ───────────────────────────────────────
// Query params: boardType (required), categoryKey, periodStart, limit
export const getLeaderboard = async (req, res) => {
  try {
    const { boardType = 'global', categoryKey, periodStart } = req.query;

    const cacheKey = generateKey('mouse', 'leaderboard', boardType, categoryKey || 'all');
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const filter = { boardType };
    if (categoryKey) filter.categoryKey = categoryKey;
    if (periodStart)  filter.periodStart = { $lte: new Date(periodStart) };

    const board = await LeaderboardMouse.findOne(filter)
      .sort({ computedAt: -1 });

    if (!board) return res.status(404).json({ success: false, message: 'Leaderboard not found.' });
    
    const body = { success: true, data: board };
    await set(cacheKey, body, TTL.LEADERBOARD);
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/mouse-master/leaderboards/recompute ────────────────────────────
// Recompute and store a fresh leaderboard snapshot
// score formula: accuracyPct * (1000 / avgReactionTimeMs)  [from schema doc]
export const recomputeLeaderboard = async (req, res) => {
  try {
    const { boardType = 'global', categoryKey = null, periodStart = null, periodEnd = null, limit = 100 } = req.body;

    // Build aggregation match stage
    const matchStage = { passed: true, avgReactionTimeMs: { $gt: 0 } };
    if (periodStart) matchStage.createdAt = { $gte: new Date(periodStart) };
    if (periodEnd)   matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(periodEnd) };

    // Aggregate best-per-user from game sessions
    const topSessions = await GameSessionMouse.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userAccountId',
          bestAccuracyPct:      { $max: '$accuracyPct' },
          bestAvgReactionTimeMs: { $min: '$avgReactionTimeMs' }
        }
      },
      {
        $addFields: {
          score: {
            $multiply: [
              '$bestAccuracyPct',
              { $divide: [1000, '$bestAvgReactionTimeMs'] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: Number(limit) }
    ]);

    // Populate display names from UserAccount
    const userIds = topSessions.map(s => s._id);
    const accounts = await UserAccount.find({ _id: { $in: userIds } }).select('username');
    const nameMap = Object.fromEntries(accounts.map(a => [a._id.toString(), a.username]));

    const rankings = topSessions.map((s, idx) => ({
      userAccountId:    s._id,
      displayName:      nameMap[s._id.toString()] || 'Unknown',
      score:            Math.round(s.score * 100) / 100,
      avgReactionTimeMs:Math.round(s.bestAvgReactionTimeMs),
      accuracyPct:      Math.round(s.bestAccuracyPct * 10) / 10,
      rank:             idx + 1
    }));

    const board = await LeaderboardMouse.findOneAndUpdate(
      { boardType, categoryKey: categoryKey || null, periodStart: periodStart ? new Date(periodStart) : null },
      { $set: { rankings, computedAt: new Date(), periodEnd: periodEnd ? new Date(periodEnd) : null } },
      { returnDocument: 'after', upsert: true }
    );

    await delPattern('mouse:leaderboard:*');
    return res.status(200).json({ success: true, count: rankings.length, data: board });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
