import BoardProgress from '../../models/link-number/BoardProgress.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/progress/user/:userId
// All board progress records for a user (with optional status filter)
// Query: status, difficulty, page, limit
// ─────────────────────────────────────────────────────────────────────────────
export const getUserBoardProgress = async (req, res) => {
  try {
    const { status, difficulty, page = 1, limit = 30 } = req.query;

    const filter = { userAccountId: req.params.userId };
    if (status)     filter.status     = status;
    if (difficulty) filter.difficulty = difficulty;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      BoardProgress.find(filter)
        .sort({ boardNumber: 1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('boardId', 'boardNumber title difficulty gridSize category'),
      BoardProgress.countDocuments(filter)
    ]);

    // Aggregate quick summary
    const summary = {
      total,
      completed: data.filter(p => p.status === 'completed').length,
      inProgress: data.filter(p => p.status === 'in_progress').length,
      totalStars: data.reduce((acc, p) => acc + (p.currentStars ?? 0), 0)
    };

    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      summary,
      data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/progress/user/:userId/:boardId
// Progress for a specific board for a user
// ─────────────────────────────────────────────────────────────────────────────
export const getBoardProgressByBoardId = async (req, res) => {
  try {
    const { userId, boardId } = req.params;

    const progress = await BoardProgress.findOne({ userAccountId: userId, boardId })
      .populate('boardId', 'boardNumber title difficulty gridSize grid rewards');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'No progress record found for this user and board.'
      });
    }

    return res.status(200).json({ success: true, data: progress });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
