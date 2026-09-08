import GameModeTyping from '../../models/koompi-typing/GameModeTyping.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// GET /api/koompi-typing/modes
export const getAllModes = async (_req, res) => {
  try {
    const cacheKey = 'typing:modes';
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const modes = await GameModeTyping.find();
    const body = { success: true, count: modes.length, data: modes };
    await set(cacheKey, body, TTL.LONG_STATIC);
    return res.json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/koompi-typing/modes/:modeKey
export const getModeByKey = async (req, res) => {
  try {
    const cacheKey = generateKey('typing', 'mode', req.params.modeKey);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const mode = await GameModeTyping.findOne({ modeKey: req.params.modeKey });
    if (!mode) {
      return res.status(404).json({ success: false, message: 'Game mode not found.' });
    }
    const body = { success: true, data: mode };
    await set(cacheKey, body, TTL.LONG_STATIC);
    return res.json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/koompi-typing/modes
export const createMode = async (req, res) => {
  try {
    const { modeKey, name, description, affectsLeaderboard } = req.body;
    if (!modeKey || !name || !description) {
      return res.status(400).json({ success: false, message: 'modeKey, name, and description are required.' });
    }

    const mode = await GameModeTyping.findOneAndUpdate(
      { modeKey },
      { $setOnInsert: { modeKey, name, description, affectsLeaderboard: affectsLeaderboard ?? true } },
      { upsert: true, returnDocument: 'after' }
    );

    await del('typing:modes');
    return res.status(201).json({ success: true, data: mode });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
