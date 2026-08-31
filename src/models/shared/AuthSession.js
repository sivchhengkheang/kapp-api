import mongoose from 'mongoose';

const authSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokens: {
    refreshToken: String,
    refreshTokenHash: String,
    accessTokenHash: String
  },
  device: {
    type: { type: String, enum: ['mobile', 'desktop', 'tablet'] },
    name: String,
    userAgent: String
  },
  network: {
    ipAddress: String,
    location: {
      country: String,
      city: String,
      latitude: Number,
      longitude: Number
    }
  },
  lastActivityAt: Date,
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  wasRevoked: { type: Boolean, default: false },
  revokedAt: Date,
  revokedReason: String,
  security: {
    remoteLoginAttempts: { type: Number, default: 0 },
    suspiciousActivityFlag: { type: Boolean, default: false }
  }
}, { timestamps: true });

authSessionSchema.index({ userId: 1 });
authSessionSchema.index({ 'tokens.refreshToken': 1 });
authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
authSessionSchema.index({ isActive: 1 });

export default mongoose.model('AuthSession', authSessionSchema);
