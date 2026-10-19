import express from 'express';
import {
  createFeedback,
  getCourseFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback,
} from '../controllers/feedback.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, createFeedback);
router.get('/mine', protect, getMyFeedback);
router.get('/course/:courseId', getCourseFeedback);
router.patch('/:id', protect, updateFeedback);
router.delete('/:id', protect, deleteFeedback);

export default router;
