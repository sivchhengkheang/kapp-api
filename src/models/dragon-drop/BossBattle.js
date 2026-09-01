import mongoose from 'mongoose';

const bossBattleSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  bossLevelId: { type: mongoose.Schema.Types.ObjectId, ref: 'LevelDragon', required: true },
  bossName: String,
  worldNumber: { type: Number, required: true },
  bossNumber: Number,
  
  status: { type: String, enum: ['completed', 'failed', 'in_progress'], default: 'in_progress' },
  battleResult: { type: String, enum: ['victory', 'defeat'] },
  
  attempts: {
    attemptNumber: Number,
    maxAttempts: Number,
    startedAt: Date,
    endedAt: Date,
    durationSeconds: Number
  },
  
  boss: {
    name: String,
    health: Number,
    healthRemaining: Number,
    element: String,
    attackPower: Number,
    attacks: [{
      name: String,
      damage: Number,
      interval: String,
      description: String,
      _id: false
    }]
  },
  
  performance: {
    playerDamageDealt: Number,
    bossHealthRemaining: Number,
    damagePercentage: Number,
    
    totalMoves: Number,
    totalCombos: Number,
    bestCombo: Number,
    
    score: Number,
    timeBonus: Number,
    totalScore: Number
  },
  
  rewards: {
    xpEarned: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    itemDrops: [String]
  },
  
  nextAttempt: {
    availableAt: Date,
    retriesRemaining: Number
  }
}, { timestamps: true });

bossBattleSchema.index({ userAccountId: 1, bossLevelId: 1 });
bossBattleSchema.index({ userAccountId: 1, createdAt: -1 });

export default mongoose.model('BossBattleDragon', bossBattleSchema);
