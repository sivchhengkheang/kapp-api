import mongoose from 'mongoose';

const userAchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', required: true },
  achievementSlug: String,
  earnedAt: Date,
  earnedInSession: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSession' },
  progress: {
    current: Number,
    target: Number,
    completionPercentage: Number
  },
  notified: Boolean,
  notifiedAt: Date,
  isDisplayed: Boolean,
  displayOrder: Number
}, { timestamps: true });

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });
userAchievementSchema.index({ earnedAt: -1 });

export default mongoose.model('UserAchievement', userAchievementSchema);
