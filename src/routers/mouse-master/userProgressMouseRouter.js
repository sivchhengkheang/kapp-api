import express from 'express';
import {
  getProgressByUser,
  getProgressByLevel,
  upsertProgress,
  unlockLevel
} from '../../controllers/mouse-master/userProgressMouseController.js';

const router = express.Router();

router.get('/user/:userId',                     getProgressByUser);
router.get('/user/:userId/level/:levelId',      getProgressByLevel);
router.patch('/user/:userId/level/:levelId',    upsertProgress);
router.post('/',                                unlockLevel);

export default router;
