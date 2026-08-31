import mongoose from 'mongoose';

const levelCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,

  // Icon
  icon: {
    url: String,
    color: { type: String, default: '#3498DB' },
  },

  // Level numbers that belong to this category
  levels: [Number],
  totalLevels: { type: Number, default: 0 },

  // Ordering & visibility
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  // Prerequisite categories (must complete these first)
  prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LevelCategory' }],

  // How difficulty ramps within this category
  difficultyProgression: [{
    name: String,
    levelRange: String,
    robots: { type: Number, default: 1 },
    obstacles: String,
    _id: false,
  }],

  // Aggregated stats
  stats: {
    totalAttempts: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    averageEfficiency: { type: Number, default: 0 },
    averageAttempts: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Indexes
levelCategorySchema.index({ displayOrder: 1 });
levelCategorySchema.index({ isActive: 1 });

export default mongoose.model('LevelCategory', levelCategorySchema);
