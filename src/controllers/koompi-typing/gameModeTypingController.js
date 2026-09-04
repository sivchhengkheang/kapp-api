import GameModeTyping from '../../models/koompi-typing/GameModeTyping.js';

// GET /api/koompi-typing/modes
export const getAllModes = async (_req, res) => {
  try {
    const modes = await GameModeTyping.find();
    return res.json({ success: true, count: modes.length, data: modes });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/koompi-typing/modes/:modeKey
export const getModeByKey = async (req, res) => {
  try {
    const mode = await GameModeTyping.findOne({ modeKey: req.params.modeKey });
    if (!mode) {
      return res.status(404).json({ success: false, message: 'Game mode not found.' });
    }
    return res.json({ success: true, data: mode });
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

    const mode = await GameModeTyping.create({
      modeKey,
      name,
      description,
      affectsLeaderboard: affectsLeaderboard ?? true
    });

    return res.status(201).json({ success: true, data: mode });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
