import { Router } from 'express';
import {
  createAchievement,
  getAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
} from '../../controllers/shared/achievementController.js';

const router = Router();

// GET  /api/shared/achievements  - List all achievements (filter: category, rarity)
// POST /api/shared/achievements  - Create a new achievement definition
router.route('/').get(getAchievements).post(createAchievement);

// GET    /api/shared/achievements/:id  - Get single achievement
// PATCH  /api/shared/achievements/:id  - Update achievement
// DELETE /api/shared/achievements/:id  - Delete achievement
router
  .route('/:id')
  .get(getAchievementById)
  .patch(updateAchievement)
  .delete(deleteAchievement);

export default router;
