import express from 'express';
import {
  getContentItems,
  getContentItemById,
  createContentItem,
  updateContentItem,
  deleteContentItem
} from '../../controllers/koompi-typing/lessonContentItemController.js';

const router = express.Router();

router.get('/',     getContentItems);
router.get('/:id',  getContentItemById);
router.post('/',    createContentItem);
router.put('/:id',  updateContentItem);
router.delete('/:id', deleteContentItem);

export default router;
