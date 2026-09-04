import mongoose from 'mongoose';

const gameModeTypingSchema = new mongoose.Schema({
  modeKey: {
    type: String,
    required: true,
    unique: true,
    enum: ['lesson', 'free_practice', 'timed_test', 'daily_challenge']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  affectsLeaderboard: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'game_modes_typing'
});

export default mongoose.model('GameModeTyping', gameModeTypingSchema);
