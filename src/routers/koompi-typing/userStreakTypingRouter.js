import express from 'express';
import {
  getStreakByUser,
  useStreakFreeze,
  addStreakFreeze
} from '../../controllers/koompi-typing/userStreakTypingController.js';

const router = express.Router();

router.get('/user/:userId',         getStreakByUser);
router.post('/user/:userId/freeze', useStreakFreeze);
router.post('/user/:userId/add-freeze', addStreakFreeze);

export default router;
