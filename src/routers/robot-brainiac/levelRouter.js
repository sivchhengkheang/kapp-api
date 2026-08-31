import express from 'express';
import {
  getLevels,
  getNextLevel,
  createLevel,
  getLevelById,
  updateLevel,
  incrementLevelStats,
  deleteLevel
} from '../../controllers/robot-brainiac/levelController.js';

const router = express.Router();

router.get('/', getLevels);
router.get('/next', getNextLevel);
router.post('/', createLevel);
router.get('/:id', getLevelById);
router.patch('/:id', updateLevel);
router.post('/:id/stats', incrementLevelStats);
router.delete('/:id', deleteLevel);

export default router;
