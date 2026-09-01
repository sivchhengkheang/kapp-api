import SkillCategoryMouse from '../../models/mouse-master/SkillCategoryMouse.js';

// ── GET /api/mouse-master/categories ─────────────────────────────────────────
export const getAllCategories = async (_req, res) => {
  try {
    const categories = await SkillCategoryMouse.find().sort({ order: 1 });
    return res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/mouse-master/categories/:categoryKey ────────────────────────────
export const getCategoryByKey = async (req, res) => {
  try {
    const category = await SkillCategoryMouse.findOne({ categoryKey: req.params.categoryKey });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
    return res.status(200).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/mouse-master/categories ────────────────────────────────────────
export const createCategory = async (req, res) => {
  try {
    const category = await SkillCategoryMouse.create(req.body);
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
