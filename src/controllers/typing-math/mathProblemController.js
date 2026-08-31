import MathProblem from '../../models/typing-math/MathProblem.js';

// POST /api/typing-math/problems
// Create a new math problem
export const createMathProblem = async (req, res) => {
  try {
    const { problemId } = req.body;

    if (!problemId) {
      return res.status(400).json({ success: false, message: 'problemId is required.' });
    }

    const problem = await MathProblem.create(req.body);
    return res.status(201).json({ success: true, data: problem });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A problem with this problemId already exists.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/problems
// List problems with optional filters: operation, difficulty, category, isActive
export const getMathProblems = async (req, res) => {
  try {
    const { operation, difficulty, category, isActive, limit = 20, page = 1 } = req.query;

    const filter = {};
    if (operation) filter.operation = operation;
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (isActive !== undefined) filter['status.isActive'] = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [problems, total] = await Promise.all([
      MathProblem.find(filter)
        .sort({ 'difficultyAdjustments.recommendedForLevel': 1 })
        .skip(skip)
        .limit(Number(limit)),
      MathProblem.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: problems,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-math/problems/:id
// Get a single math problem by document ID
export const getMathProblemById = async (req, res) => {
  try {
    const problem = await MathProblem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Math problem not found.' });
    }

    return res.status(200).json({ success: true, data: problem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/typing-math/problems/:id
// Update a math problem
export const updateMathProblem = async (req, res) => {
  try {
    const problem = await MathProblem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Math problem not found.' });
    }

    return res.status(200).json({ success: true, data: problem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/typing-math/problems/:id
// Delete a math problem
export const deleteMathProblem = async (req, res) => {
  try {
    const problem = await MathProblem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Math problem not found.' });
    }

    return res.status(200).json({ success: true, message: 'Math problem deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/typing-math/problems/:id/stats
// Atomically increment problem attempt stats (called after each session)
export const incrementProblemStats = async (req, res) => {
  try {
    // e.g., req.body = { 'stats.timesAttempted': 1, 'stats.timesCorrect': 1 }
    const problem = await MathProblem.findByIdAndUpdate(
      req.params.id,
      { $inc: req.body },
      { returnDocument: 'after' }
    );

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Math problem not found.' });
    }

    return res.status(200).json({ success: true, data: problem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
