import express from 'express';
import {
  createAttempt,
  createAttemptsBulk,
  getAttemptsByUser,
  getAttemptsBySession,
  getAttemptsByLevel,
  getAttemptById,
  deleteAttempt
} from '../../controllers/robot-brainiac/levelAttemptController.js';

const router = express.Router();

router.post('/', createAttempt);
router.post('/bulk', createAttemptsBulk);
router.get('/user/:userId', getAttemptsByUser);
router.get('/session/:sessionId', getAttemptsBySession);
router.get('/level/:levelId', getAttemptsByLevel);
router.get('/:id', getAttemptById);
router.delete('/:id', deleteAttempt);

export default router;
