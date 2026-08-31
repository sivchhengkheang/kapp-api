import mongoose from 'mongoose';

const robotTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,

  // What this robot can do
  properties: {
    speed: { type: Number, default: 1 },       // cells per second
    size: { type: Number, default: 1 },         // in cells
    canRotate: { type: Boolean, default: true },
    canPushObjects: { type: Boolean, default: false },
    canJump: { type: Boolean, default: false },
    hasMemory: { type: Boolean, default: false }, // can record & replay
    hasLoops: { type: Boolean, default: false },  // supports LOOP commands
    canSense: { type: Boolean, default: false },  // can detect obstacles ahead
  },

  // Commands available for this robot type
  availableCommands: {
    type: [String],
    enum: ['FORWARD', 'TURN_LEFT', 'TURN_RIGHT', 'WAIT', 'LOOP_START', 'LOOP_END', 'SENSE', 'JUMP'],
    default: ['FORWARD', 'TURN_LEFT', 'TURN_RIGHT', 'WAIT'],
  },

  // Visual representation
  sprite: {
    url: String,
    color: { type: String, default: '#3498DB' },
  },

  // Unlock requirement
  unlockedAt: { type: Number, default: 0 }, // player must reach this level number

  // Availability
  isAvailable: { type: Boolean, default: true },

  // Usage stats
  stats: {
    timesUsed: { type: Number, default: 0 },
    averageSuccessRate: { type: Number, default: 0 },
    averageEfficiency: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Indexes
robotTypeSchema.index({ unlockedAt: 1 });
robotTypeSchema.index({ isAvailable: 1 });

export default mongoose.model('RobotType', robotTypeSchema);
