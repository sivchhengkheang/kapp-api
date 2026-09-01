import express from 'express';
import {
  createAttemptsBulk,
  createAttempt,
  getAttemptsBySession,
  getAttemptById,
  deleteAttempt
} from '../../controllers/mouse-master/challengeAttemptMouseController.js';

const router = express.Router();

router.post('/bulk',                 createAttemptsBulk);
router.post('/',                     createAttempt);
router.get('/session/:sessionId',    getAttemptsBySession);
router.get('/:id',                   getAttemptById);
router.delete('/:id',                deleteAttempt);

export default router;
