import GameSessionMath from '../../models/typing-math/GameSessionMath.js';

// POST /api/typing-math/sessions
// Start a new math game session
export const createGameSession = async (req, res) => {
  try {
    const { userAccountId } = req.body;

    if (!userAccountId) {
      return res.status(400).json({ success: false, message: 'userAccountId is required.' });
    }

    const session = await GameSessionMath.create(req.body);
    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/sessions/:id
// Get a single math game session by document ID
export const getGameSessionById = async (req, res) => {
  try {
    const session = await GameSessionMath.findById(req.params.id)
      .populate('problemDetails.problemId', 'problem answer operation difficulty')
      .populate('mistakes.problemId', 'problem answer operation');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Math game session not found.' });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/sessions/user/:userId
// Get all sessions for a user with optional pagination and filters
export const getSessionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, gameMode, category, limit = 20, page = 1 } = req.query;

    const filter = { userAccountId: userId };
    if (status) filter['results.status'] = status;
    if (gameMode) filter.gameMode = gameMode;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [sessions, total] = await Promise.all([
      GameSessionMath.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      GameSessionMath.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: sessions,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/typing-math/sessions/:id
// Update a session (e.g., when the math game ends — set results, performance, timing)
export const updateGameSession = async (req, res) => {
  try {
    const session = await GameSessionMath.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Math game session not found.' });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/typing-math/sessions/:id
// Delete a math game session
export const deleteGameSession = async (req, res) => {
  try {
    const session = await GameSessionMath.findByIdAndDelete(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Math game session not found.' });
    }

    return res.status(200).json({ success: true, message: 'Math game session deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/sessions/user/:userId/best
// Get the user's best session by score
export const getUserBestSession = async (req, res) => {
  try {
    const session = await GameSessionMath.findOne({
      userAccountId: req.params.userId,
      'results.status': 'completed',
    }).sort({ 'results.score': -1 });

    if (!session) {
      return res.status(404).json({ success: false, message: 'No completed sessions found for this user.' });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
