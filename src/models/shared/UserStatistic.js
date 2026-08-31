import mongoose from 'mongoose';

const userStatisticSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true, unique: true },
  
  // Games Played
  gamesPlayed: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    abandoned: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
  
  // Typing Speed (WPM)
  wpm: {
    current: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    peak: { type: Number, default: 0 },
    history: [{
      sessionId: mongoose.Schema.Types.ObjectId,
      wpm: Number,
      date: Date
    }]
  },
  
  // Accuracy
  accuracy: {
    average: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    byOperation: mongoose.Schema.Types.Mixed // Math specific
  },
  
  // Progression
  level: {
    current: { type: Number, default: 1 },
    xp: {
      current: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      nextLevelRequires: { type: Number, default: 1000 }
    }
  },
  
  // Problem Solving Stats (Math specific)
  problemStats: {
    totalSolved: Number,
    totalAttempted: Number,
    totalSkipped: Number,
    averageSolveTime: Number,
    fastestSolveTime: Number,
    slowestSolveTime: Number
  },
  
  // Streaks
  streaks: {
    currentGameWinStreak: { type: Number, default: 0 },
    longestGameWinStreak: { type: Number, default: 0 },
    currentPerfectStreakCount: { type: Number, default: 0 },
    longestPerfectStreak: { type: Number, default: 0 },
    playStreak: {
      currentDays: { type: Number, default: 0 },
      lastPlayDate: Date,
      longestDays: { type: Number, default: 0 }
    }
  },
  
  // Achievements & Points
  achievements: {
    total: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    badges: [{
      id: String,
      name: String,
      earnedAt: Date
    }]
  },
  
  // Category Performance (Math Topics or Code Languages)
  categoryStats: [mongoose.Schema.Types.Mixed],
  
  // Time Tracking
  totalPlayTimeSeconds: { type: Number, default: 0 },

  // Code game specific
  preferences: {
    favoriteCategory: String,
    preferredDifficulty: String
  }
}, { timestamps: true });

userStatisticSchema.index({ 'level.current': -1 });
userStatisticSchema.index({ 'wpm.peak': -1 });

export default mongoose.model('UserStatistic', userStatisticSchema);
