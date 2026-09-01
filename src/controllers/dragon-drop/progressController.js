import LevelProgressDragon from '../../models/dragon-drop/LevelProgress.js';
import WorldProgressDragon from '../../models/dragon-drop/WorldProgress.js';
import UserStatistic from '../../models/shared/UserStatistic.js';

export const getOverallProgress = async (req, res) => {
  try {
    const userStats = await UserStatistic.findOne({ userAccountId: req.query.userAccountId });
    if (!userStats) return res.status(404).json({ success: false, message: 'Stats not found' });
    res.status(200).json({ success: true, data: userStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorldProgress = async (req, res) => {
  try {
    const progress = await WorldProgressDragon.findOne({ 
      userAccountId: req.query.userAccountId,
      worldNumber: req.params.world 
    });
    if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLevelProgress = async (req, res) => {
  try {
    const progress = await LevelProgressDragon.findOne({ 
      userAccountId: req.query.userAccountId,
      levelNumber: req.params.level 
    });
    if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCollectedMapPieces = async (req, res) => {
  try {
    const levelProgresses = await LevelProgressDragon.find({ userAccountId: req.query.userAccountId });
    const collectedPieces = levelProgresses.flatMap(p => p.mapPiecesCollected);
    res.status(200).json({ success: true, data: collectedPieces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMapPiecesByWorld = async (req, res) => {
  try {
    const levelProgresses = await LevelProgressDragon.find({ 
      userAccountId: req.query.userAccountId,
      worldNumber: req.params.world
    });
    const collectedPieces = levelProgresses.flatMap(p => p.mapPiecesCollected);
    res.status(200).json({ success: true, data: collectedPieces });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
