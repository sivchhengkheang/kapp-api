import PuzzleBoard from '../../models/link-number/PuzzleBoard.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/puzzles
// List all published puzzle boards (with filters + pagination)
// Query: difficulty, category, gridSize, page, limit
// ─────────────────────────────────────────────────────────────────────────────
export const getAllPuzzles = async (req, res) => {
  try {
    const { difficulty, category, gridSize, page = 1, limit = 20 } = req.query;

    const filter = { 'status.isPublished': true };
    if (difficulty) filter.difficulty = difficulty;
    if (category)   filter.category   = category;
    if (gridSize)   filter.gridSize    = gridSize;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      PuzzleBoard.find(filter)
        .select('-solution -moveHistory') // Exclude solution to prevent spoilers
        .sort({ boardNumber: 1 })
        .skip(skip)
        .limit(Number(limit)),
      PuzzleBoard.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/puzzles/difficulty/:difficulty
// Get boards filtered by difficulty
// ─────────────────────────────────────────────────────────────────────────────
export const getPuzzlesByDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const allowed = ['easy', 'medium', 'hard', 'expert'];
    if (!allowed.includes(difficulty)) {
      return res.status(400).json({ success: false, message: `Invalid difficulty. Must be one of: ${allowed.join(', ')}` });
    }

    const filter = { difficulty, 'status.isPublished': true };
    const skip   = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      PuzzleBoard.find(filter)
        .select('-solution')
        .sort({ boardNumber: 1 })
        .skip(skip)
        .limit(Number(limit)),
      PuzzleBoard.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/puzzles/:boardNumber
// Get a single puzzle by its board number (includes full grid, excludes solution)
// ─────────────────────────────────────────────────────────────────────────────
export const getPuzzleByBoardNumber = async (req, res) => {
  try {
    const boardNumber = Number(req.params.boardNumber);
    if (isNaN(boardNumber)) {
      return res.status(400).json({ success: false, message: 'boardNumber must be a number.' });
    }

    const board = await PuzzleBoard.findOne({ boardNumber })
      .select('-solution'); // Solution excluded — only returned to verified completions

    if (!board) {
      return res.status(404).json({ success: false, message: `Puzzle board #${boardNumber} not found.` });
    }

    return res.status(200).json({ success: true, data: board });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/puzzles/:boardNumber/stats
// Get only the stats sub-document for a board
// ─────────────────────────────────────────────────────────────────────────────
export const getPuzzleStats = async (req, res) => {
  try {
    const boardNumber = Number(req.params.boardNumber);
    if (isNaN(boardNumber)) {
      return res.status(400).json({ success: false, message: 'boardNumber must be a number.' });
    }

    const board = await PuzzleBoard.findOne({ boardNumber })
      .select('boardNumber title difficulty gridSize stats');

    if (!board) {
      return res.status(404).json({ success: false, message: `Puzzle board #${boardNumber} not found.` });
    }

    return res.status(200).json({ success: true, data: board });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/link-number/puzzles (admin)
// Create a new puzzle board
// ─────────────────────────────────────────────────────────────────────────────
export const createPuzzleBoard = async (req, res) => {
  try {
    const board = await PuzzleBoard.create(req.body);
    return res.status(201).json({ success: true, data: board });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'A board with this boardNumber already exists.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
