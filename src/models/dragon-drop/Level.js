import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true }
}, { _id: false });

const levelSchema = new mongoose.Schema({
  levelNumber: { type: Number, required: true, unique: true },
  worldNumber: { type: Number, required: true },
  title: { type: String, required: true },
  storyText: String,
  
  difficulty: { type: String, enum: ['easy', 'normal', 'hard'], required: true },
  recommendedLevel: Number,
  
  puzzle: {
    gridWidth: Number,
    gridHeight: Number,
    initialOrbs: [{
      x: Number,
      y: Number,
      type: { type: String },
      _id: false
    }],
    orbTypes: [String],
    specialOrbs: [{
      x: Number,
      y: Number,
      type: { type: String },
      rarity: String,
      _id: false
    }]
  },
  
  objectives: {
    primary: {
      type: { type: String },
      targetCount: Number,
      description: String
    },
    collectibles: [{
      id: String,
      type: { type: String },
      position: positionSchema,
      requiresCombo: Number,
      description: String,
      _id: false
    }]
  },
  
  obstacles: [{
    id: String,
    type: { type: String },
    positions: [positionSchema],
    position: positionSchema,
    hitsRequired: Number,
    blocksOrbs: Boolean,
    unlocksAt: String,
    _id: false
  }],
  
  rules: {
    moveLimit: Number,
    timeLimit: Number,
    comboMultiplier: Number,
    cascadeEnabled: Boolean
  },
  
  rewards: {
    baseXP: Number,
    xpForCollectibles: Number,
    xpForMovesFull: Number,
    stars: {
      oneStar: { minMovesUsed: Number, minScore: Number, xpBonus: Number, rewardText: String },
      twoStars: { minMovesUsed: Number, minScore: Number, xpBonus: Number, collectAllItems: Boolean, rewardText: String },
      threeStars: { minMovesUsed: Number, minScore: Number, xpBonus: Number, collectAllItems: Boolean, rewardText: String }
    }
  },
  
  solution: {
    optimalMoves: Number,
    optimalCombos: Number,
    hints: [{
      id: String,
      level: Number,
      text: String,
      revealAfterAttempts: Number,
      revealAfterTime: Number,
      _id: false
    }]
  },
  
  author: {
    type: { type: String, default: 'system' },
    designNotes: String
  },
  
  stats: {
    timesAttempted: { type: Number, default: 0 },
    timesCompleted: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageMovesUsed: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    perfectRunsCount: { type: Number, default: 0 },
    averageAttempts: { type: Number, default: 0 }
  },
  
  unlocks: {
    unlockedAt: String,
    nextLevel: Number,
    leadsToWorld: Number,
    leadsToBonus: String
  },
  
  theme: {
    background: String,
    musicTrack: String,
    particleEffects: [String]
  },
  
  status: {
    isPublished: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false }
  }
}, { timestamps: true });

levelSchema.index({ worldNumber: 1, levelNumber: 1 });
levelSchema.index({ difficulty: 1 });
levelSchema.index({ 'stats.completionRate': -1 });

export default mongoose.model('LevelDragon', levelSchema);
