import mongoose from 'mongoose';

const keystrokeEventSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameSessionTyping',
    required: true
  },
  charIndex: {
    type: Number,
    required: true
  },
  expectedChar: {
    type: String,
    required: true
  },
  typedChar: {
    type: String,
    required: true
  },
  correct: {
    type: Boolean,
    required: true
  },
  keyCode: {
    type: String
  },
  timeSinceLastKeyMs: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  collection: 'keystroke_events'
});

keystrokeEventSchema.index({ sessionId: 1, charIndex: 1 });
keystrokeEventSchema.index({ timestamp: 1 });

export default mongoose.model('KeystrokeEvent', keystrokeEventSchema);
