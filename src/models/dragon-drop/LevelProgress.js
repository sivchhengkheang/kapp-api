import mongoose from 'mongoose';

const levelProgressSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'LevelDragon', required: true },
  levelNumber: { type: Number, required: true },
  worldNumber: { type: Number, required: true },
  
  status: { type: String, enum: ['locked', 'unlocked', 'in_progress', 'completed'], default: 'locked' },
  unlockedAt: Date,
  firstAttemptAt: Date,
  completedAt: Date,
  
  currentStars: { type: Number, default: 0 },
  maxStars: { type: Number, default: 3 },
  threeStarRequirement: {
    collectAllItems: Boolean,
    movesLimit: Number,
    score: Number
  },
  
  totalAttempts: { type: Number, default: 0 },
  attempts: [{
    attemptNumber: Number,
    status: { type: String, enum: ['failed', 'completed', 'quit'] },
    starRating: Number,
    score: Number,
    movesUsed: Number,
    collectedItems: Number,
    attemptedAt: Date,
    _id: false
  }],
  
  mapPiecesCollected: [{
    id: String,
    collectedAt: Date,
    attemptNumber: Number,
    _id: false
  }],
  mapPiecesMissing: [String],
  
  bestAttempt: {
    attemptNumber: Number,
    score: Number,
    stars: Number,
    movesUsed: Number,
    collectedItems: Number
  },
  
  rewardsClaimed: {
    xp: Number,
    points: Number,
    firstCompletionBonus: Boolean,
    starBonuses: {
      oneStar: Boolean,
      twoStar: Boolean,
      threeStar: Boolean
    }
  }
}, { timestamps: true });

levelProgressSchema.index({ userAccountId: 1, levelId: 1 }, { unique: true });
levelProgressSchema.index({ userAccountId: 1, worldNumber: 1 });

export default mongoose.model('LevelProgressDragon', levelProgressSchema);
