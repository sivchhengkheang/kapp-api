import express from 'express';
import { 
  getGlobalLeaderboard,
  getStarsLeaderboard,
  getWorldLeaderboard,
  getLevelLeaderboard
} from '../../controllers/dragon-drop/leaderboardController.js';

const router = express.Router();

router.get('/global', getGlobalLeaderboard);
router.get('/stars', getStarsLeaderboard);
router.get('/world/:world', getWorldLeaderboard);
router.get('/level/:level', getLevelLeaderboard);

export default router;
