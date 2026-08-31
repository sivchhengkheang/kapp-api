import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  title: String,
  description: String,
  challengeConfig: {
    operations: [String],
    difficulty: String,
    problemCount: Number,
    durationSeconds: Number,
    categoryFocus: String
  },
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MathProblem' }],
  rewards: {
    xpForCompletion: Number,
    pointsForCompletion: Number,
    xpForFirstPlace: Number,
    specialReward: String
  },
  stats: {
    totalAttempts: { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },
    averageScore: Number,
    averageAccuracy: Number,
    averageTime: Number
  },
  topScores: [{
    rank: Number,
    userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' },
    displayName: String,
    score: Number,
    accuracy: Number,
    timeToComplete: Number
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

dailyChallengeSchema.index({ date: 1 }, { unique: true });
dailyChallengeSchema.index({ isActive: 1 });

export default mongoose.model('DailyChallenge', dailyChallengeSchema);
