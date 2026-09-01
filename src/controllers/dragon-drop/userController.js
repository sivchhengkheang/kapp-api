import LevelProgressDragon from '../../models/dragon-drop/LevelProgress.js';
import WorldProgressDragon from '../../models/dragon-drop/WorldProgress.js';
import UserStatistic from '../../models/shared/UserStatistic.js';

// GET /api/dragon-drop/users/progress
export const getOverallProgress = async (req, res) => {
  try {
    const worldProgresses = await WorldProgressDragon.find({ userAccountId: req.query.userAccountId });
    res.status(200).json({ success: true, data: worldProgresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dragon-drop/users/world-progress/:world
export const getWorldProgress = async (req, res) => {
  try {
    const progress = await WorldProgressDragon.findOne({
      userAccountId: req.query.userAccountId,
      worldNumber: Number(req.params.world)
    });
    if (!progress) return res.status(404).json({ success: false, message: 'World progress not found' });
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dragon-drop/users/level-progress/:level
export const getLevelProgress = async (req, res) => {
  try {
    const progress = await LevelProgressDragon.findOne({
      userAccountId: req.query.userAccountId,
      levelNumber: Number(req.params.level)
    });
    if (!progress) return res.status(404).json({ success: false, message: 'Level progress not found' });
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dragon-drop/users/statistics
export const getUserStatistics = async (req, res) => {
  try {
    const stats = await UserStatistic.findOne({ userAccountId: req.query.userAccountId });
    if (!stats) return res.status(404).json({ success: false, message: 'Statistics not found' });
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
