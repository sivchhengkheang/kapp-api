import LevelProgressDragon from '../../models/dragon-drop/LevelProgress.js';
import WorldProgressDragon from '../../models/dragon-drop/WorldProgress.js';
import UserStatistic from '../../models/shared/UserStatistic.js';
import { get, set, generateKey, TTL } from '../../utils/cache.js';

// GET /api/dragon-drop/users/progress
export const getOverallProgress = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'user-overall-progress', req.query.userAccountId);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const worldProgresses = await WorldProgressDragon.find({ userAccountId: req.query.userAccountId });
    const responseData = { success: true, data: worldProgresses };

    await set(cacheKey, responseData, TTL.USER_STATS);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dragon-drop/users/world-progress/:world
export const getWorldProgress = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'user-world-progress', req.query.userAccountId, req.params.world);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const progress = await WorldProgressDragon.findOne({
      userAccountId: req.query.userAccountId,
      worldNumber: Number(req.params.world)
    });
    if (!progress) return res.status(404).json({ success: false, message: 'World progress not found' });

    const responseData = { success: true, data: progress };
    await set(cacheKey, responseData, TTL.USER_STATS);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dragon-drop/users/level-progress/:level
export const getLevelProgress = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'user-level-progress', req.query.userAccountId, req.params.level);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const progress = await LevelProgressDragon.findOne({
      userAccountId: req.query.userAccountId,
      levelNumber: Number(req.params.level)
    });
    if (!progress) return res.status(404).json({ success: false, message: 'Level progress not found' });

    const responseData = { success: true, data: progress };
    await set(cacheKey, responseData, TTL.USER_STATS);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dragon-drop/users/statistics
export const getUserStatistics = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'user-stats', req.query.userAccountId);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const stats = await UserStatistic.findOne({ userAccountId: req.query.userAccountId });
    if (!stats) return res.status(404).json({ success: false, message: 'Statistics not found' });

    const responseData = { success: true, data: stats };
    await set(cacheKey, responseData, TTL.USER_STATS);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
