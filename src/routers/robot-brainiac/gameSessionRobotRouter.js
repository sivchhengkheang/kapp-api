import express from 'express';
import {
  createSession,
  getSessionsByUser,
  getBestSession,
  getSessionById,
  updateSession,
  deleteSession
} from '../../controllers/robot-brainiac/gameSessionRobotController.js';

const router = express.Router();

router.post('/', createSession);
router.get('/user/:userId', getSessionsByUser);
router.get('/user/:userId/best', getBestSession);
router.get('/:id', getSessionById);
router.patch('/:id', updateSession);
router.delete('/:id', deleteSession);

export default router;
