import mongoose from 'mongoose';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const positionSchema = new mongoose.Schema(
  { x: { type: Number, required: true }, y: { type: Number, required: true } },
  { _id: false }
);

const obstacleSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['wall', 'moving_wall', 'sensor_triggered'], required: true },
  // Static walls
  positions: [positionSchema],
  // Moving obstacles
  startPosition: positionSchema,
  path: [positionSchema],
  cycleDuration: Number,
  // Sensor-triggered
  position: positionSchema,
  triggerCondition: String,
  triggerDistance: Number,
  activatesWall: String,
  properties: {
    solid: { type: Boolean, default: true },
    movable: { type: Boolean, default: false },
    damageable: { type: Boolean, default: false },
    stopsRobot: { type: Boolean, default: true },
    damageOnCollision: { type: Boolean, default: false },
    oneTime: Boolean,
    deactivatesAfter: Number,
  },
}, { _id: false });

const levelSchema = new mongoose.Schema({
  // Identity
  levelNumber: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: String,

  // Difficulty & Category
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    required: true,
  },
  category: { type: String, required: true }, // e.g. 'maze_navigation', 'pattern_recognition'
  recommendedLevel: { type: Number, default: 1 },

  // Grid
  grid: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    cellSize: { type: Number, default: 40 },
  },

  // Robot starting config
  robot: {
    startPosition: { type: positionSchema, required: true },
    startDirection: {
      type: String,
      enum: ['NORTH', 'EAST', 'SOUTH', 'WEST'],
      default: 'NORTH',
    },
    robotType: { type: String, default: 'standard' },
    properties: {
      canRotate: { type: Boolean, default: true },
      canPushObjects: { type: Boolean, default: false },
      hasMemory: { type: Boolean, default: false },
      speed: { type: Number, default: 1 },
    },
  },

  // Goal
  goal: {
    position: { type: positionSchema, required: true },
    type: {
      type: String,
      enum: ['reach_point', 'collect_all', 'avoid_area', 'push_object'],
      default: 'reach_point',
    },
    objectives: [{
      id: String,
      type: String,
      position: positionSchema,
      required: { type: Boolean, default: true },
      _id: false,
    }],
  },

  // Obstacles
  obstacles: [obstacleSchema],

  // Collectibles
  collectibles: [{
    id: String,
    type: { type: String, default: 'star' },
    position: positionSchema,
    points: { type: Number, default: 100 },
    bonus: String,
    _id: false,
  }],

  // Solution
  solution: {
    optimalMoves: { type: Number, required: true },
    optimalTime: Number,
    optimalSequence: [String],
    allowedMoves: Number,
    timeLimit: Number,
    hints: [{
      id: String,
      level: Number,
      text: String,
      revealAfterAttempts: Number,
      revealAfterTime: Number,
      _id: false,
    }],
  },

  // Rewards
  rewards: {
    xpForCompletion: { type: Number, default: 250 },
    xpForOptimal: { type: Number, default: 500 },
    xpForPerfect: { type: Number, default: 1000 },
    pointsForCompletion: { type: Number, default: 250 },
    pointsForSpeed: { type: Number, default: 100 },
    bonusAchievement: String,
  },

  // Author
  author: {
    type: { type: String, enum: ['system', 'designer', 'user'], default: 'system' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', default: null },
  },

  // Aggregated stats (updated atomically)
  stats: {
    timesAttempted: { type: Number, default: 0 },
    timesCompleted: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageAttempts: { type: Number, default: 0 },
    averageMoves: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
    averageEfficiency: { type: Number, default: 0 },
    bestEfficiency: { type: Number, default: 0 },
  },

  // Publication
  status: {
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
  },
}, { timestamps: true });

// Indexes
levelSchema.index({ difficulty: 1 });
levelSchema.index({ category: 1 });
levelSchema.index({ recommendedLevel: 1 });
levelSchema.index({ 'status.isPublished': 1 });
levelSchema.index({ 'status.isFeatured': 1 });

export default mongoose.model('Level', levelSchema);
