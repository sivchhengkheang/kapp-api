import GameSessionRobot from '../../models/robot-brainiac/GameSessionRobot.js';

// ── POST /api/robot-brainiac/sessions ─────────────────────────────────────────
export const createSession = async (req, res) => {
  try {
    const session = await GameSessionRobot.create({
      ...req.body,
      timing: { startedAt: req.body.startedAt || new Date(), ...req.body.timing },
    });
    return res.status(201).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/robot-brainiac/sessions/user/:userId ─────────────────────────────
export const getSessionsByUser = async (req, res) => {
  try {
    const { status, levelId, page = 1, limit = 20 } = req.query;

    const filter = { userAccountId: req.params.userId };
    if (status) filter['performance.status'] = status;
    if (levelId) filter.levelId = levelId;

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      GameSessionRobot.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('levelId', 'levelNumber title difficulty'),
      GameSessionRobot.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true, count: data.length, total,
      page: Number(page), pages: Math.ceil(total / Number(limit)), data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/robot-brainiac/sessions/user/:userId/best ────────────────────────
export const getBestSession = async (req, res) => {
  try {
    const session = await GameSessionRobot.findOne({
      userAccountId: req.params.userId,
      'performance.status': 'completed',
    })
      .sort({ 'performance.efficiency': -1, 'scoring.totalScore': -1 })
      .populate('levelId', 'levelNumber title difficulty');

    if (!session) {
      return res.status(404).json({ success: false, message: 'No completed sessions found.' });
    }
    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/robot-brainiac/sessions/:id ──────────────────────────────────────
export const getSessionById = async (req, res) => {
  try {
    const session = await GameSessionRobot.findById(req.params.id)
      .populate('levelId', 'levelNumber title difficulty solution.optimalMoves');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/robot-brainiac/sessions/:id ────────────────────────────────────
// Called when the session ends — updates performance, scoring, commands, rewards
export const updateSession = async (req, res) => {
  try {
    const session = await GameSessionRobot.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE /api/robot-brainiac/sessions/:id ───────────────────────────────────
export const deleteSession = async (req, res) => {
  try {
    const session = await GameSessionRobot.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    return res.status(200).json({ success: true, message: 'Session deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
