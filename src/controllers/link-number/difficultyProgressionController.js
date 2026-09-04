import DifficultyProgression from '../../models/link-number/DifficultyProgression.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-number/difficulty/user/:userId
// Get difficulty tier progression for a user
// ─────────────────────────────────────────────────────────────────────────────
export const getDifficultyProgression = async (req, res) => {
  try {
    const progression = await DifficultyProgression.findOne({
      userAccountId: req.params.userId
    });

    if (!progression) {
      return res.status(404).json({
        success: false,
        message: 'No difficulty progression found for this user. Start playing to create one.'
      });
    }

    return res.status(200).json({ success: true, data: progression });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/link-number/difficulty/user/:userId/initialize
// Initialize a progression document for a new user (called on first play)
// Body: { userAccountId }
// ─────────────────────────────────────────────────────────────────────────────
export const initializeDifficultyProgression = async (req, res) => {
  try {
    const userAccountId = req.params.userId;

    const existing = await DifficultyProgression.findOne({ userAccountId });
    if (existing) {
      return res.status(200).json({ success: true, data: existing, alreadyExists: true });
    }

    const progression = await DifficultyProgression.create({
      userAccountId,
      currentDifficulty: 'easy',
      currentLevel: 1,
      difficultyTiers: [
        { tierName: 'easy',   boardsTotal: 10, boardsCompleted: 0, unlockedAt: new Date() },
        { tierName: 'medium', boardsTotal: 25, boardsCompleted: 0, requirement: 'Complete all 10 easy puzzles' },
        { tierName: 'hard',   boardsTotal: 30, boardsCompleted: 0, requirement: 'Complete 20 medium puzzles' },
        { tierName: 'expert', boardsTotal: 20, boardsCompleted: 0, requirement: 'Complete 25 hard puzzles' }
      ],
      unlockProgress: {
        nextTier: 'medium',
        requirement: 10,
        currentProgress: 0,
        percentComplete: 0
      }
    });

    return res.status(201).json({ success: true, data: progression });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Progression already exists for this user.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
