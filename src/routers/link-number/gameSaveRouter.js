import express from 'express';
import {
  getSave,
  saveGame,
  deleteSave
} from '../../controllers/link-number/gameSaveController.js';

const router = express.Router();

router.get('/',    getSave);
router.put('/',    saveGame);
router.delete('/', deleteSave);

export default router;
