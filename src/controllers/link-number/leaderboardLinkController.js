import GameSessionLink from '../../models/link-number/GameSessionLink.js';
import BoardProgress   from '../../models/link-number/BoardProgress.js';

// Helper to build a leaderboard from aggregation
const buildLeaderboard = async (matchStage, sortStage, limit = 20) => {
  return GameSessionLink.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$userAccountId',
        totalScore:       { $max: '$result.score' },
        totalStars:       { $sum: '$result.starRating' },
        boardsCompleted:  { $sum: { $cond: ['$result.puzzleSolved', 1, 0] } },
        averageTime:      { $avg: '$timing.durationSeconds' },
        fastestTime:      { $min: '$timing.durationSeconds' },
        perfectRuns:      { $sum: { $cond: [{ $eq: ['$result.starRating', 3] }, 1, 0] } }
      }
    },
    { $sort: sortStage },
    { $limit: limit },
    {
      $lookup: {
        from:         'userprofiles',
        localField:   '_id',
        foreignField: 'userAccountId',
        as:           'profile'
      }
    },
    {
      $project: {
        userAccountId: '$_id',
        displayName:   { $ifNull: [{ $arrayElemAt: ['$profile.displayName', 0] }, 'Unknown'] },
        totalScore:    1,
        totalStars:    1,
        boardsCompleted: 1,
        averageTime:   { $round: ['$averageTime', 0] },
        fastestTime:   1,
        perfectRuns:   1
      }
    }
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/leaderboards/global
// Overall ranking by total score across all completed sessions
// Query: limit
// ─────────────────────────────────────────────────────────────────────────────
export const getGlobalLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const rankings = await buildLeaderboard(
      { 'result.puzzleSolved': true },
      { totalScore: -1, totalStars: -1 },
      limit
    );

    const ranked = rankings.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    return res.status(200).json({ success: true, type: 'global', count: ranked.length, data: ranked });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/leaderboards/speed
// Ranking by fastest average solve time
// Query: limit
// ─────────────────────────────────────────────────────────────────────────────
export const getSpeedLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const rankings = await buildLeaderboard(
      { 'result.puzzleSolved': true, 'timing.durationSeconds': { $ne: null } },
      { fastestTime: 1, averageTime: 1 },
      limit
    );

    const ranked = rankings.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    return res.status(200).json({ success: true, type: 'speed', count: ranked.length, data: ranked });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/leaderboards/accuracy
// Ranking by perfect runs (3-star completions)
// Query: limit
// ─────────────────────────────────────────────────────────────────────────────
export const getAccuracyLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const rankings = await buildLeaderboard(
      { 'result.puzzleSolved': true },
      { perfectRuns: -1, totalStars: -1 },
      limit
    );

    const ranked = rankings.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    return res.status(200).json({ success: true, type: 'accuracy', count: ranked.length, data: ranked });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/leaderboards/difficulty/:diff
// Ranking within a specific difficulty tier
// Params: diff (easy|medium|hard|expert)
// Query: limit
// ─────────────────────────────────────────────────────────────────────────────
export const getByDifficultyLeaderboard = async (req, res) => {
  try {
    const { diff } = req.params;
    const allowed = ['easy', 'medium', 'hard', 'expert'];
    if (!allowed.includes(diff)) {
      return res.status(400).json({ success: false, message: `Invalid difficulty. Must be one of: ${allowed.join(', ')}` });
    }

    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const rankings = await buildLeaderboard(
      { difficulty: diff, 'result.puzzleSolved': true },
      { boardsCompleted: -1, totalStars: -1, averageTime: 1 },
      limit
    );

    const ranked = rankings.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    return res.status(200).json({
      success: true,
      type: 'by_difficulty',
      difficulty: diff,
      count: ranked.length,
      data: ranked
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
