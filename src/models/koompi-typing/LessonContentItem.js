import mongoose from 'mongoose';

const lessonContentItemSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TypingLesson',
    required: true
  },
  itemType: {
    type: String,
    enum: ['character', 'word', 'sentence'],
    default: 'word'
  },
  language: {
    type: String,
    enum: ['en', 'km'],
    required: true,
    default: 'en'
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 1
  },
  audioUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'lesson_content_items'
});

lessonContentItemSchema.index({ lessonId: 1, order: 1 });

export default mongoose.model('LessonContentItem', lessonContentItemSchema);
