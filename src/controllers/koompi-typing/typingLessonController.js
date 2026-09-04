import TypingLesson from '../../models/koompi-typing/TypingLesson.js';
import TypingUnit from '../../models/koompi-typing/TypingUnit.js';
import LessonContentItem from '../../models/koompi-typing/LessonContentItem.js';

// GET /api/koompi-typing/lessons
export const getAllLessons = async (req, res) => {
  try {
    const { unitId, language, difficulty, lessonType } = req.query;
    const filter = {};
    if (unitId) filter.unitId = unitId;
    if (language) filter.language = language;
    if (difficulty) filter.difficulty = Number(difficulty);
    if (lessonType) filter.lessonType = lessonType;

    const lessons = await TypingLesson.find(filter).sort({ order: 1 });
    return res.json({ success: true, count: lessons.length, data: lessons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/koompi-typing/lessons/:id
export const getLessonById = async (req, res) => {
  try {
    const lesson = await TypingLesson.findById(req.params.id).populate('unitId', 'unitNumber title theme');
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Typing lesson not found.' });
    }

    const contentItems = await LessonContentItem.find({ lessonId: lesson._id }).sort({ order: 1 });
    return res.json({
      success: true,
      data: {
        ...lesson.toObject(),
        contentItems
      }
    });
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

    const lesson = await TypingLesson.create({
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
    });

    await TypingUnit.findByIdAndUpdate(unitId, { $inc: { lessonCount: 1 } });

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

    return res.json({ success: true, message: 'Lesson and associated content items deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
