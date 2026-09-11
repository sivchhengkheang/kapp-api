import mongoose from 'mongoose';

const pointSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  { _id: false }
);

const pairSchema = new mongoose.Schema(
  {
    value: { type: Number, required: true },
    color: { type: String, required: true },
    start: { type: pointSchema, required: true },
    end:   { type: pointSchema, required: true }
  },
  { _id: false }
);

const levelSchema = new mongoose.Schema(
  {
    id:         { type: Number, required: true, unique: true },
    category:   { type: String, required: true, trim: true },
    size:       { type: Number, required: true },
    difficulty: { type: String, default: 'Easy' },
    pairs:      { type: [pairSchema], required: true },
    isActive:   { type: Boolean, default: true },
    order:      { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: 'link_levels'
  }
);

levelSchema.index({ category: 1, order: 1 });
levelSchema.index({ difficulty: 1 });

export default mongoose.model('LinkNumberLevel', levelSchema);
