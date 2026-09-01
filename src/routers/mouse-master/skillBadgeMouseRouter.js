import express from 'express';
import {
  getBadgesByUser,
  getBadgeByCategory,
  awardBadge
} from '../../controllers/mouse-master/skillBadgeMouseController.js';

const router = express.Router();

router.get('/user/:userId',                          getBadgesByUser);
router.get('/user/:userId/:categoryKey',             getBadgeByCategory);
router.post('/',                                     awardBadge);

export default router;
