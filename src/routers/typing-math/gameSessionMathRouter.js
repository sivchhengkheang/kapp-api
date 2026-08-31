import { Router } from 'express';
import {
  createGameSession,
  getGameSessionById,
  getSessionsByUser,
  updateGameSession,
  deleteGameSession,
  getUserBestSession,
} from '../../controllers/typing-math/gameSessionMathController.js';

const router = Router();

// POST /api/typing-math/sessions  - Start/create a new math game session
router.post('/', createGameSession);

// GET /api/typing-math/sessions/user/:userId       - All sessions for a user
// GET /api/typing-math/sessions/user/:userId/best  - User's best math session by score
router.get('/user/:userId', getSessionsByUser);
router.get('/user/:userId/best', getUserBestSession);

// GET    /api/typing-math/sessions/:id  - Single session (with populated problems)
// PATCH  /api/typing-math/sessions/:id  - Update session (end game, set results)
// DELETE /api/typing-math/sessions/:id  - Delete session
router
  .route('/:id')
  .get(getGameSessionById)
  .patch(updateGameSession)
  .delete(deleteGameSession);

export default router;
