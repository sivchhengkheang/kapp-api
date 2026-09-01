import MouseLevel from '../../models/mouse-master/MouseLevel.js';

// ── GET /api/mouse-master/levels ──────────────────────────────────────────────
// Optional query: ?categoryId=&difficulty=&page=&limit=
export const getAllLevels = async (req, res) => {
  try {
    const { categoryId, difficulty, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (difficulty)  filter.difficulty = Number(difficulty);

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      MouseLevel.find(filter)
        .sort({ categoryId: 1, levelNumber: 1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('categoryId', 'categoryKey name order'),
      MouseLevel.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true, count: data.length, total,
      page: Number(page), pages: Math.ceil(total / Number(limit)), data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/mouse-master/levels/:id ─────────────────────────────────────────
export const getLevelById = async (req, res) => {
  try {
    const level = await MouseLevel.findById(req.params.id)
      .populate('categoryId', 'categoryKey name icon unlockRequirement');
    if (!level) return res.status(404).json({ success: false, message: 'Level not found.' });
    return res.status(200).json({ success: true, data: level });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/mouse-master/levels/category/:categoryKey ───────────────────────
// Fetch all levels for a given skill category (ordered for level-select screen)
export const getLevelsByCategory = async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const levels = await MouseLevel.find()
      .populate({
        path: 'categoryId',
        match: { categoryKey },
        select: 'categoryKey name order'
      })
      .sort({ levelNumber: 1 });

    // Filter out levels where populate didn't match
    const filtered = levels.filter(l => l.categoryId !== null);
    return res.status(200).json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/mouse-master/levels ─────────────────────────────────────────────
export const createLevel = async (req, res) => {
  try {
    const level = await MouseLevel.create(req.body);
    return res.status(201).json({ success: true, data: level });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/mouse-master/levels/:id ───────────────────────────────────────
export const updateLevel = async (req, res) => {
  try {
    const level = await MouseLevel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!level) return res.status(404).json({ success: false, message: 'Level not found.' });
    return res.status(200).json({ success: true, data: level });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/mouse-master/levels/:id ──────────────────────────────────────
export const deleteLevel = async (req, res) => {
  try {
    const level = await MouseLevel.findByIdAndDelete(req.params.id);
    if (!level) return res.status(404).json({ success: false, message: 'Level not found.' });
    return res.status(200).json({ success: true, message: 'Level deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
