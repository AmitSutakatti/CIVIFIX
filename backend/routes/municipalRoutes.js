import express from 'express';
import {
  getDashboardStats,
  getComplaints,
  verifyComplaint,
  assignContractor,
  updateComplaintStatus,
  closeComplaint,
  getAnalytics,
  getContractors,
} from '../controllers/municipalController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and MUNICIPAL_OFFICER role
router.use(protect);
router.use(authorize('MUNICIPAL_OFFICER'));

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Complaints
router.get('/complaints', getComplaints);
router.put('/complaints/:id/verify', verifyComplaint);
router.put('/complaints/:id/assign', assignContractor);
router.put('/complaints/:id/status', updateComplaintStatus);
router.put('/complaints/:id/close', closeComplaint);

// Analytics
router.get('/analytics', getAnalytics);

// Contractors
router.get('/contractors', getContractors);

export default router;
