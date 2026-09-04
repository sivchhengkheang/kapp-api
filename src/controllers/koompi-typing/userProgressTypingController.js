import UserProgressTyping from '../../models/koompi-typing/UserProgressTyping.js';
import TypingLesson from '../../models/koompi-typing/TypingLesson.js';

// GET /api/koompi-typing/progress/user/:userId
export const getProgressByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { unitId } = req.query;

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

    return res.json({
      success: true,
      count: progressList.length,
      data: progressList
    });
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

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
