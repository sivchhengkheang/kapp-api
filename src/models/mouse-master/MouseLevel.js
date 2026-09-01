import mongoose from 'mongoose';

const dragZoneSchema = new mongoose.Schema({
  fromRect: {
    x: Number, y: Number, width: Number, height: Number
  },
  toRect: {
    x: Number, y: Number, width: Number, height: Number
  }
}, { _id: false });

const mouseLevelSchema = new mongoose.Schema({
  levelNumber: { type: Number, required: true },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillCategoryMouse',
    required: true
  },
  challengeType: {
    type: String,
    required: true,
    enum: ['click', 'double_click', 'right_click', 'drag', 'scroll', 'trace']
  },
  difficulty: { type: Number, required: true, min: 1, max: 5 }, // 1-5 scale within category
  config: {
    targetCount:       { type: Number, default: 10 },
    targetSizePx:      { type: Number, default: 40 },
    targetSpeed:       { type: Number, default: 0 },     // 0 = static, >0 px/sec
    movementPattern:   {
      type: String,
      enum: ['static', 'linear', 'random', 'circular'],
      default: 'static'
    },
    dragZone:          { type: dragZoneSchema, default: null },
    scrollDistancePx:  { type: Number, default: null },
    tracePath:         { type: String, default: null },  // SVG path string
    timeLimitMs:       { type: Number, default: 15000 }
  },
  passThreshold: {
    minAccuracyPct:    { type: Number, default: 80 },
    maxAvgReactionMs:  { type: Number, default: 800 }
  },
  xpReward: { type: Number, default: 50 }
}, { timestamps: true });

// Unique level per category
mouseLevelSchema.index({ categoryId: 1, levelNumber: 1 }, { unique: true });

export default mongoose.model('MouseLevel', mouseLevelSchema);
