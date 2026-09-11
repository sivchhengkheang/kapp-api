import express from 'express';
import {
  getLevelLeaderboard,
  getGlobalLeaderboard as getNewGlobalLeaderboard
} from '../../controllers/link-number/leaderboardController.js';
import {
  getGlobalLeaderboard,
  getSpeedLeaderboard,
  getAccuracyLeaderboard,
  getByDifficultyLeaderboard
} from '../../controllers/link-number/leaderboardLinkController.js';

const router = express.Router();

router.get('/global',               getNewGlobalLeaderboard);
router.get('/stars',                getNewGlobalLeaderboard);
router.get('/speed',                getSpeedLeaderboard);
router.get('/accuracy',             getAccuracyLeaderboard);
router.get('/difficulty/:diff',     getByDifficultyLeaderboard);
router.get('/legacy-global',        getGlobalLeaderboard);
router.get('/:levelId',             getLevelLeaderboard);
router.get('/',                     getNewGlobalLeaderboard);

export default router;
