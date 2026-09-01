import mongoose from 'mongoose';

const worldSchema = new mongoose.Schema({
  worldNumber: { type: Number, required: true, unique: true },
  title: String,
  description: String,
  
  story: {
    introduction: String,
    narrative: String,
    conclusion: String,
    storyCharacters: [String]
  },
  
  levels: [Number],
  totalLevels: Number,
  
  boss: {
    bossId: { type: mongoose.Schema.Types.ObjectId, ref: 'LevelDragon' },
    name: String,
    description: String,
    difficulty: String,
    requiredMapPieces: Number,
    unlockReward: String
  },
  
  requirements: {
    previousWorldCompleted: Boolean,
    previousWorldId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorldDragon' },
    minPlayerLevel: Number
  },
  
  rewards: {
    baseXP: Number,
    basePoints: Number,
    worldCompletionBonus: {
      xp: Number,
      items: [String]
    }
  },
  
  theme: {
    backgroundColor: String,
    primaryColor: String,
    musicTrack: String,
    environment: String,
    weather: String,
    ambiance: String
  },
  
  stats: {
    totalAttempts: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageTimeToComplete: { type: Number, default: 0 },
    averageStarsEarned: { type: Number, default: 0 },
    perfectRunsCount: { type: Number, default: 0 }
  },
  
  status: {
    isPublished: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    releaseDate: Date
  }
}, { timestamps: true });

worldSchema.index({ 'status.isPublished': 1 });

export default mongoose.model('WorldDragon', worldSchema);
