import express from 'express';
import { 
  getLevelByNumber, 
  startLevel, 
  submitLevel, 
  getLevelStats, 
  getBestRun, 
  getLevelAttempts 
} from '../../controllers/dragon-drop/levelController.js';

const router = express.Router();

router.get('/:levelNumber', getLevelByNumber);
router.post('/:levelNumber/start', startLevel);
router.post('/:levelNumber/submit', submitLevel);
router.get('/:levelNumber/stats', getLevelStats);
router.get('/:levelNumber/best-run', getBestRun);
router.get('/:levelNumber/attempts', getLevelAttempts);

export default router;
