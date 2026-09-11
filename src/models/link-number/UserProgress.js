import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true,
      unique: true
    },
    username:             { type: String, default: 'Player' },
    currentLevelIndex:    { type: Number, default: 0 },
    highestUnlockedIndex: { type: Number, default: 0 },
    completedLevelIds:    { type: [Number], default: [] },
    levelStars:           { type: Map, of: Number, default: {} },
    totalStars:           { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: 'link_user_progress'
  }
);

userProgressSchema.index({ totalStars: -1 });

export default mongoose.model('LinkNumberUserProgress', userProgressSchema);
