import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema(
  {
    userAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAccount",
      required: true,
      unique: true,
    },
    displayName: String,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null,
    },
    bio: String,
    avatar: {
      url:          { type: String, default: null },
      uploadedAt:   { type: Date },
      source: {
        type: String,
        enum: ['auto', 'selected', 'google'], // auto=initial random, selected=user chose, google=OAuth picture
        default: 'auto',
      },
      avatarLocked: { type: Boolean, default: false }, // true after the user makes their one-time choice
      lockedAt:     { type: Date },                    // timestamp when the choice was made
    },
    profile: {
      countryCode: String,
      timezone: String,
      schoolName: String,
      gradeLevel: String,
      joinedFrom: {
        type: String,
        enum: ["web", "desktop_electron", "mobile_app"],
      },
    },
    preferences: {
      language: { type: String, enum: ["en", "km"], default: "en" },
      theme: { type: String, default: "light" },
      soundEnabled: { type: Boolean, default: true },
      musicEnabled: { type: Boolean, default: true },
      animationsEnabled: { type: Boolean, default: true },
      showHints: { type: Boolean, default: true },
      gridSize: { type: String, enum: ["small", "medium", "large"], default: "medium" },
      notificationsEnabled: { type: Boolean, default: true },
      showCorrectAnswer: { type: Boolean, default: true },
      operationsPreference: [String],
    },
    privacy: {
      profilePublic: { type: Boolean, default: true },
      showOnLeaderboard: { type: Boolean, default: true },
      allowFriendRequests: { type: Boolean, default: true },
      showAchievements: { type: Boolean, default: true },
    },
    stats: {
      level: { type: Number, default: 1 },
      currentXP: { type: Number, default: 0 },
      peakWPM: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
      totalGamesPlayed: { type: Number, default: 0 },
      totalMathProblems: { type: Number, default: 0 },
      lastPlayedAt: Date,
    },
    badges: {
      customTitle: String,
      statusMessage: String,
      featured: [String],
    },
  },
  { timestamps: true },
);

userProfileSchema.index({ "stats.level": -1 });
userProfileSchema.index({ "stats.peakWPM": -1 });

export default mongoose.model("UserProfile", userProfileSchema);
