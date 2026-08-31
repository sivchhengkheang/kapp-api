import mongoose from 'mongoose';

const problemAttemptSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSessionMath' },
  problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MathProblem', required: true },
  operation: String,
  problem: String,
  userAnswer: String,
  correctAnswer: String,
  isCorrect: Boolean,
  timeToAnswer: Number,
  timeFromGameStart: Number,
  attemptNumber: Number,
  hintUsed: Boolean,
  skipped: Boolean,
  inputMethod: { type: String, enum: ['keyboard', 'mouse_click', 'touch'] },
  keystrokes: {
    totalKeypresses: Number,
    corrections: Number,
    deletions: Number,
    accuracy: Number
  },
  problemDifficulty: {
    baseLevel: Number,
    userLevel: Number,
    isAppropriate: Boolean
  },
  timestamp: Date
}, { timestamps: true }); 

problemAttemptSchema.index({ userAccountId: 1, timestamp: -1 });
problemAttemptSchema.index({ sessionId: 1 });
problemAttemptSchema.index({ problemId: 1 });

export default mongoose.model('ProblemAttempt', problemAttemptSchema);
