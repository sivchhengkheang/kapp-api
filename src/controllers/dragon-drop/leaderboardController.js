import LeaderboardDragon from '../../models/dragon-drop/Leaderboard.js';
import { get, set, generateKey, TTL } from '../../utils/cache.js';

export const getGlobalLeaderboard = async (req, res) => {
  try {
    const cacheKey = 'dragon:leaderboard:global';
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const leaderboards = await LeaderboardDragon.find({ boardType: 'global' }).sort({ rank: 1 }).limit(100);
    const body = { success: true, data: leaderboards };
    await set(cacheKey, body, TTL.LEADERBOARD);
    res.status(200).json(body);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStarsLeaderboard = async (req, res) => {
  try {
    const cacheKey = 'dragon:leaderboard:stars';
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const leaderboards = await LeaderboardDragon.find({ boardType: 'stars' }).sort({ rank: 1 }).limit(100);
    const body = { success: true, data: leaderboards };
    await set(cacheKey, body, TTL.LEADERBOARD);
    res.status(200).json(body);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWorldLeaderboard = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'leaderboard', 'world', req.params.world);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const leaderboards = await LeaderboardDragon.find({
      boardType: 'by_world',
      worldNumber: req.params.world
    }).sort({ rank: 1 }).limit(100);
    const body = { success: true, data: leaderboards };
    await set(cacheKey, body, TTL.LEADERBOARD);
    res.status(200).json(body);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLevelLeaderboard = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'leaderboard', 'level', req.params.level);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const leaderboards = await LeaderboardDragon.find({
      boardType: 'by_level',
      levelNumber: req.params.level
    }).sort({ rank: 1 }).limit(100);
    const body = { success: true, data: leaderboards };
    await set(cacheKey, body, TTL.LEADERBOARD);
    res.status(200).json(body);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
