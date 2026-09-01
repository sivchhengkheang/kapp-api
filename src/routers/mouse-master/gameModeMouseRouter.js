import express from 'express';
import {
  getAllModes,
  getModeByKey,
  createMode
} from '../../controllers/mouse-master/gameModeMouseController.js';

const router = express.Router();

router.get('/',         getAllModes);
router.get('/:modeKey', getModeByKey);
router.post('/',        createMode);

export default router;
