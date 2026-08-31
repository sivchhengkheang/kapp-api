import mongoose from 'mongoose';

const mathProblemSchema = new mongoose.Schema({
  problemId: { type: String, required: true, unique: true },
  title: String,
  description: String,
  operation: { type: String, enum: ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals', 'mixed'] },
  category: String,
  subcategory: String,
  difficulty: { type: String, enum: ['beginner', 'easy', 'intermediate', 'hard', 'expert'] },
  problem: {
    operand1: mongoose.Schema.Types.Mixed,
    operand2: mongoose.Schema.Types.Mixed,
    operator: String,
    displayText: String,
    answerText: String
  },
  answer: {
    correctAnswer: mongoose.Schema.Types.Mixed,
    acceptableFormats: [mongoose.Schema.Types.Mixed],
    isInteger: Boolean,
    canBeNegative: Boolean,
    precision: Number
  },
  commonMistakes: [{
    answer: mongoose.Schema.Types.Mixed,
    explanation: String
  }],
  creator: {
    type: { type: String, enum: ['system', 'teacher', 'user'] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount' }
  },
  stats: {
    timesAttempted: { type: Number, default: 0 },
    timesCorrect: { type: Number, default: 0 },
    successRate: Number,
    averageTimeSeconds: Number,
    averageWPMOnAnswer: Number,
    commonErrorRate: Number
  },
  difficultyAdjustments: {
    baseDifficulty: Number,
    adjustedByData: Number,
    recommendedForLevel: Number
  },
  status: {
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
    isReviewedByTeacher: { type: Boolean, default: false }
  },
  translations: mongoose.Schema.Types.Mixed,
  tags: [String]
}, { timestamps: true });

mathProblemSchema.index({ operation: 1, difficulty: 1 });
mathProblemSchema.index({ category: 1, subcategory: 1 });
mathProblemSchema.index({ 'status.isActive': 1 });
mathProblemSchema.index({ 'difficultyAdjustments.recommendedForLevel': 1 });
mathProblemSchema.index({ tags: 1 });

export default mongoose.model('MathProblem', mathProblemSchema);
