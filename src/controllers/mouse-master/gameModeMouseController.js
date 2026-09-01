import GameModeMouse from '../../models/mouse-master/GameModeMouse.js';

// ── GET /api/mouse-master/modes ───────────────────────────────────────────────
export const getAllModes = async (_req, res) => {
  try {
    const modes = await GameModeMouse.find().sort({ modeKey: 1 });
    return res.status(200).json({ success: true, count: modes.length, data: modes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/mouse-master/modes/:modeKey ──────────────────────────────────────
export const getModeByKey = async (req, res) => {
  try {
    const mode = await GameModeMouse.findOne({ modeKey: req.params.modeKey });
    if (!mode) return res.status(404).json({ success: false, message: 'Game mode not found.' });
    return res.status(200).json({ success: true, data: mode });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/mouse-master/modes ──────────────────────────────────────────────
export const createMode = async (req, res) => {
  try {
    const mode = await GameModeMouse.create(req.body);
    return res.status(201).json({ success: true, data: mode });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
