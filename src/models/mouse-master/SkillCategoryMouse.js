import mongoose from 'mongoose';

const skillCategoryMouseSchema = new mongoose.Schema({
  categoryKey: {
    type: String,
    required: true,
    unique: true,
    enum: ['click_basics', 'double_right_click', 'drag_drop', 'scroll_precision', 'mixed_challenge']
  },
  name: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true }, // unlock sequence
  levelRange: {
    start: { type: Number, required: true },
    end:   { type: Number, required: true }
  },
  icon: { type: String, default: 'target' },
  unlockRequirement: {
    type: {
      type: String,
      enum: ['none', 'previous_category_complete'],
      default: 'none'
    },
    previousCategoryKey: { type: String, default: null }
  }
}, { timestamps: true });

skillCategoryMouseSchema.index({ order: 1 });

export default mongoose.model('SkillCategoryMouse', skillCategoryMouseSchema);
