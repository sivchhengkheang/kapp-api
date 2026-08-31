import mongoose from 'mongoose';

const userFriendSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserAccount', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'pending' },
  requestedAt: Date,
  acceptedAt: Date,
  relationship: {
    nickname: String,
    favorited: { type: Boolean, default: false },
    lastPlayedTogether: Date
  }
}, { timestamps: true });

userFriendSchema.index({ userId: 1, friendId: 1 }, { unique: true });
userFriendSchema.index({ userId: 1, status: 1 });

export default mongoose.model('UserFriend', userFriendSchema);
