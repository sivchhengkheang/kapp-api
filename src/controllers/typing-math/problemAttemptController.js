import ProblemAttempt from '../../models/typing-math/ProblemAttempt.js';

// POST /api/typing-math/attempts
// Record a single problem attempt during a math session
export const createProblemAttempt = async (req, res) => {
  try {
    const { userAccountId, problemId } = req.body;

    if (!userAccountId || !problemId) {
      return res.status(400).json({ success: false, message: 'userAccountId and problemId are required.' });
    }

    const attempt = await ProblemAttempt.create(req.body);
    return res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/typing-math/attempts/bulk
// Bulk create multiple attempts at once (e.g., at session end)
export const bulkCreateProblemAttempts = async (req, res) => {
  try {
    const { attempts } = req.body;

    if (!Array.isArray(attempts) || attempts.length === 0) {
      return res.status(400).json({ success: false, message: 'attempts must be a non-empty array.' });
    }

    const inserted = await ProblemAttempt.insertMany(attempts, { ordered: false });
    return res.status(201).json({ success: true, count: inserted.length, data: inserted });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/attempts/:id
// Get a single problem attempt by document ID
export const getProblemAttemptById = async (req, res) => {
  try {
    const attempt = await ProblemAttempt.findById(req.params.id)
      .populate('problemId', 'problem answer operation difficulty')
      .populate('sessionId', 'gameMode results.score timing');

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Problem attempt not found.' });
    }

    return res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/attempts/user/:userId
// Get all attempts for a user, with optional filters and pagination
export const getAttemptsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isCorrect, operation, limit = 20, page = 1 } = req.query;

    const filter = { userAccountId: userId };
    if (isCorrect !== undefined) filter.isCorrect = isCorrect === 'true';
    if (operation) filter.operation = operation;

    const skip = (Number(page) - 1) * Number(limit);

    const [attempts, total] = await Promise.all([
      ProblemAttempt.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('problemId', 'problem answer operation'),
      ProblemAttempt.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: attempts,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/attempts/session/:sessionId
// Get all attempts belonging to a specific game session
export const getAttemptsBySession = async (req, res) => {
  try {
    const attempts = await ProblemAttempt.find({ sessionId: req.params.sessionId })
      .sort({ timeFromGameStart: 1 })
      .populate('problemId', 'problem answer operation difficulty');

    return res.status(200).json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/typing-math/attempts/:id
// Delete a specific problem attempt record
export const deleteProblemAttempt = async (req, res) => {
  try {
    const attempt = await ProblemAttempt.findByIdAndDelete(req.params.id);

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Problem attempt not found.' });
    }

    return res.status(200).json({ success: true, message: 'Problem attempt deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
