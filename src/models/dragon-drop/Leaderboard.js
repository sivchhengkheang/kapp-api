import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  boardType: { type: String, enum: ['global', 'by_world', 'by_level', 'stars'], required: true },
  period: { type: String, enum: ['weekly', 'monthly', 'all_time'], default: 'all_time' },
  worldNumber: { type: Number, default: null },
  levelNumber: { type: Number, default: null },
  rank: Number,
  metrics: {
    totalStars: Number,
    totalMapPieces: Number,
    totalOrbs: Number,
    worldsCompleted: Number,
    totalScore: Number,
    averageScorePerLevel: Number,
    averageScore: Number
  },
  userSnapshot: {
    displayName: String,
    avatar: String
  },
  calculatedAt: Date,
  previousRank: Number,
  rankChange: Number
}, { timestamps: true });

leaderboardSchema.index({ boardType: 1, period: 1, rank: 1 });
leaderboardSchema.index({ userAccountId: 1, boardType: 1, worldNumber: 1, levelNumber: 1 }, { unique: true });

export default mongoose.model('LeaderboardDragon', leaderboardSchema);
