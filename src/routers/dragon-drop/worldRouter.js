import express from 'express';
import { getWorlds, getWorldByNumber, getWorldLevels } from '../../controllers/dragon-drop/worldController.js';

const router = express.Router();

router.get('/', getWorlds);
router.get('/:worldNumber', getWorldByNumber);
router.get('/:worldNumber/levels', getWorldLevels);

export default router;
