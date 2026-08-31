import mongoose from 'mongoose';

const userAccountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: false }, // optional — Google-only users have no password
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationTokenExpiry: Date,
  accountStatus: { type: String, enum: ['active', 'inactive', 'banned', 'suspended'], default: 'active' },
  accountStatusReason: String,
  passwordResetToken: String,
  passwordResetTokenExpiry: Date,
  security: {
    failedLoginAttempts: { type: Number, default: 0 },
    lastFailedLoginAt: Date,
    accountLockedUntil: Date,
    passwordChangedAt: Date
  },
  lastLoginAt: Date,
  socialAuth: {
    google: String,
    github: String
  },
  emailNotifications: {
    achievements: { type: Boolean, default: true },
    leaderboardUpdates: { type: Boolean, default: true },
    dailyChallenge: { type: Boolean, default: true },
    tips: { type: Boolean, default: false }
  }
}, { timestamps: true });

userAccountSchema.index({ accountStatus: 1 });
userAccountSchema.index({ 'security.accountLockedUntil': 1 });

export default mongoose.model('UserAccount', userAccountSchema);
