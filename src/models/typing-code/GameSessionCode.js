import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gameMode: { type: String, enum: ['timed', 'survival', 'challenge', 'practice', 'race'] },
  category: String,
  difficulty: String,
  challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
  timing: {
    startedAt: Date,
    endedAt: Date,
    durationSeconds: Number
  },
  performance: {
    totalTyped: Number,
    wordsTyped: Number,
    correctWords: Number,
    incorrectWords: Number,
    accuracy: Number,
    wpm: Number,
    peakWpm: Number,
    correctCharacters: Number,
    incorrectCharacters: Number,
    keyPresses: Number,
    completionPercentage: Number
  },
  results: {
    status: { type: String, enum: ['completed', 'quit', 'failed', 'paused'] },
    score: Number,
    xpEarned: Number,
    isPersonalBest: Boolean,
    rank: Number,
    streakBonus: Number,
    accuracyBonus: Number,
    speedBonus: Number,
    consistencyBonus: Number
  },
  powerUps: [{
    id: mongoose.Schema.Types.ObjectId,
    name: String,
    category: String,
    usedAt: Date,
    duration: Number,
    effectiveness: Number,
    impact: {
      wpsBefore: Number,
      wpsAfter: Number,
      improved: Boolean
    },
    preventedFailure: Boolean
  }],
  mistakes: [{
    position: Number,
    characterTyped: String,
    expectedCharacter: String,
    context: String,
    time: Date
  }],
  consistency: {
    score: Number,
    wpmVariance: Number,
    stabilityPeriod: { type: String, enum: ['unstable', 'slightly_stable', 'stable', 'very_stable'] }
  },
  device: {
    type: { type: String, enum: ['mobile', 'desktop', 'tablet'] },
    os: String,
    browser: String
  },
  challengeData: {
    snippetLength: Number,
    languageUsed: String,
    timeAllowedSeconds: Number
  }
}, { timestamps: true });

gameSessionSchema.index({ userId: 1, createdAt: -1 });
gameSessionSchema.index({ category: 1, createdAt: -1 });
gameSessionSchema.index({ 'results.status': 1 });
gameSessionSchema.index({ 'performance.wpm': -1 });

export default mongoose.model('GameSessionCode', gameSessionSchema);
