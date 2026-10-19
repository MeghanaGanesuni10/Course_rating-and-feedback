import express from 'express';
import {
  getAnalytics,
  getRecentFeedback,
  getAllFeedback,
  adminDeleteFeedback,
  getUsers,
  promoteUser,
  demoteUser,
  deleteUser,
} from '../controllers/admin.controller.js';
import { protect, requireAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect, requireAdmin);

router.get('/analytics', getAnalytics);
router.get('/recent-feedback', getRecentFeedback);
router.get('/all-feedback', getAllFeedback);
router.delete('/feedback/:id', adminDeleteFeedback);
router.get('/users', getUsers);
router.patch('/users/:id/promote', promoteUser);
router.patch('/users/:id/demote', demoteUser);
router.delete('/users/:id', deleteUser);

export default router;
