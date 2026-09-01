import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true }
}, { _id: false });

const gameSessionDragonSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'LevelDragon', required: true },
  levelNumber: { type: Number, required: true },
  worldNumber: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'normal', 'hard'] },
  
  timing: {
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    durationSeconds: Number,
    pausedSeconds: { type: Number, default: 0 }
  },
  
  performance: {
    status: { type: String, enum: ['in_progress', 'completed', 'quit', 'failed'], default: 'in_progress' },
    levelPassed: Boolean,
    starRating: { type: Number, min: 0, max: 3 },
    movesUsed: Number,
    movesAvailable: Number,
    movesRemaining: Number,
    score: Number,
    baseScore: Number,
    comboBonus: Number,
    collectibleBonus: Number
  },
  
  collectibles: {
    collected: [{
      id: String,
      type: { type: String },
      collectedAt: Number,
      moveNumber: Number,
      requiredCombo: Number,
      actualCombo: Number,
      _id: false
    }],
    missed: [{
      id: String,
      type: { type: String },
      reason: String,
      _id: false
    }],
    collectionProgress: {
      mapPieces: Number,
      mapPiecesTotal: Number,
      specialOrbs: Number,
      specialOrbsTotal: Number
    }
  },
  
  moveSequence: [{
    moveNumber: Number,
    startGridState: [mongoose.Schema.Types.Mixed],
    endGridState: [mongoose.Schema.Types.Mixed],
    action: {
      dragFrom: positionSchema,
      dragTo: positionSchema,
      orb: String
    },
    matches: [{
      type: { type: String },
      count: Number,
      position: positionSchema,
      orbs: [String],
      _id: false
    }],
    comboCount: Number,
    scoreEarned: Number,
    cascadeOccurred: Boolean,
    _id: false
  }],
  
  combos: {
    totalCombos: Number,
    bestCombo: Number,
    comboHistory: [{
      moveNumber: Number,
      comboCount: Number,
      scoreEarned: Number,
      _id: false
    }]
  },
  
  mistakes: [mongoose.Schema.Types.Mixed],
  
  rewards: {
    xpEarned: Number,
    xpBonus: Number,
    totalXP: Number,
    pointsEarned: Number,
    mapPiecesEarned: Number,
    orbsEarned: Number,
    achievementsUnlocked: [String],
    levelUpAchieved: Boolean
  },
  
  analytics: {
    playStyle: { type: String, enum: ['quick', 'strategic', 'casual'] },
    comboFrequency: String,
    cascadeFrequency: Number,
    restartCount: Number,
    hintUsed: Boolean
  },
  
  device: {
    type: { type: String },
    os: String,
    browser: String,
    screenSize: String
  }
}, { timestamps: true });

gameSessionDragonSchema.index({ userAccountId: 1 });
gameSessionDragonSchema.index({ userAccountId: 1, createdAt: -1 });
gameSessionDragonSchema.index({ levelId: 1 });
gameSessionDragonSchema.index({ 'performance.status': 1 });

export default mongoose.model('GameSessionDragon', gameSessionDragonSchema);
