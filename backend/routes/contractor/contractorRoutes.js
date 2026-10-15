import express from 'express';
import {
  getComplaints,
  getNotifications,
} from '../../controllers/contractor/contractorController.js';
import { protect, authorize, requireEligibleContractor } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and contractor role
router.use(protect);
router.use(authorize('contractor'));
router.use(requireEligibleContractor);

// Complaints
router.get('/complaints', getComplaints);

// Notifications
router.get('/notifications', getNotifications);

export default router;

