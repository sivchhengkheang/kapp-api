import express from 'express';
import {
  startSession,
  completeSession,
  getSessionsByUser,
  getBestSessionByUser,
  getSessionById,
  deleteSession
} from '../../controllers/mouse-master/gameSessionMouseController.js';

const router = express.Router();

router.post('/',                      startSession);
router.patch('/:id/complete',         completeSession);
router.get('/user/:userId',           getSessionsByUser);
router.get('/user/:userId/best',      getBestSessionByUser);
router.get('/:id',                    getSessionById);
router.delete('/:id',                 deleteSession);

export default router;
