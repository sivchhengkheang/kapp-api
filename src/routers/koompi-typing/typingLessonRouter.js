import express from 'express';
import {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
} from '../../controllers/koompi-typing/typingLessonController.js';

const router = express.Router();

router.get('/',     getAllLessons);
router.get('/:id',  getLessonById);
router.post('/',    createLesson);
router.put('/:id',  updateLesson);
router.delete('/:id', deleteLesson);

export default router;
