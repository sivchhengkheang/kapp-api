import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true, unique: true },
  displayName: String,
  bio: String,
  avatar: {
    url: String,
    uploadedAt: Date,
    type: { type: String }
  },
  profile: {
    countryCode: String,
    timezone: String,
    schoolName: String,
    gradeLevel: String,
    joinedFrom: { type: String, enum: ['web', 'desktop_electron', 'mobile_app'] }
  },
  preferences: {
    language: { type: String, enum: ['en', 'km'], default: 'en' },
    theme: { type: String, default: 'light' },
    soundEnabled: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    showCorrectAnswer: { type: Boolean, default: true },
    operationsPreference: [String]
  },
  privacy: {
    profilePublic: { type: Boolean, default: true },
    showOnLeaderboard: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true },
    showAchievements: { type: Boolean, default: true }
  },
  stats: {
    level: { type: Number, default: 1 },
    currentXP: { type: Number, default: 0 },
    peakWPM: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    totalGamesPlayed: { type: Number, default: 0 },
    totalMathProblems: { type: Number, default: 0 },
    lastPlayedAt: Date
  },
  badges: {
    customTitle: String,
    statusMessage: String,
    featured: [String]
  }
}, { timestamps: true });

userProfileSchema.index({ 'stats.level': -1 });
userProfileSchema.index({ 'stats.peakWPM': -1 });

export default mongoose.model('UserProfile', userProfileSchema);
