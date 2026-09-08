import LessonContentItem from '../../models/koompi-typing/LessonContentItem.js';
import TypingLesson from '../../models/koompi-typing/TypingLesson.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// GET /api/koompi-typing/content-items
// Supports query: ?lessonId=...
export const getContentItems = async (req, res) => {
  try {
    const cacheKey = generateKey('typing', 'content-items', req.query);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const { lessonId, language } = req.query;
    const filter = {};
    if (lessonId) filter.lessonId = lessonId;
    if (language) filter.language = language;

    const items = await LessonContentItem.find(filter).sort({ order: 1 });
    const responseData = { success: true, count: items.length, data: items };

    await set(cacheKey, responseData, TTL.STATIC);
    return res.json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/koompi-typing/content-items/:id
export const getContentItemById = async (req, res) => {
  try {
    const cacheKey = generateKey('typing', 'content-item', req.params.id);
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    const item = await LessonContentItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Content item not found.' });
    }

    const responseData = { success: true, data: item };
    await set(cacheKey, responseData, TTL.STATIC);
    return res.json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/koompi-typing/content-items
// Accepts single item or { items: [...] } for bulk insert
export const createContentItem = async (req, res) => {
  try {
    if (Array.isArray(req.body.items)) {
      const { items } = req.body;
      if (items.length === 0) {
        return res.status(400).json({ success: false, message: 'items array cannot be empty.' });
      }

      const lessonId = items[0].lessonId;
      const createdItems = await LessonContentItem.insertMany(items);

      if (lessonId) {
        const count = await LessonContentItem.countDocuments({ lessonId });
        await TypingLesson.findByIdAndUpdate(lessonId, { contentItemCount: count });
      }

      await delPattern('typing:content-items:*');
      return res.status(201).json({ success: true, count: createdItems.length, data: createdItems });
    }

    const { lessonId, itemType, language, text, order, audioUrl } = req.body;
    if (!lessonId || !text) {
      return res.status(400).json({ success: false, message: 'lessonId and text are required.' });
    }

    const lesson = await TypingLesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Parent TypingLesson not found.' });
    }

    const item = await LessonContentItem.create({
      lessonId,
      itemType: itemType || 'word',
      language: language || lesson.language || 'en',
      text,
      order: order || 1,
      audioUrl: audioUrl || null
    });

    await TypingLesson.findByIdAndUpdate(lessonId, { $inc: { contentItemCount: 1 } });
    await delPattern('typing:content-items:*');

    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/koompi-typing/content-items/:id
export const updateContentItem = async (req, res) => {
  try {
    const updated = await LessonContentItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Content item not found.' });
    }

    await Promise.all([
      del(generateKey('typing', 'content-item', req.params.id)),
      delPattern('typing:content-items:*'),
    ]);

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/koompi-typing/content-items/:id
export const deleteContentItem = async (req, res) => {
  try {
    const item = await LessonContentItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Content item not found.' });
    }

    await TypingLesson.findByIdAndUpdate(item.lessonId, { $inc: { contentItemCount: -1 } });
    await Promise.all([
      del(generateKey('typing', 'content-item', req.params.id)),
      delPattern('typing:content-items:*'),
    ]);

    return res.json({ success: true, message: 'Content item deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
