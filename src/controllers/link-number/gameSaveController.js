import GameSave from '../../models/link-number/GameSave.js';
import { getRequestUserId } from '../../utils/userHelper.js';
import { get, set, del, generateKey, TTL } from '../../utils/cache.js';

// ── GET /api/link-number/save ─────────────────────────────────────────────────
export const getSave = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Authorization Bearer token or userId.'
      });
    }

    const cacheKey = generateKey('link', 'save', String(userId));
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const save = await GameSave.findOne({ userId }).lean();
    if (!save) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No active save found.'
      });
    }

    const response = {
      success: true,
      data: {
        levelId: save.levelId,
        paths: save.paths,
        elapsedSeconds: save.elapsedSeconds,
        updatedAt: save.updatedAt
      }
    };

    await set(cacheKey, response, TTL.PUZZLE_DETAIL || 300);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT /api/link-number/save ─────────────────────────────────────────────────
export const saveGame = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Authorization Bearer token or userId.'
      });
    }

    const { levelId, paths = [], elapsedSeconds = 0 } = req.body;
    if (levelId === undefined || levelId === null) {
      return res.status(400).json({ success: false, message: 'levelId is required.' });
    }

    const save = await GameSave.findOneAndUpdate(
      { userId },
      {
        $set: {
          levelId: Number(levelId),
          paths,
          elapsedSeconds: Number(elapsedSeconds) || 0,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    const cacheKey = generateKey('link', 'save', String(userId));
    await del(cacheKey);

    return res.status(200).json({
      success: true,
      message: 'Game progress saved successfully.',
      data: {
        levelId: save.levelId,
        pathsCount: save.paths.length,
        elapsedSeconds: save.elapsedSeconds,
        updatedAt: save.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/link-number/save ──────────────────────────────────────────────
export const deleteSave = async (req, res) => {
  try {
    const userId = getRequestUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Provide Authorization Bearer token or userId.'
      });
    }

    await GameSave.deleteOne({ userId });
    await del(generateKey('link', 'save', String(userId)));

    return res.status(200).json({
      success: true,
      message: 'Active save cleared successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
