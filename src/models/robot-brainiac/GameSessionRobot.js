import mongoose from 'mongoose';

const commandStepSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  command: {
    type: String,
    enum: ['FORWARD', 'TURN_LEFT', 'TURN_RIGHT', 'WAIT', 'LOOP_START', 'LOOP_END'],
    required: true,
  },
  executed: { type: Boolean, default: true },
  result: { type: String, enum: ['success', 'collision', 'blocked', 'out_of_bounds'] },
  timestamp: Number, // seconds from session start
  robotPosition: { x: Number, y: Number },
  robotDirection: { type: String, enum: ['NORTH', 'EAST', 'SOUTH', 'WEST'] },
}, { _id: false });

const mistakeSchema = new mongoose.Schema({
  moveNumber: Number,
  command: String,
  result: String,
  collisionWith: String,
  attempted: Boolean,
  consequences: String,
}, { _id: false });

const gameSessionRobotSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  levelNumber: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'] },

  // Timing
  timing: {
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    durationSeconds: Number,
    pausedSeconds: { type: Number, default: 0 },
  },

  // Core performance
  performance: {
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'quit', 'failed'],
      default: 'in_progress',
    },
    goalReached: { type: Boolean, default: false },
    movesExecuted: { type: Number, default: 0 },
    optimalMoves: Number,
    efficiency: { type: Number, default: 0 }, // (optimalMoves / movesExecuted) * 100
    timeToSolve: Number,
    timeOptimal: Number,
    speedRating: { type: Number, default: 0 },
    collectiblesCollected: { type: Number, default: 0 },
    collectiblesTotal: { type: Number, default: 0 },
    bonusCollected: String,
    attemptCount: { type: Number, default: 1 }, // how many restarts this session
  },

  // Full command sequence submitted
  commandSequence: [commandStepSchema],

  // Collisions & mistakes
  mistakes: [mistakeSchema],

  // Scoring breakdown
  scoring: {
    baseScore: { type: Number, default: 0 },
    efficiencyBonus: { type: Number, default: 0 },
    speedBonus: { type: Number, default: 0 },
    collectibleBonus: { type: Number, default: 0 },
    perfectBonus: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
  },

  // Rewards earned
  rewards: {
    xpEarned: { type: Number, default: 0 },
    xpBonus: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    achievementsUnlocked: [String],
    levelUpAchieved: { type: Boolean, default: false },
    isPersonalBest: { type: Boolean, default: false },
  },

  // Play style analytics
  analytics: {
    playStyle: {
      type: String,
      enum: ['quick_and_dirty', 'methodical', 'optimized'],
      default: 'methodical',
    },
    restartCount: { type: Number, default: 0 },
    hintUsed: { type: Boolean, default: false },
    hintsUsedCount: { type: Number, default: 0 },
    autoSolveUsed: { type: Boolean, default: false },
    strategicPauses: { type: Number, default: 0 },
  },

  // Device
  device: {
    type: { type: String, enum: ['mobile', 'desktop', 'tablet'], default: 'desktop' },
    os: String,
    browser: String,
  },
}, { timestamps: true });

// Indexes
gameSessionRobotSchema.index({ userAccountId: 1 });
gameSessionRobotSchema.index({ userAccountId: 1, createdAt: -1 });
gameSessionRobotSchema.index({ levelId: 1 });
gameSessionRobotSchema.index({ 'performance.status': 1 });
gameSessionRobotSchema.index({ 'performance.efficiency': -1 });
gameSessionRobotSchema.index({ 'scoring.totalScore': -1 });

export default mongoose.model('GameSessionRobot', gameSessionRobotSchema);
