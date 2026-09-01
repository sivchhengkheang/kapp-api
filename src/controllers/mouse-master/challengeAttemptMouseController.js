import ChallengeAttemptMouse from '../../models/mouse-master/ChallengeAttemptMouse.js';

// ── POST /api/mouse-master/attempts/bulk ──────────────────────────────────────
// Batch-insert all target events for a session at once (on session end)
export const createAttemptsBulk = async (req, res) => {
  try {
    const { attempts } = req.body;
    if (!Array.isArray(attempts) || attempts.length === 0) {
      return res.status(400).json({ success: false, message: '`attempts` array is required.' });
    }
    const docs = await ChallengeAttemptMouse.insertMany(attempts, { ordered: false });
    return res.status(201).json({ success: true, count: docs.length, data: docs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/mouse-master/attempts ───────────────────────────────────────────
// Single attempt insert (for real-time streaming use case)
export const createAttempt = async (req, res) => {
  try {
    const attempt = await ChallengeAttemptMouse.create(req.body);
    return res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/mouse-master/attempts/session/:sessionId ────────────────────────
// All target events within a session, ordered by targetIndex
export const getAttemptsBySession = async (req, res) => {
  try {
    const data = await ChallengeAttemptMouse.find({ sessionId: req.params.sessionId })
      .sort({ targetIndex: 1 });
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/mouse-master/attempts/:id ───────────────────────────────────────
export const getAttemptById = async (req, res) => {
  try {
    const attempt = await ChallengeAttemptMouse.findById(req.params.id)
      .populate('sessionId', 'userAccountId levelId accuracyPct');
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
    return res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/mouse-master/attempts/:id ────────────────────────────────────
export const deleteAttempt = async (req, res) => {
  try {
    const attempt = await ChallengeAttemptMouse.findByIdAndDelete(req.params.id);
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found.' });
    return res.status(200).json({ success: true, message: 'Attempt deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
