import { Router } from 'express';
import {
  createProblemAttempt,
  bulkCreateProblemAttempts,
  getProblemAttemptById,
  getAttemptsByUser,
  getAttemptsBySession,
  deleteProblemAttempt,
} from '../../controllers/typing-math/problemAttemptController.js';

const router = Router();

// POST /api/typing-math/attempts       - Record a single problem attempt
router.post('/', createProblemAttempt);

// POST /api/typing-math/attempts/bulk  - Bulk create attempts (at session end)
router.post('/bulk', bulkCreateProblemAttempts);

// GET /api/typing-math/attempts/user/:userId       - All attempts for a user
router.get('/user/:userId', getAttemptsByUser);

// GET /api/typing-math/attempts/session/:sessionId - All attempts in a session
router.get('/session/:sessionId', getAttemptsBySession);

// GET    /api/typing-math/attempts/:id  - Single attempt
// DELETE /api/typing-math/attempts/:id  - Delete attempt
router
  .route('/:id')
  .get(getProblemAttemptById)
  .delete(deleteProblemAttempt);

export default router;
