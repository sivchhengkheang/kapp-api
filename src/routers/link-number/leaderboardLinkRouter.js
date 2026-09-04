import express from 'express';
import {
  getGlobalLeaderboard,
  getSpeedLeaderboard,
  getAccuracyLeaderboard,
  getByDifficultyLeaderboard
} from '../../controllers/link-number/leaderboardLinkController.js';

const router = express.Router();

router.get('/global',               getGlobalLeaderboard);
router.get('/speed',                getSpeedLeaderboard);
router.get('/accuracy',             getAccuracyLeaderboard);
router.get('/difficulty/:diff',     getByDifficultyLeaderboard);

export default router;
