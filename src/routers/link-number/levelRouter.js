import express from 'express';
import {
  getAllLevels,
  getLevelById,
  completeLevel
} from '../../controllers/link-number/levelController.js';

const router = express.Router();

router.get('/',               getAllLevels);
router.get('/:id',            getLevelById);
router.post('/:id/complete',  completeLevel);

export default router;
