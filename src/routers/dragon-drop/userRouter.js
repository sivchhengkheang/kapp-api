import express from 'express';
import {
  getOverallProgress,
  getWorldProgress,
  getLevelProgress,
  getUserStatistics
} from '../../controllers/dragon-drop/userController.js';

const router = express.Router();

// GET /api/dragon-drop/users/progress
router.get('/progress', getOverallProgress);

// GET /api/dragon-drop/users/world-progress/:world
router.get('/world-progress/:world', getWorldProgress);

// GET /api/dragon-drop/users/level-progress/:level
router.get('/level-progress/:level', getLevelProgress);

// GET /api/dragon-drop/users/statistics
router.get('/statistics', getUserStatistics);

export default router;
