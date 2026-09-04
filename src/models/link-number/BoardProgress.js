import mongoose from 'mongoose';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const attemptSnapshotSchema = new mongoose.Schema(
  {
    attemptNumber: { type: Number, required: true },
    status:        { type: String, enum: ['completed', 'quit', 'failed'], required: true },
    starRating:    { type: Number, default: 0, min: 0, max: 3 },
    score:         { type: Number, default: 0 },
    time:          { type: Number, default: null }, // seconds
    mistakes:      { type: Number, default: 0 },
    attemptedAt:   { type: Date, default: Date.now }
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const boardProgressSchema = new mongoose.Schema(
  {
    userAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PuzzleBoard',
      required: true
    },
    boardNumber: { type: Number, required: true },
    difficulty:  { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true },

    // Progress state
    status: {
      type: String,
      enum: ['locked', 'unlocked', 'in_progress', 'completed'],
      default: 'locked'
    },
    unlockedAt:    { type: Date, default: null },
    firstAttemptAt:{ type: Date, default: null },
    completedAt:   { type: Date, default: null },

    // Star performance
    currentStars: { type: Number, default: 0, min: 0, max: 3 },
    maxStars:     { type: Number, default: 3 },
    threeStarRequirement: {
      maxTime:    { type: Number, default: null },
      maxMistakes:{ type: Number, default: 0 },
      boardFilled:{ type: Boolean, default: true }
    },

    // Attempt history
    totalAttempts: { type: Number, default: 0 },
    attempts:      { type: [attemptSnapshotSchema], default: [] },

    // Best performance snapshot
    bestAttempt: {
      attemptNumber: { type: Number, default: null },
      score:         { type: Number, default: 0 },
      stars:         { type: Number, default: 0 },
      time:          { type: Number, default: null },
      mistakes:      { type: Number, default: 0 }
    },

    // Trend analytics
    performanceTrend: {
      initialTime:        { type: Number, default: null },
      currentBestTime:    { type: Number, default: null },
      improvementPercent: { type: Number, default: 0 },
      initialScore:       { type: Number, default: 0 },
      currentBestScore:   { type: Number, default: 0 },
      consistency: {
        type: String,
        enum: ['poor', 'fair', 'good', 'perfect'],
        default: 'fair'
      }
    },

    // Claimed rewards
    rewardsClaimed: {
      xp:                 { type: Number, default: 0 },
      points:             { type: Number, default: 0 },
      firstCompletionBonus:{ type: Boolean, default: false },
      starBonuses: {
        oneStar:   { type: Boolean, default: false },
        twoStar:   { type: Boolean, default: false },
        threeStar: { type: Boolean, default: false }
      }
    }
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
boardProgressSchema.index({ userAccountId: 1, boardId: 1 }, { unique: true });
boardProgressSchema.index({ userAccountId: 1, status: 1 });
boardProgressSchema.index({ userAccountId: 1, boardNumber: 1 });

export default mongoose.model('BoardProgress', boardProgressSchema);
