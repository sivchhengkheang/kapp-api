import Leaderboard from '../../models/shared/Leaderboard.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// POST /api/shared/leaderboard
// Create or upsert a leaderboard entry for a user
export const upsertLeaderboardEntry = async (req, res) => {
  try {
    const { userId, boardType, period, category, ...rest } = req.body;

    if (!userId || !boardType || !period) {
      return res.status(400).json({
        success: false,
        message: 'userId, boardType, and period are required.',
      });
    }

    const entry = await Leaderboard.findOneAndUpdate(
      { userId, boardType, period, category: category ?? null },
      { $set: { userId, boardType, period, category: category ?? null, ...rest } },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    await delPattern('shared:leaderboard:*');
    return res.status(200).json({ success: true, data: entry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/shared/leaderboard
// Query with optional filters: boardType, period, category, limit
export const getLeaderboard = async (req, res) => {
  try {
    const { boardType, period, category, limit = 50 } = req.query;

    const cacheKey = generateKey('shared', 'leaderboard', boardType || 'all', period || 'all', category || 'all', limit);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const filter = {};
    if (boardType) filter.boardType = boardType;
    if (period) filter.period = period;
    if (category !== undefined) filter.category = category === 'null' ? null : category;

    const entries = await Leaderboard.find(filter)
      .sort({ rank: 1 })
      .limit(Number(limit));

    const body = { success: true, count: entries.length, data: entries };
    await set(cacheKey, body, TTL.LEADERBOARD);
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/shared/leaderboard/user/:userId
// Get all leaderboard entries for a specific user
export const getLeaderboardByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const entries = await Leaderboard.find({ userId }).sort({ period: 1, boardType: 1 });

    if (!entries.length) {
      return res.status(404).json({ success: false, message: 'No leaderboard entries found for this user.' });
    }

    return res.status(200).json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/shared/leaderboard/:id
// Get a single leaderboard entry by its document ID
export const getLeaderboardById = async (req, res) => {
  try {
    const entry = await Leaderboard.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Leaderboard entry not found.' });
    }

    return res.status(200).json({ success: true, data: entry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/shared/leaderboard/:id
// Update specific fields of a leaderboard entry
export const updateLeaderboardEntry = async (req, res) => {
  try {
    const entry = await Leaderboard.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Leaderboard entry not found.' });
    }

    await delPattern('shared:leaderboard:*');
    return res.status(200).json({ success: true, data: entry });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/shared/leaderboard/:id
// Remove a leaderboard entry
export const deleteLeaderboardEntry = async (req, res) => {
  try {
    const entry = await Leaderboard.findByIdAndDelete(req.params.id);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Leaderboard entry not found.' });
    }

    await delPattern('shared:leaderboard:*');
    return res.status(200).json({ success: true, message: 'Leaderboard entry deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
