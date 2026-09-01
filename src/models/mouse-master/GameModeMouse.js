import mongoose from 'mongoose';

const gameModeMouseSchema = new mongoose.Schema({
  modeKey: {
    type: String,
    required: true,
    unique: true,
    enum: ['practice', 'timed', 'daily_challenge']
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  affectsLeaderboard: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('GameModeMouse', gameModeMouseSchema);
