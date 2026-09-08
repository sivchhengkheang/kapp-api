import TypingUnit from '../../models/koompi-typing/TypingUnit.js';
import TypingLesson from '../../models/koompi-typing/TypingLesson.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// GET /api/koompi-typing/units
export const getAllUnits = async (req, res) => {
  try {
    const { language } = req.query;
    const filter = {};
    if (language) filter.language = language;

    const cacheKey = generateKey('typing', 'units', language || 'all');
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const units = await TypingUnit.find(filter).sort({ order: 1 });
    const body = { success: true, count: units.length, data: units };
    await set(cacheKey, body, TTL.STATIC);
    return res.json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/koompi-typing/units/:id
export const getUnitById = async (req, res) => {
  try {
    const cacheKey = generateKey('typing', 'unit', req.params.id);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const unit = await TypingUnit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Typing unit not found.' });
    }

    const lessons = await TypingLesson.find({ unitId: unit._id }).sort({ order: 1 });
    const body = { success: true, data: { ...unit.toObject(), lessons } };
    await set(cacheKey, body, TTL.STATIC);
    return res.json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/koompi-typing/units
export const createUnit = async (req, res) => {
  try {
    const { unitNumber, language, title, description, theme, order, unlockRequirement, lessonCount } = req.body;
    if (!unitNumber || !title) {
      return res.status(400).json({ success: false, message: 'unitNumber and title are required.' });
    }

    const lang = language || 'en';
    const newUnit = await TypingUnit.findOneAndUpdate(
      { unitNumber, language: lang },
      {
        $setOnInsert: {
          unitNumber,
          language: lang,
          title,
          description,
          theme,
          order: order ?? unitNumber,
          unlockRequirement,
          lessonCount: lessonCount ?? 0,
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    await delPattern('typing:units:*');
    return res.status(201).json({ success: true, data: newUnit });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/koompi-typing/units/:id
export const updateUnit = async (req, res) => {
  try {
    const updated = await TypingUnit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Typing unit not found.' });
    }
    await del(generateKey('typing', 'unit', req.params.id));
    await delPattern('typing:units:*');
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/koompi-typing/units/:id
export const deleteUnit = async (req, res) => {
  try {
    const unit = await TypingUnit.findByIdAndDelete(req.params.id);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Typing unit not found.' });
    }
    await TypingLesson.deleteMany({ unitId: req.params.id });
    await del(generateKey('typing', 'unit', req.params.id));
    await delPattern('typing:units:*');
    return res.json({ success: true, message: 'Typing unit and associated lessons deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
