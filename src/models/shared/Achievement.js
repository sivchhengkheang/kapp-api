import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  achievementId: { type: String, required: true, unique: true },
  name: String,
  description: String,
  icon: {
    url: String,
    rarity: String
  },
  requirement: {
    type: { type: String },
    targetWPM: Number,
    minimumAccuracy: Number,
    gameMode: String,
    targetLevel: Number
  },
  rewards: {
    xp: Number,
    points: Number,
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' }
  },
  category: { type: String, enum: ['speed', 'accuracy', 'consistency', 'progression', 'social'] },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'] },
  displayOrder: Number,
  stats: {
    totalEarned: Number,
    progressionPercentage: Number
  }
}, { timestamps: true });

achievementSchema.index({ category: 1 });

export default mongoose.model('Achievement', achievementSchema);
