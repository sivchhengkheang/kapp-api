import mongoose from 'mongoose';

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const positionSchema = new mongoose.Schema(
  { x: { type: Number, required: true }, y: { type: Number, required: true } },
  { _id: false }
);

const pathSegmentSchema = new mongoose.Schema(
  {
    x:    { type: Number, required: true },
    y:    { type: Number, required: true },
    x_to: { type: Number, required: true },
    y_to: { type: Number, required: true }
  },
  { _id: false }
);

// Polymorphic move entry — action drives which fields are relevant
const moveHistorySchema = new mongoose.Schema(
  {
    moveNumber:   { type: Number, required: true },
    timestamp:    { type: Number, required: true }, // seconds from session start
    action: {
      type: String,
      required: true,
      enum: ['draw_path', 'undo', 'hint_used', 'restart', 'clear_path']
    },
    // draw_path fields
    pairId:       { type: String, default: null },
    number:       { type: Number, default: null },
    pathSegments: { type: [pathSegmentSchema], default: [] },
    cellsCovered: { type: Number, default: null },
    isValid:      { type: Boolean, default: null },
    pathLength:   { type: Number, default: null },
    // undo fields
    undoType:     { type: String, default: null }, // 'last_move' | 'full_path'
    reason:       { type: String, default: null },
    // hint fields
    hintLevel:    { type: Number, default: null },
    hintText:     { type: String, default: null }
  },
  { _id: false }
);

const pathDetailSchema = new mongoose.Schema(
  {
    pathId:            { type: String, required: true },
    pairId:            { type: String, required: true },
    number:            { type: Number, required: true },
    cellsCovered:      { type: Number, required: true },
    cellsList:         { type: [positionSchema], default: [] },
    isCorrect:         { type: Boolean, default: false },
    crossesAnotherPath:{ type: Boolean, default: false },
    completionTime:    { type: Number, default: null } // seconds
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────

const gameSessionLinkSchema = new mongoose.Schema(
  {
    userAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PuzzleBoard',
      required: true
    },
    boardNumber: { type: Number, required: true },
    difficulty:  { type: String, enum: ['easy', 'medium', 'hard', 'expert'], required: true },
    gridSize:    { type: String, required: true },

    // Timing
    timing: {
      startedAt:            { type: Date, default: Date.now },
      endedAt:              { type: Date, default: null },
      durationSeconds:      { type: Number, default: null },
      activePlayTimeSeconds:{ type: Number, default: null },
      pausedSeconds:        { type: Number, default: 0 }
    },

    // Game result
    result: {
      status: {
        type: String,
        enum: ['in_progress', 'completed', 'quit', 'failed', 'paused'],
        default: 'in_progress'
      },
      puzzleSolved:          { type: Boolean, default: false },
      boardFilled:           { type: Boolean, default: false },
      mistakesMade:          { type: Number, default: 0 },
      unvalidMovesAttempted: { type: Number, default: 0 },
      firstTryComplete:      { type: Boolean, default: false },
      starRating:            { type: Number, default: 0, min: 0, max: 3 },
      score:                 { type: Number, default: 0 },
      baseScore:             { type: Number, default: 0 },
      timeBonus:             { type: Number, default: 0 },
      perfectBonus:          { type: Number, default: 0 },
      xpEarned:              { type: Number, default: 0 }
    },

    // Detailed move log
    moveHistory: { type: [moveHistorySchema], default: [] },

    // Final submitted paths
    paths: { type: [pathDetailSchema], default: [] },

    // Aggregated user action counts
    userActions: {
      totalMoves:       { type: Number, default: 0 },
      pathsDrawn:       { type: Number, default: 0 },
      pathsCleared:     { type: Number, default: 0 },
      pathsUndone:      { type: Number, default: 0 },
      hintsUsed:        { type: Number, default: 0 },
      hintLevelsRevealed:{ type: Number, default: 0 },
      undoCount:        { type: Number, default: 0 },
      restartCount:     { type: Number, default: 0 }
    },

    // Play analytics
    analytics: {
      playStyle:        { type: String, enum: ['random', 'systematic', 'strategic'], default: null },
      problemSolving:   { type: String, default: null },
      hesitationPoints: { type: Number, default: 0 },
      errorDetection:   { type: String, enum: ['immediate', 'delayed', 'never'], default: null },
      engagementScore:  { type: Number, default: null },
      focusLevel:       { type: String, enum: ['low', 'medium', 'high'], default: null }
    },

    // Device info
    device: {
      type:       { type: String, enum: ['desktop', 'tablet', 'mobile'], default: 'desktop' },
      os:         { type: String, default: null },
      browser:    { type: String, default: null },
      screenSize: { type: String, default: null }
    }
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
gameSessionLinkSchema.index({ userAccountId: 1, createdAt: -1 });
gameSessionLinkSchema.index({ boardId: 1, 'result.status': 1 });
gameSessionLinkSchema.index({ userAccountId: 1, boardId: 1 });
gameSessionLinkSchema.index({ 'result.starRating': -1 });

export default mongoose.model('GameSessionLink', gameSessionLinkSchema);
