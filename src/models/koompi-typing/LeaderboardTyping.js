import mongoose from 'mongoose';

const rankingEntrySchema = new mongoose.Schema({
  userAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccount',
    required: true
  },
  displayName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  wpm: {
    type: Number,
    required: true
  },
  accuracyPct: {
    type: Number,
    required: true
  },
  rank: {
    type: Number,
    required: true
  }
}, { _id: false });

const leaderboardTypingSchema = new mongoose.Schema({
  boardType: {
    type: String,
    required: true,
    enum: ['global', 'by_language', 'weekly', 'friends']
  },
  language: {
    type: String,
    enum: ['en', 'km', null],
    default: null
  },
  periodStart: {
    type: Date,
    default: null
  },
  periodEnd: {
    type: Date,
    default: null
  },
  rankings: [rankingEntrySchema],
  computedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'leaderboards_typing'
});

leaderboardTypingSchema.index({ boardType: 1, language: 1, periodStart: -1 });

export default mongoose.model('LeaderboardTyping', leaderboardTypingSchema);
