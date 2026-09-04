import mongoose from 'mongoose';

const streakHistoryItemSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  sessionsPlayed: {
    type: Number,
    default: 1
  },
  xpEarned: {
    type: Number,
    default: 0
  }
}, { _id: false });

const userStreakTypingSchema = new mongoose.Schema({
  userAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccount',
    required: true,
    unique: true
  },
  currentStreakDays: {
    type: Number,
    default: 0
  },
  longestStreakDays: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: null
  },
  streakFreezesAvailable: {
    type: Number,
    default: 1
  },
  history: [streakHistoryItemSchema]
}, {
  timestamps: true,
  collection: 'user_streaks_typing'
});

export default mongoose.model('UserStreakTyping', userStreakTypingSchema);
