import express from 'express';
import {
  getLeaderboard,
  recomputeLeaderboard
} from '../../controllers/mouse-master/leaderboardMouseController.js';

const router = express.Router();

router.get('/',           getLeaderboard);
router.post('/recompute', recomputeLeaderboard);

export default router;
