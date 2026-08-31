import mongoose from 'mongoose';

const gameAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSession' },
  event: {
    type: { type: String }, // e.g. 'session_start', 'power_up_used', 'achievement_earned', 'session_completed'
    category: String,
    timestamp: Date
  },
  eventData: {
    score: Number,
    wpm: Number,
    accuracy: Number,
    powerUpsUsed: [String],
    achievements: [String]
  },
  userState: {
    level: Number,
    totalXP: Number,
    currentWinStreak: Number
  },
  performance: {
    currentWPM: Number,
    currentAccuracy: Number,
    sessionDuration: Number
  },
  device: {
    type: { type: String },
    os: String
  },
  metadata: mongoose.Schema.Types.Mixed
}, { 
  timeseries: {
    timeField: 'event.timestamp',
    metaField: 'metadata',
    granularity: 'minutes'
  }
});

gameAnalyticsSchema.index({ userId: 1, 'event.timestamp': -1 });
gameAnalyticsSchema.index({ 'event.type': 1 });
gameAnalyticsSchema.index({ 'event.timestamp': 1 });

export default mongoose.model('GameAnalytics', gameAnalyticsSchema);
