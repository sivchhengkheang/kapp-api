import mongoose from 'mongoose';

const passThresholdSchema = new mongoose.Schema({
  minAccuracyPct: {
    type: Number,
    default: 90,
    min: 0,
    max: 100
  },
  minWpm: {
    type: Number,
    default: 10,
    min: 0
  }
}, { _id: false });

const typingLessonSchema = new mongoose.Schema({
  unitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypingUnit',
    required: true
  },
  lessonNumber: {
    type: Number,
    required: true
  },
  language: {
    type: String,
    enum: ['en', 'km'],
    required: true,
    default: 'en'
  },
  lessonType: {
    type: String,
    enum: ['letters', 'words', 'sentences', 'punctuation', 'numbers'],
    default: 'letters'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  targetKeys: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  contentItemCount: {
    type: Number,
    default: 0
  },
  passThreshold: {
    type: passThresholdSchema,
    default: () => ({ minAccuracyPct: 90, minWpm: 10 })
  },
  xpReward: {
    type: Number,
    default: 30
  },
  order: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  collection: 'typing_lessons'
});

typingLessonSchema.index({ unitId: 1, lessonNumber: 1 }, { unique: true });
typingLessonSchema.index({ unitId: 1, order: 1 });
typingLessonSchema.index({ language: 1, difficulty: 1 });

export default mongoose.model('TypingLesson', typingLessonSchema);
