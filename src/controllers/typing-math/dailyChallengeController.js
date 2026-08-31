import DailyChallenge from '../../models/typing-math/DailyChallenge.js';

// POST /api/typing-math/daily-challenges
// Create a new daily challenge entry
export const createDailyChallenge = async (req, res) => {
  try {
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: 'date is required.' });
    }

    const challenge = await DailyChallenge.create(req.body);
    return res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A daily challenge already exists for this date.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/daily-challenges/today
// Get the active daily challenge for today's date
export const getTodayChallenge = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const challenge = await DailyChallenge.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
      isActive: true,
    }).populate('problems', 'problem answer operation difficulty');

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'No active daily challenge for today.' });
    }

    return res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/daily-challenges
// List all daily challenges with optional pagination
export const getDailyChallenges = async (req, res) => {
  try {
    const { isActive, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [challenges, total] = await Promise.all([
      DailyChallenge.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      DailyChallenge.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: challenges,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/daily-challenges/:id
// Get a specific daily challenge by document ID
export const getDailyChallengeById = async (req, res) => {
  try {
    const challenge = await DailyChallenge.findById(req.params.id)
      .populate('problems', 'problem answer operation difficulty');

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Daily challenge not found.' });
    }

    return res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/typing-math/daily-challenges/:id
// Update a daily challenge (e.g., update stats, top scores, problems list)
export const updateDailyChallenge = async (req, res) => {
  try {
    const challenge = await DailyChallenge.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Daily challenge not found.' });
    }

    return res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/typing-math/daily-challenges/:id/top-scores
// Push a new score into the topScores array
export const addTopScore = async (req, res) => {
  try {
    const { rank, userAccountId, displayName, score, accuracy, timeToComplete } = req.body;

    if (!userAccountId || score === undefined) {
      return res.status(400).json({ success: false, message: 'userAccountId and score are required.' });
    }

    const challenge = await DailyChallenge.findByIdAndUpdate(
      req.params.id,
      {
        $push: { topScores: { rank, userAccountId, displayName, score, accuracy, timeToComplete } },
        $inc: { 'stats.totalCompleted': 1 },
      },
      { returnDocument: 'after' }
    );

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Daily challenge not found.' });
    }

    return res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
