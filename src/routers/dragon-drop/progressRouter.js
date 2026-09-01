import express from 'express';
import { 
  getOverallProgress, 
  getWorldProgress, 
  getLevelProgress, 
  getCollectedMapPieces,
  getMapPiecesByWorld
} from '../../controllers/dragon-drop/progressController.js';

const router = express.Router();

router.get('/', getOverallProgress);
router.get('/world/:world', getWorldProgress);
router.get('/level/:level', getLevelProgress);
router.get('/map-pieces', getCollectedMapPieces);
router.get('/map-pieces/world/:world', getMapPiecesByWorld);

export default router;
