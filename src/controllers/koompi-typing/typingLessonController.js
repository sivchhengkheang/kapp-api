import TypingLesson from '../../models/koompi-typing/TypingLesson.js';
import TypingUnit from '../../models/koompi-typing/TypingUnit.js';
import LessonContentItem from '../../models/koompi-typing/LessonContentItem.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// GET /api/koompi-typing/lessons
export const getAllLessons = async (req, res) => {
  try {
    const { unitId, language, difficulty, lessonType } = req.query;
    const filter = {};
    if (unitId) filter.unitId = unitId;
    if (language) filter.language = language;
    if (difficulty) filter.difficulty = Number(difficulty);
    if (lessonType) filter.lessonType = lessonType;

    const cacheKey = generateKey('typing', 'lessons', unitId || 'all', language || '', difficulty || '', lessonType || '');
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const lessons = await TypingLesson.find(filter).sort({ order: 1 });
    const body = { success: true, count: lessons.length, data: lessons };
    await set(cacheKey, body, TTL.STATIC);
    return res.json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/koompi-typing/lessons/:id
export const getLessonById = async (req, res) => {
  try {
    const cacheKey = generateKey('typing', 'lesson', req.params.id);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const lesson = await TypingLesson.findById(req.params.id).populate('unitId', 'unitNumber title theme');
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Typing lesson not found.' });
    }

    const contentItems = await LessonContentItem.find({ lessonId: lesson._id }).sort({ order: 1 });
    const body = { success: true, data: { ...lesson.toObject(), contentItems } };
    await set(cacheKey, body, TTL.STATIC);
    return res.json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/koompi-typing/lessons
export const createLesson = async (req, res) => {
  try {
    const {
      unitId,
      lessonNumber,
      language,
      lessonType,
      title,
      targetKeys,
      difficulty,
      contentItemCount,
      passThreshold,
      xpReward,
      order
    } = req.body;

    if (!unitId || !lessonNumber || !title) {
      return res.status(400).json({ success: false, message: 'unitId, lessonNumber, and title are required.' });
    }

    const unit = await TypingUnit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Parent TypingUnit not found.' });
    }

    const lesson = await TypingLesson.findOneAndUpdate(
      { unitId, lessonNumber },
      {
        $setOnInsert: {
          unitId,
          lessonNumber,
          language: language || unit.language || 'en',
          lessonType: lessonType || 'letters',
          title,
          targetKeys: targetKeys || [],
          difficulty: difficulty ?? 1,
          contentItemCount: contentItemCount ?? 0,
          passThreshold,
          xpReward: xpReward ?? 30,
          order: order ?? lessonNumber
        }
      },
      { upsert: true, returnDocument: 'after' }
    );

    await TypingUnit.findByIdAndUpdate(unitId, { $inc: { lessonCount: 1 } });
    await delPattern('typing:lessons:*');
    return res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/koompi-typing/lessons/:id
export const updateLesson = async (req, res) => {
  try {
    const updated = await TypingLesson.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Typing lesson not found.' });
    }
    await del(generateKey('typing', 'lesson', req.params.id));
    await delPattern('typing:lessons:*');
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/koompi-typing/lessons/:id
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await TypingLesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Typing lesson not found.' });
    }

    await TypingUnit.findByIdAndUpdate(lesson.unitId, { $inc: { lessonCount: -1 } });
    await LessonContentItem.deleteMany({ lessonId: lesson._id });
    await del(generateKey('typing', 'lesson', req.params.id));
    await delPattern('typing:lessons:*');
    return res.json({ success: true, message: 'Lesson and associated content items deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
