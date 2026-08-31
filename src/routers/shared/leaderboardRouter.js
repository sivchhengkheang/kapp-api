import { Router } from 'express';
import {
  upsertLeaderboardEntry,
  getLeaderboard,
  getLeaderboardByUser,
  getLeaderboardById,
  updateLeaderboardEntry,
  deleteLeaderboardEntry,
} from '../../controllers/shared/leaderboardController.js';

const router = Router();

// GET  /api/shared/leaderboard         - Query leaderboard (boardType, period, category, limit)
// POST /api/shared/leaderboard         - Create or upsert a leaderboard entry
router.route('/').get(getLeaderboard).post(upsertLeaderboardEntry);

// GET /api/shared/leaderboard/user/:userId - All entries for a specific user
router.get('/user/:userId', getLeaderboardByUser);

// GET   /api/shared/leaderboard/:id  - Single entry
// PATCH /api/shared/leaderboard/:id  - Update entry
// DELETE /api/shared/leaderboard/:id - Delete entry
router
  .route('/:id')
  .get(getLeaderboardById)
  .patch(updateLeaderboardEntry)
  .delete(deleteLeaderboardEntry);

export default router;
