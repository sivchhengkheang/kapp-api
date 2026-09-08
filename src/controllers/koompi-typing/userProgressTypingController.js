import UserProgressTyping from '../../models/koompi-typing/UserProgressTyping.js';
import TypingLesson from '../../models/koompi-typing/TypingLesson.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// GET /api/koompi-typing/progress/user/:userId
export const getProgressByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { unitId } = req.query;

    const cacheKey = generateKey('typing', 'progress', userId, unitId || 'all');
    const cached = await get(cacheKey);
    if (cached) return res.json(cached);

    let filter = { userAccountId: userId };
    if (unitId) {
      const lessonIds = await TypingLesson.find({ unitId }).distinct('_id');
      filter.lessonId = { $in: lessonIds };
    }

    const progressList = await UserProgressTyping.find(filter)
      .populate({
        path: 'lessonId',
        select: 'lessonNumber title difficulty language unitId order',
        populate: { path: 'unitId', select: 'unitNumber title theme' }
      })
      .sort({ updatedAt: -1 });

    const body = { success: true, count: progressList.length, data: progressList };
    await set(cacheKey, body, TTL.USER_STATS);
    return res.json(body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/koompi-typing/progress/user/:userId/lesson/:lessonId
export const getProgressByLesson = async (req, res) => {
  try {
    const { userId, lessonId } = req.params;

    const progress = await UserProgressTyping.findOne({
      userAccountId: userId,
      lessonId
    }).populate('lessonId', 'lessonNumber title passThreshold xpReward');

    if (!progress) {
      return res.json({
        success: true,
        data: {
          userAccountId: userId,
          lessonId,
          status: 'unlocked', // default for accessible lessons
          bestAccuracyPct: 0,
          bestWpm: 0,
          bestStars: 0,
          attemptsCount: 0
        }
      });
    }

    return res.json({ success: true, data: progress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/koompi-typing/progress/user/:userId/lesson/:lessonId
export const updateProgress = async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    const updateData = req.body;

    const updated = await UserProgressTyping.findOneAndUpdate(
      { userAccountId: userId, lessonId },
      { $set: updateData },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    // Bust user progress cache
    await delPattern(`typing:progress:${userId}:*`);
    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
