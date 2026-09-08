import LevelProgressDragon from '../../models/dragon-drop/LevelProgress.js';
import WorldProgressDragon from '../../models/dragon-drop/WorldProgress.js';
import UserStatistic from '../../models/shared/UserStatistic.js';
import { get, set, generateKey, TTL } from '../../utils/cache.js';

export const getOverallProgress = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'overall-progress', req.query.userAccountId);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const userStats = await UserStatistic.findOne({ userAccountId: req.query.userAccountId });
    if (!userStats) return res.status(404).json({ success: false, message: 'Stats not found' });

    const responseData = { success: true, data: userStats };
    await set(cacheKey, responseData, TTL.USER_STATS);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorldProgress = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'world-progress', req.query.userAccountId, req.params.world);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const progress = await WorldProgressDragon.findOne({ 
      userAccountId: req.query.userAccountId,
      worldNumber: req.params.world 
    });
    if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });

    const responseData = { success: true, data: progress };
    await set(cacheKey, responseData, TTL.USER_STATS);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLevelProgress = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'level-progress', req.query.userAccountId, req.params.level);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const progress = await LevelProgressDragon.findOne({ 
      userAccountId: req.query.userAccountId,
      levelNumber: req.params.level 
    });
    if (!progress) return res.status(404).json({ success: false, message: 'Progress not found' });

    const responseData = { success: true, data: progress };
    await set(cacheKey, responseData, TTL.USER_STATS);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getCollectedMapPieces = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'map-pieces-collected', req.query.userAccountId);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const levelProgresses = await LevelProgressDragon.find({ userAccountId: req.query.userAccountId });
    const collectedPieces = levelProgresses.flatMap(p => p.mapPiecesCollected);

    const responseData = { success: true, data: collectedPieces };
    await set(cacheKey, responseData, TTL.USER_STATS);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMapPiecesByWorld = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'world-map-pieces', req.query.userAccountId, req.params.world);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const levelProgresses = await LevelProgressDragon.find({ 
      userAccountId: req.query.userAccountId,
      worldNumber: req.params.world
    });
    const collectedPieces = levelProgresses.flatMap(p => p.mapPiecesCollected);

    const responseData = { success: true, data: collectedPieces };
    await set(cacheKey, responseData, TTL.USER_STATS);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
