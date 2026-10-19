import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getDepartments,
} from '../controllers/course.controller.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/departments', getDepartments);
router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/', protect, requireAdmin, createCourse);
router.patch('/:id', protect, requireAdmin, updateCourse);
router.delete('/:id', protect, requireAdmin, deleteCourse);

export default router;
