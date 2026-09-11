import express from 'express';
import {
  getUserProgress,
  updateUserProgress
} from '../../controllers/link-number/userProgressController.js';

const router = express.Router();

router.get('/',             getUserProgress);
router.put('/',             updateUserProgress);
router.get('/user/:userId', getUserProgress);

export default router;
