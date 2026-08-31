import { Router } from 'express';
import {
  createGameSession,
  getGameSessionById,
  getSessionsByUser,
  updateGameSession,
  deleteGameSession,
  getUserBestSession,
} from '../../controllers/typing-code/gameSessionCodeController.js';

const router = Router();

// POST /api/typing-code/sessions       - Start/create a new code game session
// (GET /api/typing-code/sessions is not listed — sessions are always user-scoped)
router.post('/', createGameSession);

// GET /api/typing-code/sessions/user/:userId       - All sessions for a user
// GET /api/typing-code/sessions/user/:userId/best  - User's best session by WPM
router.get('/user/:userId', getSessionsByUser);
router.get('/user/:userId/best', getUserBestSession);

// GET    /api/typing-code/sessions/:id  - Single session
// PATCH  /api/typing-code/sessions/:id  - Update session (end game)
// DELETE /api/typing-code/sessions/:id  - Delete session
router
  .route('/:id')
  .get(getGameSessionById)
  .patch(updateGameSession)
  .delete(deleteGameSession);

export default router;
