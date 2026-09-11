import mongoose from 'mongoose';

const userAccountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email or Gmail address is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email or Gmail address'],
    index: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'],
    index: true,
  },
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
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Alias `gmail` to `email` for explicit support
userAccountSchema.virtual('gmail')
  .get(function () { return this.email; })
  .set(function (val) { this.email = val; });

userAccountSchema.index({ accountStatus: 1 });
userAccountSchema.index({ 'security.accountLockedUntil': 1 });

export default mongoose.model('UserAccount', userAccountSchema);
