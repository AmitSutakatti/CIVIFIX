import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} from '../../controllers/user/notificationController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/user', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

export default router;
