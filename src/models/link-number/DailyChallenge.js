import mongoose from 'mongoose';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const leaderboardEntrySchema = new mongoose.Schema(
  {
    rank:          { type: Number, required: true },
    userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' },
    displayName:   { type: String, required: true },
    score:         { type: Number, required: true },
    time:          { type: Number, default: null }, // seconds
    completedAt:   { type: Date, default: null }
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const dailyChallengeSchema = new mongoose.Schema(
  {
    // Challenge identity (UTC date at midnight)
    date:            { type: Date, required: true },
    challengeNumber: { type: Number, required: true },
    title:           { type: String, required: true },

    // Linked puzzle
    puzzle: {
      boardId:  { type: mongoose.Schema.Types.ObjectId, ref: 'PuzzleBoard', required: true },
      gridSize: { type: String, required: true },
      difficulty:{ type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true }
    },

    // Challenge-specific rules
    rules: {
      singleAttemptPerDay: { type: Boolean, default: true },
      timeLimit:           { type: Number, default: null }, // seconds; null = no limit
      mistakePenalty:      { type: Number, default: 0 }    // negative points per mistake
    },

    // Rewards
    rewards: {
      baseXP:         { type: Number, default: 200 },
      basePoints:     { type: Number, default: 300 },
      bonusForPerfect:{ type: Number, default: 300 },
      bonusForSpeed:  { type: Number, default: 100 }
    },

    // Daily top-N leaderboard snapshot (cached, recomputed periodically)
    dailyLeaderboard: {
      topScores:   { type: [leaderboardEntrySchema], default: [] },
      computedAt:  { type: Date, default: null }
    },

    // Aggregate statistics
    stats: {
      totalAttempts:  { type: Number, default: 0 },
      totalCompletions:{ type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      averageTime:    { type: Number, default: 0 },
      averageScore:   { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
dailyChallengeSchema.index({ date: 1 }, { unique: true });
dailyChallengeSchema.index({ challengeNumber: -1 });

export default mongoose.model('DailyChallengeLink', dailyChallengeSchema);
