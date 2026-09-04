import express from 'express';
import {
  getDifficultyProgression,
  initializeDifficultyProgression
} from '../../controllers/link-number/difficultyProgressionController.js';

const router = express.Router();

router.get('/user/:userId',             getDifficultyProgression);
router.post('/user/:userId/initialize', initializeDifficultyProgression);

export default router;
