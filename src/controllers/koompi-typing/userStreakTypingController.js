import UserStreakTyping from '../../models/koompi-typing/UserStreakTyping.js';

// GET /api/koompi-typing/streaks/user/:userId
export const getStreakByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    let streak = await UserStreakTyping.findOne({ userAccountId: userId });
    if (!streak) {
      streak = {
        userAccountId: userId,
        currentStreakDays: 0,
        longestStreakDays: 0,
        lastActivityDate: null,
        streakFreezesAvailable: 1,
        history: []
      };
    }

    return res.json({ success: true, data: streak });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/koompi-typing/streaks/user/:userId/freeze
// Consume one available streak freeze
export const useStreakFreeze = async (req, res) => {
  try {
    const { userId } = req.params;

    const streak = await UserStreakTyping.findOne({ userAccountId: userId });
    if (!streak) {
      return res.status(404).json({ success: false, message: 'Streak record not found.' });
    }

    if (streak.streakFreezesAvailable <= 0) {
      return res.status(400).json({ success: false, message: 'No streak freezes available.' });
    }

    streak.streakFreezesAvailable -= 1;
    await streak.save();

    return res.json({
      success: true,
      message: 'Streak freeze consumed successfully.',
      data: streak
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/koompi-typing/streaks/user/:userId/add-freeze
export const addStreakFreeze = async (req, res) => {
  try {
    const { userId } = req.params;
    const { count = 1 } = req.body;

    const streak = await UserStreakTyping.findOneAndUpdate(
      { userAccountId: userId },
      { $inc: { streakFreezesAvailable: count } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    return res.json({ success: true, data: streak });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
