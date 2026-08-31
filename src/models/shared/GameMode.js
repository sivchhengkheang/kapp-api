import mongoose from 'mongoose';

const gameModeSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  modeType: String,
  rules: {
    lives: Number, // null if no limit
    timeLimit: Number,
    durationSeconds: Number,
    scoringMultiplier: Number,
    difficultyScaling: Boolean,
    mechanics: {
      loseLifeOn: String,
      endCondition: String,
      difficulty: {
        startingLevel: String,
        increaseFrequency: Number,
        increaseAmount: Number
      }
    },
    scoring: {
      basePointsPerWord: Number,
      accuracyBonus: Number,
      speedBonus: Number,
      streakBonus: Number
    }
  },
  display: {
    icon: String,
    color: String,
    order: Number,
    description: String
  },
  stats: {
    timesPlayed: Number,
    averageScore: Number,
    averageWpm: Number,
    popularityRank: Number
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('GameMode', gameModeSchema);
