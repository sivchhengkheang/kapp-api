import mongoose from 'mongoose';

const skillBadgeMouseSchema = new mongoose.Schema({
  userAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccount',
    required: true
  },
  categoryKey: {
    type: String,
    required: true,
    enum: ['click_basics', 'double_right_click', 'drag_drop', 'scroll_precision', 'mixed_challenge']
  },
  badgeName: { type: String, required: true },
  earnedAt:  { type: Date, default: Date.now },
  levelIdOnEarn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MouseLevel'
  }
}, { timestamps: true });

// A user can earn each category badge only once
skillBadgeMouseSchema.index({ userAccountId: 1, categoryKey: 1 }, { unique: true });

export default mongoose.model('SkillBadgeMouse', skillBadgeMouseSchema);
