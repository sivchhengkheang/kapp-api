import mongoose from 'mongoose';

const orbTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, unique: true },
  element: String,
  rarity: { type: String, default: 'common' },
  
  sprite: {
    url: String,
    color: String,
    effect: String
  },
  
  matchesWith: [String],
  matchesWithAny: { type: Boolean, default: false },
  minMatch: { type: Number, default: 3 },
  matchScore: Number,
  
  effects: {
    matchEffect: String,
    specialEffect: String,
    cascadeBonus: Number,
    comboBonus: Number,
    clearRadius: Number
  },
  
  dropRate: Number,
  
  canBePartOfCombo: { type: Boolean, default: true },
  canCreateCascade: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('OrbTypeDragon', orbTypeSchema);
