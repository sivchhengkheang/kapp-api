import mongoose from 'mongoose';

const userPerformanceHistorySchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  date: { type: Date, required: true },
  dailyStats: {
    gamesPlayed: Number,
    averageAccuracy: Number,
    averageWpm: Number,
    totalProblemsCorrect: Number,
    totalProblems: Number,
    totalPlayTimeSeconds: Number,
    xpGained: Number,
    pointsGained: Number
  },
  operationPerformance: mongoose.Schema.Types.Mixed,
  achievementsUnlockedToday: [String],
  currentStreak: Number
}, { 
  timeseries: {
    timeField: 'date',
    metaField: 'dailyStats',
    granularity: 'hours'
  }
});

userPerformanceHistorySchema.index({ userAccountId: 1, date: -1 });

export default mongoose.model('UserPerformanceHistory', userPerformanceHistorySchema);
