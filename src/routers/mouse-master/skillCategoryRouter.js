import express from 'express';
import {
  getAllCategories,
  getCategoryByKey,
  createCategory
} from '../../controllers/mouse-master/skillCategoryController.js';

const router = express.Router();

router.get('/',             getAllCategories);
router.get('/:categoryKey', getCategoryByKey);
router.post('/',            createCategory);

export default router;
