import mongoose from 'mongoose';

const userStatisticSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  gamesPlayed: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    abandoned: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  },
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
  accuracy: {
    average: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 }
  },
  level: {
    current: { type: Number, default: 1 },
    xp: {
      current: { type: Number, default: 0 },
      totalEarned: { type: Number, default: 0 },
      nextLevelRequires: { type: Number, default: 1000 }
    }
  },
  streaks: {
    currentWinStreak: { type: Number, default: 0 },
    longestWinStreak: { type: Number, default: 0 },
    playStreak: {
      currentDays: { type: Number, default: 0 },
      lastPlayDate: Date,
      longestDays: { type: Number, default: 0 }
    }
  },
  achievements: {
    total: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    badges: [{
      id: String,
      name: String,
      earnedAt: Date
    }]
  },
  categoryStats: [{
    category: String,
    gamesPlayed: Number,
    averageWPM: Number,
    averageAccuracy: Number,
    highScore: Number,
    timesPlayedThisWeek: Number
  }],
  preferences: {
    favoriteCategory: String,
    preferredDifficulty: String
  }
}, { timestamps: true });

userStatisticSchema.index({ 'level.current': -1 });
userStatisticSchema.index({ 'wpm.peak': -1 });

export default mongoose.model('UserStatistic', userStatisticSchema);
