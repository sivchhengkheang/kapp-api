import express from 'express';
import {
  getAllPuzzles,
  getPuzzlesByDifficulty,
  getPuzzleByBoardNumber,
  getPuzzleStats,
  createPuzzleBoard
} from '../../controllers/link-number/puzzleBoardController.js';

const router = express.Router();

router.get('/',                              getAllPuzzles);
router.get('/difficulty/:difficulty',        getPuzzlesByDifficulty);
router.get('/:boardNumber',                  getPuzzleByBoardNumber);
router.get('/:boardNumber/stats',            getPuzzleStats);
router.post('/',                             createPuzzleBoard);

export default router;
