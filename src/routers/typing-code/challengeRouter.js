import { Router } from 'express';
import {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  incrementChallengeStats,
} from '../../controllers/typing-code/challengeController.js';

const router = Router();

// GET  /api/typing-code/challenges  - List challenges (filter: language, difficulty, category, isPublished, isFeatured)
// POST /api/typing-code/challenges  - Create a new code challenge
router.route('/').get(getChallenges).post(createChallenge);

// PATCH /api/typing-code/challenges/:id/stats  - Increment play stats after a session
router.patch('/:id/stats', incrementChallengeStats);

// GET    /api/typing-code/challenges/:id  - Single challenge
// PATCH  /api/typing-code/challenges/:id  - Update challenge
// DELETE /api/typing-code/challenges/:id  - Delete challenge
router
  .route('/:id')
  .get(getChallengeById)
  .patch(updateChallenge)
  .delete(deleteChallenge);

export default router;
