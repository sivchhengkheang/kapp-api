import express from 'express';
import {
  startSession,
  completeSession,
  getSessionsByUser,
  getSessionById,
  deleteSession
} from '../../controllers/koompi-typing/gameSessionTypingController.js';

const router = express.Router();

router.post('/',               startSession);
router.patch('/:id/complete',  completeSession);
router.get('/user/:userId',    getSessionsByUser);
router.get('/:id',             getSessionById);
router.delete('/:id',          deleteSession);

export default router;
