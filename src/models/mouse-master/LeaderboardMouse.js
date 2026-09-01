import mongoose from 'mongoose';

const rankingSchema = new mongoose.Schema({
  userAccountId:    { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  displayName:      { type: String, required: true },
  score:            { type: Number, required: true }, // accuracyPct * (1000 / avgReactionTimeMs)
  avgReactionTimeMs:{ type: Number },
  accuracyPct:      { type: Number },
  rank:             { type: Number, required: true }
}, { _id: false });

const leaderboardMouseSchema = new mongoose.Schema({
  boardType: {
    type: String,
    required: true,
    enum: ['global', 'by_category', 'weekly', 'friends', 'reflex']
  },
  categoryKey: { type: String, default: null }, // set when boardType = 'by_category'
  periodStart: { type: Date, default: null },   // set for weekly boards
  periodEnd:   { type: Date, default: null },
  rankings:    [rankingSchema],
  computedAt:  { type: Date, default: Date.now }
}, { timestamps: true });

leaderboardMouseSchema.index({ boardType: 1, categoryKey: 1, periodStart: -1 });

export default mongoose.model('LeaderboardMouse', leaderboardMouseSchema);
