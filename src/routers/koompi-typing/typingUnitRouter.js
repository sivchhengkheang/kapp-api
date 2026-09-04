import express from 'express';
import {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit
} from '../../controllers/koompi-typing/typingUnitController.js';

const router = express.Router();

router.get('/',     getAllUnits);
router.get('/:id',  getUnitById);
router.post('/',    createUnit);
router.put('/:id',  updateUnit);
router.delete('/:id', deleteUnit);

export default router;
