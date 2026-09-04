import express from 'express';
import {
  getTodaysChallenge,
  getDailyChallengeHistory,
  getDailyLeaderboard,
  createDailyChallenge
} from '../../controllers/link-number/dailyChallengeController.js';

const router = express.Router();

router.get('/today',        getTodaysChallenge);
router.get('/history',      getDailyChallengeHistory);
router.get('/leaderboard',  getDailyLeaderboard);
router.post('/',            createDailyChallenge);

export default router;
