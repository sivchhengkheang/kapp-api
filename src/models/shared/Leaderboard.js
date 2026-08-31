import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  boardType: { type: String, enum: ['global', 'category', 'weekly', 'friends'] },
  category: { type: String, default: null },
  period: { type: String, enum: ['weekly', 'monthly', 'all_time'] },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rank: Number,
  metrics: {
    score: Number,
    wpm: Number,
    averageAccuracy: Number,
    gamesCompleted: Number,
    totalXP: Number,
    scoreFormula: String,
    gamesThisWeek: Number,
    // Robot Brainiac additions
    averageEfficiency: Number,
    levelCompletion: Number,
    speedRunsCount: Number,
    perfectRuns: Number,
    timeToComplete: Number
  },
  userSnapshot: {
    username: String,
    displayName: String,
    avatar: String,
    level: Number
  },
  calculatedAt: Date,
  validUntil: Date,
  previousRank: Number,
  rankChange: Number,
  isNewEntry: Boolean,
  weekStartDate: Date
}, { timestamps: true });

leaderboardSchema.index({ boardType: 1, period: 1, rank: 1 });
leaderboardSchema.index({ userId: 1, boardType: 1, period: 1 }, { unique: true });
leaderboardSchema.index({ category: 1, period: 1, rank: 1 });
leaderboardSchema.index({ calculatedAt: 1 });
leaderboardSchema.index({ 'metrics.score': -1 });

export default mongoose.model('Leaderboard', leaderboardSchema);
