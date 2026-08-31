import GameSessionCode from '../../models/typing-code/GameSessionCode.js';

// POST /api/typing-code/sessions
// Start a new typing code game session
export const createGameSession = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }

    const session = await GameSessionCode.create(req.body);
    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-code/sessions/:id
// Get a single game session by its document ID
export const getGameSessionById = async (req, res) => {
  try {
    const session = await GameSessionCode.findById(req.params.id)
      .populate('challengeId', 'title language difficulty codeSnippet');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Game session not found.' });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-code/sessions/user/:userId
// Get all sessions for a given user, with optional pagination and filters
export const getSessionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, category, limit = 20, page = 1 } = req.query;

    const filter = { userId };
    if (status) filter['results.status'] = status;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [sessions, total] = await Promise.all([
      GameSessionCode.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      GameSessionCode.countDocuments(filter),
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

// PATCH /api/typing-code/sessions/:id
// Update a session (e.g., when the game ends — set results, performance, timing)
export const updateGameSession = async (req, res) => {
  try {
    const session = await GameSessionCode.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: 'Game session not found.' });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/typing-code/sessions/:id
// Delete a game session
export const deleteGameSession = async (req, res) => {
  try {
    const session = await GameSessionCode.findByIdAndDelete(req.params.id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Game session not found.' });
    }

    return res.status(200).json({ success: true, message: 'Game session deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-code/sessions/user/:userId/best
// Get the user's personal best session by WPM
export const getUserBestSession = async (req, res) => {
  try {
    const session = await GameSessionCode.findOne({
      userId: req.params.userId,
      'results.status': 'completed',
    }).sort({ 'performance.wpm': -1 });

    if (!session) {
      return res.status(404).json({ success: false, message: 'No completed sessions found for this user.' });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
