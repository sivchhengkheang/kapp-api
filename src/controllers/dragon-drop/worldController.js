import WorldDragon from '../../models/dragon-drop/World.js';
import LevelDragon from '../../models/dragon-drop/Level.js';

export const getWorlds = async (req, res) => {
  try {
    const worlds = await WorldDragon.find({ 'status.isPublished': true }).sort({ worldNumber: 1 });
    res.status(200).json({ success: true, data: worlds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorldByNumber = async (req, res) => {
  try {
    const world = await WorldDragon.findOne({ worldNumber: req.params.worldNumber });
    if (!world) return res.status(404).json({ success: false, message: 'World not found' });
    res.status(200).json({ success: true, data: world });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorldLevels = async (req, res) => {
  try {
    const levels = await LevelDragon.find({ 
      worldNumber: req.params.worldNumber,
      'status.isPublished': true 
    }).sort({ levelNumber: 1 });
    res.status(200).json({ success: true, data: levels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
