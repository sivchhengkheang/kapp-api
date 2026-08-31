import mongoose from 'mongoose';

const levelAttemptSchema = new mongoose.Schema({
  userAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  levelNumber: Number,
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSessionRobot' },

  // Which attempt within the session (1st try, 2nd try, etc.)
  attemptNumber: { type: Number, default: 1 },

  // Timeline
  startedAt: { type: Date, default: Date.now },
  endedAt: Date,

  // Outcome
  result: {
    status: { type: String, enum: ['completed', 'quit', 'failed', 'collision_ended'] },
    goalReached: { type: Boolean, default: false },
    movesUsed: { type: Number, default: 0 },
    timeUsed: Number, // seconds
    efficiency: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    collectiblesCollected: { type: Number, default: 0 },
  },

  // Detailed per-command trace
  commandTrace: [{
    command: { type: String, enum: ['FORWARD', 'TURN_LEFT', 'TURN_RIGHT', 'WAIT', 'LOOP_START', 'LOOP_END'] },
    position: { x: Number, y: Number },
    direction: { type: String, enum: ['NORTH', 'EAST', 'SOUTH', 'WEST'] },
    success: Boolean,
    collisionDetected: { type: Boolean, default: false },
    collisionWith: String,
    _id: false,
  }],

  // Mistakes in this attempt
  mistakes: [{
    type: { type: String, enum: ['collision', 'out_of_bounds', 'move_limit_exceeded', 'time_limit'] },
    atMove: Number,
    detail: String,
    _id: false,
  }],

  // The player's saved command plan (if they planned before executing)
  userPlan: {
    savedAt: Date,
    commands: [String],
    planNotes: String,
  },
}, { timestamps: true });

// Indexes
levelAttemptSchema.index({ userAccountId: 1, levelId: 1 });
levelAttemptSchema.index({ userAccountId: 1, createdAt: -1 });
levelAttemptSchema.index({ sessionId: 1 });
levelAttemptSchema.index({ levelId: 1, 'result.status': 1 });
levelAttemptSchema.index({ levelId: 1, 'result.efficiency': -1 });

export default mongoose.model('LevelAttempt', levelAttemptSchema);
