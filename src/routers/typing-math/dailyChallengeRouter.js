import { Router } from 'express';
import {
  createDailyChallenge,
  getTodayChallenge,
  getDailyChallenges,
  getDailyChallengeById,
  updateDailyChallenge,
  addTopScore,
} from '../../controllers/typing-math/dailyChallengeController.js';

const router = Router();

// GET  /api/typing-math/daily-challenges  - List all daily challenges
// POST /api/typing-math/daily-challenges  - Create a new daily challenge
router.route('/').get(getDailyChallenges).post(createDailyChallenge);

// GET /api/typing-math/daily-challenges/today  - Get today's active challenge
router.get('/today', getTodayChallenge);

// PATCH /api/typing-math/daily-challenges/:id/top-scores  - Push a new top score entry
router.patch('/:id/top-scores', addTopScore);

// GET    /api/typing-math/daily-challenges/:id  - Single challenge (with populated problems)
// PATCH  /api/typing-math/daily-challenges/:id  - Update challenge
router
  .route('/:id')
  .get(getDailyChallengeById)
  .patch(updateDailyChallenge);

export default router;
