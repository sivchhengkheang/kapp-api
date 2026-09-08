import Level from '../../models/robot-brainiac/Level.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// ── GET /api/robot-brainiac/levels ─────────────────────────────────────────────
export const getLevels = async (req, res) => {
  try {
    const {
      difficulty, category, isPublished, isFeatured,
      page = 1, limit = 20,
    } = req.query;

    const cacheKey = generateKey('robot', 'levels', difficulty || '', category || '', isPublished || '', isFeatured || '', page, limit);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (isPublished !== undefined) filter['status.isPublished'] = isPublished === 'true';
    if (isFeatured !== undefined) filter['status.isFeatured'] = isFeatured === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Level.find(filter).sort({ levelNumber: 1 }).skip(skip).limit(Number(limit)),
      Level.countDocuments(filter),
    ]);

    const body = {
      success: true,
      count: data.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data,
    };
    await set(cacheKey, body, TTL.STATIC);
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/robot-brainiac/levels/next/:userLevel ────────────────────────────
export const getNextLevel = async (req, res) => {
  try {
    const userLevel = Number(req.params.userLevel) || 1;

    // Find the lowest-numbered published level at or near user's level
    const level = await Level.findOne({
      'status.isPublished': true,
      recommendedLevel: { $lte: userLevel + 3 },
    }).sort({ levelNumber: 1 });

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'No next level found. You may have completed all available levels!',
      });
    }

    return res.status(200).json({ success: true, data: level });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/robot-brainiac/levels ───────────────────────────────────────────
export const createLevel = async (req, res) => {
  try {
    const levelData = { ...req.body };
    if (!levelData.solution) {
      levelData.solution = { optimalMoves: 5 };
    } else if (levelData.solution.optimalMoves === undefined) {
      levelData.solution.optimalMoves = 5;
    }

    const { levelNumber } = levelData;
    if (levelNumber !== undefined) {
      const existing = await Level.findOne({ levelNumber });
      if (existing) {
        return res.status(409).json({ success: false, message: 'Level number already exists.' });
      }
    }

    const level = await Level.create(levelData);
    await delPattern('robot:level*');
    return res.status(201).json({ success: true, data: level });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Level number already exists.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/robot-brainiac/levels/:id ────────────────────────────────────────
export const getLevelById = async (req, res) => {
  try {
    const cacheKey = generateKey('robot', 'level', req.params.id);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const level = await Level.findById(req.params.id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found.' });

    const body = { success: true, data: level };
    await set(cacheKey, body, TTL.STATIC);
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/robot-brainiac/levels/:id ──────────────────────────────────────
export const updateLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!level) return res.status(404).json({ success: false, message: 'Level not found.' });
    await del(generateKey('robot', 'level', req.params.id));
    await delPattern('robot:levels:*');
    return res.status(200).json({ success: true, data: level });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/robot-brainiac/levels/:id/stats ────────────────────────────────
// Atomically increment stats — call this after each attempt/session
export const incrementLevelStats = async (req, res) => {
  try {
    const increments = {};
    for (const [key, value] of Object.entries(req.body)) {
      increments[key] = Number(value);
    }

    const level = await Level.findByIdAndUpdate(
      req.params.id,
      { $inc: increments },
      { returnDocument: 'after' }
    );
    if (!level) return res.status(404).json({ success: false, message: 'Level not found.' });
    await del(generateKey('robot', 'level', req.params.id));
    await delPattern('robot:levels:*');
    return res.status(200).json({ success: true, data: level });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/robot-brainiac/levels/:id ─────────────────────────────────────
export const deleteLevel = async (req, res) => {
  try {
    const level = await Level.findByIdAndDelete(req.params.id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found.' });
    await del(generateKey('robot', 'level', req.params.id));
    await delPattern('robot:levels:*');
    return res.status(200).json({ success: true, message: 'Level deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
