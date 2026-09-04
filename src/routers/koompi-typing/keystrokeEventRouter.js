import express from 'express';
import {
  recordKeystrokes,
  getKeystrokesBySession
} from '../../controllers/koompi-typing/keystrokeEventController.js';

const router = express.Router();

router.post('/batch',               recordKeystrokes);
router.get('/session/:sessionId',  getKeystrokesBySession);

export default router;
