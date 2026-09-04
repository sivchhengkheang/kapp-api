import mongoose from 'mongoose';

const deviceInfoSchema = new mongoose.Schema({
  keyboardLayout: {
    type: String,
    default: 'qwerty_en'
  },
  inputMethod: {
    type: String,
    enum: ['physical_keyboard', 'on_screen'],
    default: 'physical_keyboard'
  }
}, { _id: false });

const gameSessionTypingSchema = new mongoose.Schema({
  userAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccount',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypingLesson',
    default: null
  },
  gameModeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameModeTyping',
    default: null
  },
  language: {
    type: String,
    enum: ['en', 'km'],
    default: 'en'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  },
  durationMs: {
    type: Number,
    default: 0
  },
  charactersTyped: {
    type: Number,
    default: 0
  },
  charactersCorrect: {
    type: Number,
    default: 0
  },
  charactersIncorrect: {
    type: Number,
    default: 0
  },
  accuracyPct: {
    type: Number,
    default: 0
  },
  wpm: {
    type: Number,
    default: 0
  },
  netWpm: {
    type: Number,
    default: 0
  },
  backspaceCount: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  starsEarned: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  streakDayContribution: {
    type: Boolean,
    default: false
  },
  deviceInfo: {
    type: deviceInfoSchema,
    default: () => ({ keyboardLayout: 'qwerty_en', inputMethod: 'physical_keyboard' })
  }
}, {
  timestamps: true,
  collection: 'game_sessions_typing'
});

gameSessionTypingSchema.index({ userAccountId: 1, lessonId: 1, createdAt: -1 });
gameSessionTypingSchema.index({ lessonId: 1, netWpm: -1 });

export default mongoose.model('GameSessionTyping', gameSessionTypingSchema);
