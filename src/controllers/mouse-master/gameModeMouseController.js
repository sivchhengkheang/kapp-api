import GameModeMouse from '../../models/mouse-master/GameModeMouse.js';
import { get, set, del, generateKey, TTL } from '../../utils/cache.js';

// ── GET /api/mouse-master/modes ───────────────────────────────────────────────
export const getAllModes = async (_req, res) => {
  try {
    const cacheKey = 'mouse:modes';
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const modes = await GameModeMouse.find().sort({ modeKey: 1 });
    const body = { success: true, count: modes.length, data: modes };
    await set(cacheKey, body, TTL.LONG_STATIC);
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/mouse-master/modes/:modeKey ──────────────────────────────────────
export const getModeByKey = async (req, res) => {
  try {
    const cacheKey = generateKey('mouse', 'mode', req.params.modeKey);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const mode = await GameModeMouse.findOne({ modeKey: req.params.modeKey });
    if (!mode) return res.status(404).json({ success: false, message: 'Game mode not found.' });

    const body = { success: true, data: mode };
    await set(cacheKey, body, TTL.LONG_STATIC);
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/mouse-master/modes ──────────────────────────────────────────────
export const createMode = async (req, res) => {
  try {
    const { modeKey } = req.body;
    if (!modeKey) return res.status(400).json({ success: false, message: 'modeKey is required.' });

    const mode = await GameModeMouse.findOneAndUpdate(
      { modeKey },
      { $setOnInsert: req.body },
      { upsert: true, returnDocument: 'after' }
    );

    await del('mouse:modes');
    return res.status(201).json({ success: true, data: mode });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Game mode already exists.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
