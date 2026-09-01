import express from 'express';
import {
  getAllLevels,
  getLevelById,
  getLevelsByCategory,
  createLevel,
  updateLevel,
  deleteLevel
} from '../../controllers/mouse-master/mouseLevelController.js';

const router = express.Router();

router.get('/',                        getAllLevels);
router.get('/category/:categoryKey',   getLevelsByCategory);
router.get('/:id',                     getLevelById);
router.post('/',                       createLevel);
router.patch('/:id',                   updateLevel);
router.delete('/:id',                  deleteLevel);

export default router;
