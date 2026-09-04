import express from 'express';
import {
  getUserBoardProgress,
  getBoardProgressByBoardId
} from '../../controllers/link-number/boardProgressController.js';

const router = express.Router();

router.get('/user/:userId',             getUserBoardProgress);
router.get('/user/:userId/:boardId',    getBoardProgressByBoardId);

export default router;
