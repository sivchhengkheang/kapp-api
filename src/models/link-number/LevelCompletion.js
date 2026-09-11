import mongoose from 'mongoose';

const levelCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true
    },
    levelId:       { type: Number, required: true },
    stars:         { type: Number, min: 1, max: 3, required: true },
    timeTakenMs:   { type: Number, required: true },
    movesCount:    { type: Number, default: 0 },
    mistakesCount: { type: Number, default: 0 },
    resetsCount:   { type: Number, default: 0 },
    completedAt:   { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'link_level_completions'
  }
);

levelCompletionSchema.index({ userId: 1, levelId: 1 }, { unique: true });
levelCompletionSchema.index({ levelId: 1, timeTakenMs: 1 });
levelCompletionSchema.index({ userId: 1, stars: -1 });

export default mongoose.model('LinkNumberLevelCompletion', levelCompletionSchema);
