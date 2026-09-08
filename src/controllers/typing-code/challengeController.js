import Challenge from '../../models/typing-code/Challenge.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// POST /api/typing-code/challenges
// Create a new code challenge/snippet
export const createChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.create(req.body);
    await delPattern('typing-code:challenges:*');
    return res.status(201).json({ success: true, data: challenge });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-code/challenges
// List challenges with optional filters: language, difficulty, category, isPublished, isFeatured
export const getChallenges = async (req, res) => {
  try {
    const cacheKey = generateKey('typing-code', 'challenges', req.query);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const { language, difficulty, category, isPublished, isFeatured, limit = 20, page = 1 } = req.query;

    const filter = {};
    if (language) filter.language = language;
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (isPublished !== undefined) filter['status.isPublished'] = isPublished === 'true';
    if (isFeatured !== undefined) filter['status.isFeatured'] = isFeatured === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [challenges, total] = await Promise.all([
      Challenge.find(filter)
        .sort({ 'stats.timesPlayed': -1 })
        .skip(skip)
        .limit(Number(limit)),
      Challenge.countDocuments(filter),
    ]);

    const responseData = {
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: challenges,
    };

    await set(cacheKey, responseData, TTL.LONG_STATIC);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-code/challenges/:id
// Get a specific challenge by document ID
export const getChallengeById = async (req, res) => {
  try {
    const cacheKey = generateKey('typing-code', 'challenge', req.params.id);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    const responseData = { success: true, data: challenge };
    await set(cacheKey, responseData, TTL.LONG_STATIC);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/typing-code/challenges/:id
// Update a challenge (moderation, stats, content)
export const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    await Promise.all([
      del(generateKey('typing-code', 'challenge', req.params.id)),
      delPattern('typing-code:challenges:*'),
    ]);

    return res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/typing-code/challenges/:id
// Delete a challenge
export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    await Promise.all([
      del(generateKey('typing-code', 'challenge', req.params.id)),
      delPattern('typing-code:challenges:*'),
    ]);

    return res.status(200).json({ success: true, message: 'Challenge deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/typing-code/challenges/:id/stats
// Atomically increment challenge play stats after a game session
export const incrementChallengeStats = async (req, res) => {
  try {
    // req.body should contain the $inc values, e.g. { 'stats.timesPlayed': 1 }
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { $inc: req.body },
      { returnDocument: 'after' }
    );

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found.' });
    }

    await Promise.all([
      del(generateKey('typing-code', 'challenge', req.params.id)),
      delPattern('typing-code:challenges:*'),
    ]);

    return res.status(200).json({ success: true, data: challenge });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
