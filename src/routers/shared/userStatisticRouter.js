import { Router } from 'express';
import {
  createUserStatistic,
  getUserStatistic,
  updateUserStatistic,
  incrementUserStatistic,
  deleteUserStatistic,
} from '../../controllers/shared/userStatisticController.js';

const router = Router();

// POST /api/shared/statistics - Create statistics doc for a user
router.post('/', createUserStatistic);

// GET    /api/shared/statistics/:userId   - Get user stats
// PATCH  /api/shared/statistics/:userId   - Set/update fields
// DELETE /api/shared/statistics/:userId   - Delete stats doc
router
  .route('/:userId')
  .get(getUserStatistic)
  .patch(updateUserStatistic)
  .delete(deleteUserStatistic);

// PATCH /api/shared/statistics/:userId/increment - Atomically increment numeric fields
router.patch('/:userId/increment', incrementUserStatistic);

export default router;
