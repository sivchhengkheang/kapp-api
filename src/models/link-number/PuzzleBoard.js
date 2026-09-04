import mongoose from 'mongoose';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const positionSchema = new mongoose.Schema(
  { x: { type: Number, required: true }, y: { type: Number, required: true } },
  { _id: false }
);

const numberPairSchema = new mongoose.Schema(
  {
    id:        { type: String, required: true },
    number:    { type: Number, required: true },
    positions: { type: [positionSchema], required: true }
  },
  { _id: false }
);

const solutionPathSchema = new mongoose.Schema(
  {
    pairId: { type: String, required: true },
    number: { type: Number, required: true },
    path:   { type: [positionSchema], required: true }
  },
  { _id: false }
);

const hintSchema = new mongoose.Schema(
  {
    id:                   { type: String, required: true },
    level:                { type: Number, required: true }, // 1 = first hint, 2 = deeper, ...
    text:                 { type: String, required: true },
    revealAfterTime:      { type: Number, default: null }, // seconds
    revealAfterAttempts:  { type: Number, default: null }
  },
  { _id: false }
);

const starRuleSchema = new mongoose.Schema(
  {
    minTime:      { type: Number, default: null }, // seconds
    maxMistakes:  { type: Number, default: null },
    allowMistakes:{ type: Boolean, default: true },
    xpBonus:      { type: Number, default: 0 }
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const puzzleBoardSchema = new mongoose.Schema(
  {
    boardNumber: { type: Number, required: true },
    title:       { type: String, required: true },
    description: { type: String, default: '' },

    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard', 'expert']
    },
    gridSize: {
      type: String,
      required: true,
      enum: ['3x3', '4x4', '5x5', '6x6', '7x7', '8x8']
    },
    category: {
      type: String,
      required: true,
      enum: ['standard', 'daily', 'weekly', 'special'],
      default: 'standard'
    },

    // Grid configuration
    grid: {
      width:       { type: Number, required: true },
      height:      { type: Number, required: true },
      totalCells:  { type: Number, required: true },
      numberPairs: { type: [numberPairSchema], required: true },
      totalPairs:  { type: Number, required: true }
    },

    // Gameplay constraints
    constraints: {
      pathsCannotCross:   { type: Boolean, default: true },
      mustFillAllCells:   { type: Boolean, default: true },
      eachCellUsedOnce:   { type: Boolean, default: true },
      perfectSolution: {
        pathsRequired:      { type: Number, default: null },
        totalCellsCovered:  { type: Number, default: null },
        optimalMoveCount:   { type: Number, default: null }
      }
    },

    // Canonical solution
    solution: {
      paths:            { type: [solutionPathSchema], default: [] },
      totalMovesOptimal:{ type: Number, default: null },
      isUnique:         { type: Boolean, default: true },
      solvableSteps:    { type: Number, default: null }
    },

    // Hints
    hints: { type: [hintSchema], default: [] },

    // Scoring & star system
    rewards: {
      baseXP:      { type: Number, default: 100 },
      xpForPerfect:{ type: Number, default: 300 },
      xpForSpeed:  { type: Number, default: 50 },
      stars: {
        oneStar:   { type: starRuleSchema, default: () => ({}) },
        twoStars:  { type: starRuleSchema, default: () => ({}) },
        threeStars:{ type: starRuleSchema, default: () => ({}) }
      }
    },

    // Difficulty analytics
    difficultyMetrics: {
      branchingFactor:      { type: Number, default: null },
      minPathLength:        { type: Number, default: null },
      maxPathLength:        { type: Number, default: null },
      averagePathLength:    { type: Number, default: null },
      symmetry:             { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
      deductionDifficulty:  { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
    },

    // Aggregate play stats (updated after each session)
    stats: {
      totalAttempts:               { type: Number, default: 0 },
      totalCompletions:            { type: Number, default: 0 },
      completionRate:              { type: Number, default: 0 },
      averageTime:                 { type: Number, default: 0 },
      averageAttemptsPerCompletion:{ type: Number, default: 0 },
      perfectRuns:                 { type: Number, default: 0 },
      abandonmentRate:             { type: Number, default: 0 },
      averageStarsEarned:          { type: Number, default: 0 }
    },

    // Visual theme
    theme: {
      backgroundColor: { type: String, default: '#F8F9FA' },
      lineColor:       { type: String, default: '#3B82F6' },
      numberColor:     { type: String, default: '#1F2937' },
      gridLineColor:   { type: String, default: '#E5E7EB' },
      successColor:    { type: String, default: '#10B981' },
      errorColor:      { type: String, default: '#EF4444' }
    },

    // Accessibility
    accessibility: {
      colorblindFriendly: { type: Boolean, default: true },
      highContrast:       { type: Boolean, default: false },
      largeNumbers:       { type: Boolean, default: false },
      voiceInstructions:  { type: Boolean, default: false }
    },

    // Publication status
    status: {
      isPublished:    { type: Boolean, default: false },
      isArchived:     { type: Boolean, default: false },
      isBeta:         { type: Boolean, default: false },
      isFeatureLevel: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
puzzleBoardSchema.index({ boardNumber: 1 }, { unique: true });
puzzleBoardSchema.index({ difficulty: 1 });
puzzleBoardSchema.index({ gridSize: 1 });
puzzleBoardSchema.index({ category: 1 });
puzzleBoardSchema.index({ 'status.isPublished': 1 });
puzzleBoardSchema.index({ 'stats.completionRate': -1 });

export default mongoose.model('PuzzleBoard', puzzleBoardSchema);
