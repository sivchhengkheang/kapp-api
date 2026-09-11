import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    levelId: {
      type: Number,
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    bestTimeMs: {
      type: Number,
      required: true
    },
    stars: {
      type: Number,
      default: 3
    },
    achievedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'link_leaderboards'
  }
);

leaderboardSchema.index({ levelId: 1, bestTimeMs: 1 });
leaderboardSchema.index({ userId: 1, levelId: 1 }, { unique: true });
leaderboardSchema.index({ bestTimeMs: 1 });

export default mongoose.model('LinkNumberLeaderboard', leaderboardSchema);
