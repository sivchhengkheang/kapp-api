import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true }
}, { _id: false });

const gameSessionMouseSchema = new mongoose.Schema({
  userAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserAccount',
    required: true
  },
  levelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MouseLevel',
    required: true
  },
  gameModeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameModeMouse',
    required: true
  },
  startedAt: { type: Date, default: Date.now },
  endedAt:   { type: Date, default: null },
  durationMs:{ type: Number, default: null },

  // Aggregated results (denormalized for fast reads)
  targetsShown:      { type: Number, default: 0 },
  targetsHit:        { type: Number, default: 0 },
  targetsMissed:     { type: Number, default: 0 },
  accuracyPct:       { type: Number, default: 0 },
  avgReactionTimeMs: { type: Number, default: null },
  fastestReactionMs: { type: Number, default: null },
  slowestReactionMs: { type: Number, default: null },
  overshootCount:    { type: Number, default: 0 },  // near-miss clicks
  deviationScore:    { type: Number, default: null },// trace challenges: avg px deviation

  passed:      { type: Boolean, default: false },
  starsEarned: { type: Number, default: 0, min: 0, max: 3 },
  xpEarned:    { type: Number, default: 0 },

  deviceInfo: {
    inputType:    { type: String, enum: ['mouse', 'trackpad', 'touch'], default: 'mouse' },
    screenWidth:  Number,
    screenHeight: Number
  }
}, { timestamps: true });

gameSessionMouseSchema.index({ userAccountId: 1, levelId: 1, createdAt: -1 });
gameSessionMouseSchema.index({ levelId: 1, accuracyPct: -1 }); // per-level leaderboard queries

export default mongoose.model('GameSessionMouse', gameSessionMouseSchema);
