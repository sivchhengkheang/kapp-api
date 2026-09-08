import mongoose from 'mongoose';

const inventoryItemSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  type: { type: String, enum: ['power_up', 'cosmetic', 'boost', 'theme', 'avatar', 'item', 'other'] },
  category: String,
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'] },
  effect: {
    type: { type: String },
    parameters: {
      durationSeconds: Number,
      timeMultiplier: Number,
      visual: String,
      audio: String
    },
    impact: {
      wpsBenefitPercent: Number,
      accuracyBenefitPercent: Number,
      averageScoreIncrease: Number
    }
  },
  asset: {
    iconUrl: String,
    animationUrl: String,
    previewUrl: String,
    cssUrl: String
  },
  cost: {
    points: Number,
    xp: Number,
    premium: Number
  },
  stackable: Boolean,
  maxStackCount: Number,
  acquisition: {
    isPurchasable: Boolean,
    isAchievable: Boolean,
    achievementRequired: String,
    dropRate: Number
  },
  cooldown: {
    cooldownSeconds: Number,
    usesPerGame: Number
  },
  stats: {
    totalAcquired: Number,
    totalUsed: Number,
    averageEffectiveness: Number,
    popularityRank: Number,
    usersUsingNow: Number,
    satisfaction: Number
  }
}, { timestamps: true });

export default mongoose.model('InventoryItem', inventoryItemSchema);
