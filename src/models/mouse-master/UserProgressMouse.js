import mongoose from 'mongoose';

const userProgressMouseSchema = new mongoose.Schema({
  userAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccount',
    required: true
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MouseLevel',
    required: true
  },
  status: {
    type: String,
    enum: ['locked', 'unlocked', 'completed'],
    default: 'locked'
  },
  bestAccuracyPct:   { type: Number, default: 0 },
  bestAvgReactionMs: { type: Number, default: null },
  bestStars:         { type: Number, default: 0, min: 0, max: 3 },
  attemptsCount:     { type: Number, default: 0 },
  firstCompletedAt:  { type: Date, default: null },
  lastPlayedAt:      { type: Date, default: null }
}, { timestamps: true });

// Unique per user+level — enforces one progress record per level per user
userProgressMouseSchema.index({ userAccountId: 1, levelId: 1 }, { unique: true });
userProgressMouseSchema.index({ userAccountId: 1, status: 1 });

export default mongoose.model('UserProgressMouse', userProgressMouseSchema);
