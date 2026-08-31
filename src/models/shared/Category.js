import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  icon: {
    url: String,
    color: String
  },
  stats: {
    totalChallenges: Number,
    totalTimesPlayed: Number,
    averagePlayersPerDay: Number,
    averageDifficulty: Number
  },
  subcategories: [{
    name: String,
    slug: String,
    challengeCount: Number
  }],
  difficultyDistribution: {
    beginner: Number,
    intermediate: Number,
    advanced: Number,
    expert: Number
  },
  topPlayers: [{
    rank: Number,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    score: Number,
    wpm: Number
  }],
  displayOrder: Number,
  isActive: Boolean
}, { timestamps: true });

categorySchema.index({ displayOrder: 1 });

export default mongoose.model('Category', categorySchema);
