import LevelAttempt from '../../models/robot-brainiac/LevelAttempt.js';

// ── POST /api/robot-brainiac/attempts ─────────────────────────────────────────
export const createAttempt = async (req, res) => {
  try {
    const attempt = await LevelAttempt.create(req.body);
    return res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/robot-brainiac/attempts/bulk ────────────────────────────────────
// Insert multiple attempts at once (e.g. all restarts from a session)
export const createAttemptsBulk = async (req, res) => {
  try {
    const { attempts } = req.body;
    if (!Array.isArray(attempts) || attempts.length === 0) {
      return res.status(400).json({ success: false, message: 'attempts array is required.' });
    }
    const docs = await LevelAttempt.insertMany(attempts, { ordered: false });
    return res.status(201).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/robot-brainiac/attempts/user/:userId ─────────────────────────────
export const getAttemptsByUser = async (req, res) => {
  try {
    const { levelId, status, limit = 50, page = 1 } = req.query;

    const filter = { userAccountId: req.params.userId };
    if (levelId) filter.levelId = levelId;
    if (status) filter['result.status'] = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      LevelAttempt.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      LevelAttempt.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true, count: data.length, total,
      page: Number(page), pages: Math.ceil(total / Number(limit)), data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/robot-brainiac/attempts/session/:sessionId ───────────────────────
export const getAttemptsBySession = async (req, res) => {
  try {
    const data = await LevelAttempt.find({ sessionId: req.params.sessionId })
      .sort({ attemptNumber: 1 });
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/robot-brainiac/attempts/level/:levelId ───────────────────────────
// All attempts by all users on a specific level (useful for admin/analytics)
export const getAttemptsByLevel = async (req, res) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = { levelId: req.params.levelId };
    if (status) filter['result.status'] = status;

    const data = await LevelAttempt.find(filter)
      .sort({ 'result.efficiency': -1 })
      .limit(Number(limit));

    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/robot-brainiac/attempts/:id ──────────────────────────────────────
export const getAttemptById = async (req, res) => {
  try {
    const attempt = await LevelAttempt.findById(req.params.id)
      .populate('levelId', 'levelNumber title solution.optimalMoves');
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
    return res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/robot-brainiac/attempts/:id ───────────────────────────────────
export const deleteAttempt = async (req, res) => {
  try {
    const attempt = await LevelAttempt.findByIdAndDelete(req.params.id);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
    return res.status(200).json({ success: true, message: 'Attempt deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
