import mongoose from 'mongoose';

const gameSessionMathSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  gameMode: { type: String, enum: ['timed_challenge', 'survival', 'daily_challenge', 'practice', 'test'] },
  category: String,
  operations: [String],
  difficulty: String,
  settings: {
    durationSeconds: Number,
    problemCount: Number,
    showTimer: Boolean,
    showScore: Boolean,
    hintAllowed: Boolean,
    showPreviousProblem: Boolean
  },
  timing: {
    startedAt: Date,
    endedAt: Date,
    durationSeconds: Number
  },
  performance: {
    totalProblems: Number,
    solvedCorrectly: Number,
    solvedIncorrectly: Number,
    skipped: Number,
    accuracy: Number,
    wpm: Number,
    peakWpm: Number,
    averageProblemTime: Number,
    fastestProblem: Number,
    slowestProblem: Number,
    longestCorrectStreak: Number,
    currentCorrectStreak: Number
  },
  results: {
    status: { type: String, enum: ['completed', 'quit', 'paused', 'failed'] },
    score: Number,
    xpEarned: Number,
    isPersonalBest: Boolean,
    previousBestScore: Number
  },
  problemDetails: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MathProblem' },
    operation: String,
    problem: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeToAnswer: Number,
    attemptNumber: Number
  }],
  mistakes: [{
    position: Number,
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MathProblem' },
    operation: String,
    problem: String,
    userAnswer: String,
    correctAnswer: String,
    mistakeType: String,
    timeToAnswer: Number
  }],
  device: {
    type: { type: String, enum: ['web', 'desktop_electron', 'mobile'] },
    os: String,
    browser: String,
    language: String
  },
  consistency: {
    score: Number,
    timeVariance: Number,
    accuracyStability: { type: String, enum: ['unstable', 'slightly_consistent', 'consistent', 'very_consistent'] }
  }
}, { timestamps: true });

gameSessionMathSchema.index({ userAccountId: 1 });
gameSessionMathSchema.index({ userAccountId: 1, createdAt: -1 });
gameSessionMathSchema.index({ category: 1, createdAt: -1 });
gameSessionMathSchema.index({ 'results.status': 1 });
gameSessionMathSchema.index({ 'performance.accuracy': -1 });

export default mongoose.model('GameSessionMath', gameSessionMathSchema);
