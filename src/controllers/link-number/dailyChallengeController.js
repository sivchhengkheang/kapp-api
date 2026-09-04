import DailyChallenge from '../../models/link-number/DailyChallenge.js';

// Helper: Returns today's UTC date at midnight (for date-keyed lookup)
const todayUTC = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/daily/today
// Get today's daily challenge
// ─────────────────────────────────────────────────────────────────────────────
export const getTodaysChallenge = async (req, res) => {
  try {
    const today = todayUTC();
    const challenge = await DailyChallenge.findOne({ date: today })
      .populate('puzzle.boardId', 'boardNumber title difficulty gridSize grid hints rewards');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'No daily challenge has been set for today yet.'
      });
    }

    return res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/daily/history
// Paginated list of past daily challenges
// Query: page, limit
// ─────────────────────────────────────────────────────────────────────────────
export const getDailyChallengeHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const today = todayUTC();
    const filter = { date: { $lt: today } }; // Exclude today (it's current, not "history")

    const [data, total] = await Promise.all([
      DailyChallenge.find(filter)
        .select('date challengeNumber title puzzle stats rewards')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      DailyChallenge.countDocuments(filter)
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
// GET /api/link-number/daily/leaderboard
// Get today's daily challenge leaderboard snapshot
// ─────────────────────────────────────────────────────────────────────────────
export const getDailyLeaderboard = async (req, res) => {
  try {
    const today = todayUTC();
    const challenge = await DailyChallenge.findOne({ date: today })
      .select('date challengeNumber title dailyLeaderboard stats');

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'No daily challenge found for today.'
      });
    }

    return res.status(200).json({
      success: true,
      date: challenge.date,
      challengeNumber: challenge.challengeNumber,
      leaderboard: challenge.dailyLeaderboard,
      stats: challenge.stats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/link-number/daily (admin)
// Create a new daily challenge
// Body: DailyChallenge fields
// ─────────────────────────────────────────────────────────────────────────────
export const createDailyChallenge = async (req, res) => {
  try {
    const challenge = await DailyChallenge.create(req.body);
    return res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A daily challenge already exists for this date.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
