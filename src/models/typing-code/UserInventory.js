import mongoose from 'mongoose';

const userInventorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  powerUps: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    quantity: Number,
    isEquipped: Boolean,
    lastUsedAt: Date,
    acquiredAt: Date,
    source: { type: String, enum: ['purchased', 'earned', 'achievement', 'drop'] }
  }],
  cosmetics: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    isEquipped: Boolean,
    acquiredAt: Date,
    source: String
  }],
  equipped: {
    theme: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    backgroundEffect: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' }
  },
  stats: {
    totalItemsOwned: Number,
    powerUpsTotalUsed: Number,
    lastInventoryUpdateAt: Date
  }
}, { timestamps: true });

userInventorySchema.index({ 'powerUps.itemId': 1 });
userInventorySchema.index({ 'cosmetics.isEquipped': 1 });

export default mongoose.model('UserInventory', userInventorySchema);
