import mongoose from 'mongoose';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const difficultyTierSchema = new mongoose.Schema(
  {
    tierName: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard', 'expert']
    },
    completed:        { type: Boolean, default: false },
    boardsCompleted:  { type: Number, default: 0 },
    boardsTotal:      { type: Number, default: 0 },
    unlockedAt:       { type: Date, default: null },
    completedAt:      { type: Date, default: null },
    averageStars:     { type: Number, default: 0 },
    averageTime:      { type: Number, default: 0 }, // seconds
    currentProgress:  { type: Number, default: 0 }, // %
    requirement:      { type: String, default: null } // Human-readable unlock requirement
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const difficultyProgressionSchema = new mongoose.Schema(
  {
    userAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true,
      unique: true
    },

    currentDifficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'easy'
    },
    currentLevel: { type: Number, default: 1 },

    difficultyTiers: { type: [difficultyTierSchema], default: [] },

    // Next-tier unlock tracking
    unlockProgress: {
      nextTier:        { type: String, enum: ['medium', 'hard', 'expert', null], default: 'medium' },
      requirement:     { type: Number, default: 0 }, // boards required
      currentProgress: { type: Number, default: 0 },
      percentComplete: { type: Number, default: 0 }
    },

    // Mastery metrics (flat for fast reads)
    mastery: {
      easy_avg_time:      { type: Number, default: 0 },
      easy_perfect_rate:  { type: Number, default: 0 },
      medium_avg_time:    { type: Number, default: 0 },
      medium_perfect_rate:{ type: Number, default: 0 },
      hard_avg_time:      { type: Number, default: 0 },
      hard_perfect_rate:  { type: Number, default: 0 },
      readyForHard:       { type: Boolean, default: false },
      readyForExpert:     { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
difficultyProgressionSchema.index({ currentDifficulty: 1 });

export default mongoose.model('DifficultyProgression', difficultyProgressionSchema);
