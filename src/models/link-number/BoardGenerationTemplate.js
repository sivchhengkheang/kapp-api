import mongoose from 'mongoose';

const boardGenerationTemplateSchema = new mongoose.Schema(
  {
    templateId: { type: String, required: true },
    gridSize:   {
      type: String,
      required: true,
      enum: ['3x3', '4x4', '5x5', '6x6', '7x7', '8x8']
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard', 'expert']
    },

    // Generation parameters
    parameters: {
      gridWidth:       { type: Number, required: true },
      gridHeight:      { type: Number, required: true },
      numberPairs:     { type: Number, required: true }, // how many number pairs per board
      pairPositioning: {
        type: String,
        enum: ['random', 'edge_focus', 'distributed'],
        default: 'random'
      },
      pathComplexity:  {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      symmetry:        { type: Boolean, default: false },
      minPathLength:   { type: Number, default: null },
      maxPathLength:   { type: Number, default: null }
    },

    // Difficulty metrics for generated boards
    metrics: {
      branchingFactor:    {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      deductionRequired:  {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      backtrackingNeeded: { type: Boolean, default: false },
      numSolutions:       { type: Number, default: 1 } // 1 = unique solution
    },

    // Validation rules applied during generation
    validation: {
      mustHaveUniqueSolution:  { type: Boolean, default: true },
      minSpaceRequiredPerPath: { type: Number, default: null },
      maxIntersectionPoints:   { type: Number, default: 0 }
    },

    // Aggregate stats from boards generated using this template
    stats: {
      averageCompletionRate: { type: Number, default: 0 },
      averageTime:           { type: Number, default: 0 },
      averageStars:          { type: Number, default: 0 },
      totalGenerated:        { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
boardGenerationTemplateSchema.index({ templateId: 1 }, { unique: true });
boardGenerationTemplateSchema.index({ difficulty: 1 });
boardGenerationTemplateSchema.index({ gridSize: 1, difficulty: 1 });

export default mongoose.model('BoardGenerationTemplate', boardGenerationTemplateSchema);
