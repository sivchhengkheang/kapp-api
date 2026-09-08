import LevelProgressDragon from '../../models/dragon-drop/LevelProgress.js';
import { get, set, generateKey, TTL } from '../../utils/cache.js';

// GET /api/dragon-drop/map-pieces/collected
export const getCollectedMapPieces = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'map-pieces-all', req.query.userAccountId);
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

// GET /api/dragon-drop/map-pieces/world/:world
export const getMapPiecesByWorld = async (req, res) => {
  try {
    const cacheKey = generateKey('dragon', 'map-pieces-world', req.query.userAccountId, req.params.world);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const levelProgresses = await LevelProgressDragon.find({
      userAccountId: req.query.userAccountId,
      worldNumber: Number(req.params.world)
    });
    const collectedPieces = levelProgresses.flatMap(p => p.mapPiecesCollected);
    const responseData = { success: true, data: collectedPieces };

    await set(cacheKey, responseData, TTL.USER_STATS);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
