import express from 'express';
import {
  getHeatmapByUser,
  updateHeatmap
} from '../../controllers/koompi-typing/keyboardHeatmapController.js';

const router = express.Router();

router.get('/user/:userId',  getHeatmapByUser);
router.put('/user/:userId',  updateHeatmap);

export default router;
