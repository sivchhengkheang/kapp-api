import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  { _id: false }
);

const pathSchema = new mongoose.Schema(
  {
    value:      { type: Number, required: true },
    color:      { type: String, required: true },
    isComplete: { type: Boolean, default: false },
    points:     { type: [pointSchema], default: [] }
  },
  { _id: false }
);

const gameSaveSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserAccount',
      required: true,
      unique: true
    },
    levelId:        { type: Number, required: true },
    paths:          { type: [pathSchema], default: [] },
    elapsedSeconds: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: 'link_game_saves'
  }
);

gameSaveSchema.index({ updatedAt: -1 });

export default mongoose.model('LinkNumberGameSave', gameSaveSchema);
