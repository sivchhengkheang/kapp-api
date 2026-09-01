import express from 'express';
import {
  getCollectedMapPieces,
  getMapPiecesByWorld
} from '../../controllers/dragon-drop/mapPieceController.js';

const router = express.Router();

// GET /api/dragon-drop/map-pieces/collected
router.get('/collected', getCollectedMapPieces);

// GET /api/dragon-drop/map-pieces/world/:world
router.get('/world/:world', getMapPiecesByWorld);

export default router;
