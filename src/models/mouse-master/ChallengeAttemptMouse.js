import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true }
}, { _id: false });

const challengeAttemptMouseSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSessionMouse',
    required: true
  },
  targetIndex:   { type: Number, required: true }, // order within the session
  targetPosition:{ type: positionSchema, required: true },
  clickPosition: { type: positionSchema, default: null }, // null if missed/timed out
  hit:           { type: Boolean, required: true },
  reactionTimeMs:{ type: Number, default: null },
  overshootPx:   { type: Number, default: null }, // distance between click and target center
  actionType: {
    type: String,
    enum: ['click', 'double_click', 'right_click', 'drag', 'scroll', 'trace'],
    required: true
  },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false }); // Using custom `timestamp` field, no auto timestamps needed

// Efficient lookup of all events in a session ordered by index
challengeAttemptMouseSchema.index({ sessionId: 1, targetIndex: 1 });

// TTL index — auto-delete raw attempt logs after 90 days (optional, per schema note)
challengeAttemptMouseSchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 7776000 } // 90 days
);

export default mongoose.model('ChallengeAttemptMouse', challengeAttemptMouseSchema);
