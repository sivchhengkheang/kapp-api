import mongoose from 'mongoose';

const levelStatisticSchema = new mongoose.Schema({
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  levelNumber: { type: Number, required: true },

  // Aggregate date (daily granularity — one doc per level per day)
  date: { type: Date, required: true },

  // Play stats
  stats: {
    timesPlayed: { type: Number, default: 0 },
    timesCompleted: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageAttempts: { type: Number, default: 0 },
  },

  // Performance metrics
  performance: {
    averageMoves: { type: Number, default: 0 },
    optimalMoves: Number,
    averageEfficiency: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 }, // seconds
    bestTime: Number,
    averageHints: { type: Number, default: 0 },
  },

  // Difficulty assessment
  difficulty: {
    baseDifficulty: Number,        // Designer's rating (1-10)
    playerAssessedDifficulty: Number, // Calculated from attempts, completion rate
    recommendedLevel: Number,
  },

  // Player feedback
  feedback: {
    averageRating: { type: Number, default: 0 }, // out of 5
    totalReviews: { type: Number, default: 0 },
    liked: { type: Number, default: 0 },
    disliked: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Compound index — one stat doc per level per day
levelStatisticSchema.index({ levelId: 1, date: -1 });
levelStatisticSchema.index({ levelNumber: 1, date: -1 });
levelStatisticSchema.index({ date: -1 });

export default mongoose.model('LevelStatistic', levelStatisticSchema);
