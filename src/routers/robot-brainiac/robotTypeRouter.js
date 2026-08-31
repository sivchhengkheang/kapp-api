import express from 'express';
import { getRobotTypes, getRobotTypeById } from '../../controllers/robot-brainiac/robotTypeController.js';

const router = express.Router();

router.get('/', getRobotTypes);
router.get('/:id', getRobotTypeById);

export default router;
