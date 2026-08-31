import mongoose from 'mongoose';

const loginHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: {
    type: { type: String, enum: ['successful', 'failed', 'logout'] },
    timestamp: Date
  },
  device: {
    type: { type: String, enum: ['mobile', 'desktop', 'tablet'] },
    os: String,
    browser: String,
    userAgent: String
  },
  network: {
    ipAddress: String,
    location: {
      country: String,
      city: String,
      timezone: String
    }
  },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuthSession' },
  logoutAt: Date,
  security: {
    isNewDevice: Boolean,
    isNewLocation: Boolean,
    requiresMFA: Boolean,
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] }
  }
}, { timestamps: true });

loginHistorySchema.index({ userId: 1, 'event.timestamp': -1 });
loginHistorySchema.index({ 'event.timestamp': 1 });
loginHistorySchema.index({ userId: 1, 'event.type': 1 });

export default mongoose.model('LoginHistory', loginHistorySchema);
