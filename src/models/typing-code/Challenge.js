import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: String,
  description: String,
  codeSnippet: String,
  language: String,
  category: String,
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
  length: {
    characters: Number,
    lines: Number,
    words: Number
  },
  estimatedTimeSeconds: Number,
  tags: [String],
  creator: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    createdAt: Date
  },
  status: {
    isPublished: Boolean,
    isFeatured: Boolean,
    featuredAt: Date,
    isArchived: Boolean
  },
  stats: {
    timesPlayed: Number,
    averageWpm: Number,
    averageAccuracy: Number,
    medianCompletionTimeSeconds: Number,
    successRate: Number,
    abandonedRate: Number,
    failedRate: Number
  },
  quality: {
    rating: Number,
    reviews: Number,
    difficulty: {
      baseDifficulty: Number,
      adjustedByData: Number
    }
  },
  moderation: {
    flaggedCount: Number,
    approvedAt: Date,
    approvedBy: mongoose.Schema.Types.ObjectId
  },
  seo: {
    slug: String,
    keywords: [String]
  }
}, { timestamps: true });

challengeSchema.index({ category: 1, difficulty: 1 });
challengeSchema.index({ 'status.isPublished': 1 });
challengeSchema.index({ 'status.isFeatured': 1 });
challengeSchema.index({ tags: 1 });
challengeSchema.index({ 'stats.timesPlayed': -1 });

export default mongoose.model('Challenge', challengeSchema);
