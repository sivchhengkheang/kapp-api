import { Router } from 'express';
import {
  createMathProblem,
  getMathProblems,
  getMathProblemById,
  updateMathProblem,
  deleteMathProblem,
  incrementProblemStats,
} from '../../controllers/typing-math/mathProblemController.js';

const router = Router();

// GET  /api/typing-math/problems  - List problems (filter: operation, difficulty, category, isActive)
// POST /api/typing-math/problems  - Create a new math problem
router.route('/').get(getMathProblems).post(createMathProblem);

// PATCH /api/typing-math/problems/:id/stats  - Increment attempt stats
router.patch('/:id/stats', incrementProblemStats);

// GET    /api/typing-math/problems/:id  - Single problem
// PATCH  /api/typing-math/problems/:id  - Update problem
// DELETE /api/typing-math/problems/:id  - Delete problem
router
  .route('/:id')
  .get(getMathProblemById)
  .patch(updateMathProblem)
  .delete(deleteMathProblem);

export default router;
