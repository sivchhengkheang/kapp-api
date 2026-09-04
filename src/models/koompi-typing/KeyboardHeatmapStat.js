import mongoose from 'mongoose';

const singleKeyStatSchema = new mongoose.Schema({
  attempts: {
    type: Number,
    default: 0
  },
  correct: {
    type: Number,
    default: 0
  },
  avgTimeMs: {
    type: Number,
    default: 0
  }
}, { _id: false });

const keyboardHeatmapStatSchema = new mongoose.Schema({
  userAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccount',
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'km'],
    required: true,
    default: 'en'
  },
  keyStats: {
    type: Map,
    of: singleKeyStatSchema,
    default: () => new Map()
  }
}, {
  timestamps: true,
  collection: 'keyboard_heatmap_stats'
});

keyboardHeatmapStatSchema.index({ userAccountId: 1, language: 1 }, { unique: true });

export default mongoose.model('KeyboardHeatmapStat', keyboardHeatmapStatSchema);
