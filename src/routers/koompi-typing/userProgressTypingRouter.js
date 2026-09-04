import express from 'express';
import {
  getProgressByUser,
  getProgressByLesson,
  updateProgress
} from '../../controllers/koompi-typing/userProgressTypingController.js';

const router = express.Router();

router.get('/user/:userId',                    getProgressByUser);
router.get('/user/:userId/lesson/:lessonId',   getProgressByLesson);
router.put('/user/:userId/lesson/:lessonId',   updateProgress);

export default router;
