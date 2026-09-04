import mongoose from 'mongoose';

const unlockRequirementSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['none', 'previous_unit_complete'],
    default: 'none'
  },
  previousUnitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypingUnit',
    default: null
  }
}, { _id: false });

const typingUnitSchema = new mongoose.Schema({
  unitNumber: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'km'],
    required: true,
    default: 'en'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  theme: {
    type: String,
    default: 'forest_path'
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  unlockRequirement: {
    type: unlockRequirementSchema,
    default: () => ({ type: 'none', previousUnitId: null })
  },
  lessonCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'typing_units'
});

typingUnitSchema.index({ language: 1, unitNumber: 1 }, { unique: true });
typingUnitSchema.index({ language: 1, order: 1 });

export default mongoose.model('TypingUnit', typingUnitSchema);
