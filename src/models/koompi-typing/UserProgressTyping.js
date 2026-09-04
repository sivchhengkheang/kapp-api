import mongoose from 'mongoose';

const userProgressTypingSchema = new mongoose.Schema({
  userAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccount',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypingLesson',
    required: true
  },
  status: {
    type: String,
    enum: ['locked', 'unlocked', 'completed'],
    default: 'unlocked'
  },
  bestAccuracyPct: {
    type: Number,
    default: 0
  },
  bestWpm: {
    type: Number,
    default: 0
  },
  bestNetWpm: {
    type: Number,
    default: 0
  },
  bestStars: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  attemptsCount: {
    type: Number,
    default: 0
  },
  firstCompletedAt: {
    type: Date,
    default: null
  },
  lastPlayedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'user_progress_typing'
});

userProgressTypingSchema.index({ userAccountId: 1, lessonId: 1 }, { unique: true });
userProgressTypingSchema.index({ userAccountId: 1, status: 1 });

export default mongoose.model('UserProgressTyping', userProgressTypingSchema);
