import mongoose from 'mongoose';

const mapPieceSchema = new mongoose.Schema({
  mapPieceId: { type: String, required: true, unique: true },
  worldNumber: { type: Number, required: true },
  pieceNumber: { type: Number, required: true },
  title: String,
  
  location: {
    levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'LevelDragon' },
    levelNumber: Number,
    position: String,
    description: String
  },
  
  rarity: String,
  requiresCombo: Number,
  requiresPerfectRun: Boolean,
  
  sprite: {
    url: String,
    color: String,
    glow: Boolean
  },
  
  lore: String,
  
  countsTowardBoss: Boolean,
  bossPiecesNeeded: Number,
  
  stats: {
    totalCollected: { type: Number, default: 0 },
    collectionRate: { type: Number, default: 0 },
    averageLevelRequired: { type: Number, default: 0 }
  }
}, { timestamps: true });

mapPieceSchema.index({ worldNumber: 1, pieceNumber: 1 }, { unique: true });
mapPieceSchema.index({ 'location.levelId': 1 });

export default mongoose.model('MapPieceDragon', mapPieceSchema);
