import SkillCategoryMouse from '../../models/mouse-master/SkillCategoryMouse.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// ── GET /api/mouse-master/categories ─────────────────────────────────────────────
export const getAllCategories = async (_req, res) => {
  try {
    const cacheKey = 'mouse:categories';
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const categories = await SkillCategoryMouse.find().sort({ order: 1 });
    const body = { success: true, count: categories.length, data: categories };
    await set(cacheKey, body, TTL.LONG_STATIC);
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/mouse-master/categories/:categoryKey ────────────────────────────────
export const getCategoryByKey = async (req, res) => {
  try {
    const cacheKey = generateKey('mouse', 'category', req.params.categoryKey);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const category = await SkillCategoryMouse.findOne({ categoryKey: req.params.categoryKey });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });

    const body = { success: true, data: category };
    await set(cacheKey, body, TTL.LONG_STATIC);
    return res.status(200).json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/mouse-master/categories ─────────────────────────────────────────────
export const createCategory = async (req, res) => {
  try {
    const { categoryKey, name, description, icon, order, levelRange } = req.body;
    if (!categoryKey || !name) {
      return res.status(400).json({ success: false, message: 'categoryKey and name are required.' });
    }

    const category = await SkillCategoryMouse.findOneAndUpdate(
      { categoryKey },
      {
        $setOnInsert: {
          categoryKey,
          name,
          description: description || '',
          icon: icon || '',
          order: order ?? 1,
          levelRange: {
            start: levelRange?.start ?? 1,
            end: levelRange?.end ?? 10
          }
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    await delPattern('mouse:categor*');
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
