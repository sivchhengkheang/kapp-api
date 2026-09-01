import mongoose from 'mongoose';

const worldProgressSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  worldNumber: { type: Number, required: true },
  worldTitle: String,
  
  status: { type: String, enum: ['locked', 'unlocked', 'in_progress', 'completed'], default: 'locked' },
  unlockedAt: Date,
  startedAt: Date,
  completedAt: Date,
  
  levelsTotal: Number,
  levelsCompleted: { type: Number, default: 0 },
  levelsInProgress: { type: Number, default: 0 },
  levelsLocked: Number,
  
  starsEarned: { type: Number, default: 0 },
  starsPercentage: { type: Number, default: 0 },
  
  mapPiecesCollected: { type: Number, default: 0 },
  mapPiecesNeeded: Number,
  mapPiecesProgress: { type: Number, default: 0 },
  
  orbsCollected: { type: Number, default: 0 },
  orbsTotal: Number,
  
  bossLevel: {
    levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'LevelDragon' },
    title: String,
    status: { type: String, enum: ['locked', 'unlocked', 'attempted', 'defeated'], default: 'locked' },
    requiredMapPieces: Number,
    currentMapPieces: Number,
    attemptCount: { type: Number, default: 0 },
    defeats: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    storyReward: String
  },
  
  rewards: {
    totalXP: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    unlockedStory: String,
    nextStorySegment: String
  },
  
  stats: {
    totalTimeSpentSeconds: { type: Number, default: 0 },
    averageLevelTime: { type: Number, default: 0 },
    bestLevelScore: { type: Number, default: 0 },
    totalMovesAveraged: { type: Number, default: 0 },
    bestCombo: { type: Number, default: 0 }
  },
  
  milestones: {
    firstLevelCompleted: Date,
    firstPerfectRun: Date,
    allMapPiecesCollected: Date,
    bossUnlocked: Date
  }
}, { timestamps: true });

worldProgressSchema.index({ userAccountId: 1, worldNumber: 1 }, { unique: true });
worldProgressSchema.index({ status: 1 });

export default mongoose.model('WorldProgressDragon', worldProgressSchema);
