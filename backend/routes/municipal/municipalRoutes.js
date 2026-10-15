import express from 'express';
import {
  getDashboardStats,
  getComplaints,
  getMunicipalComplaint,
  verifyComplaint,
  assignContractor,
  updateComplaintStatus,
  closeComplaint,
  getAnalytics,
  getContractors,
  getContractorApplications,
  verifyContractorApplication,
  scheduleContractorAppointment,
  markComplaintDuplicate,
  startFieldVerification,
  submitFieldVerification,
  markComplaintFake,
} from '../../controllers/municipal/municipalController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';
import { upload } from '../../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication and MUNICIPAL_OFFICER role
router.use(protect);
router.use(authorize('MUNICIPAL_OFFICER'));

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// Complaints
router.get('/complaints', getComplaints);
router.get('/complaints/:id', getMunicipalComplaint);
router.put('/complaints/:id/verify', verifyComplaint);
router.put('/complaints/:id/duplicate', markComplaintDuplicate);
router.put('/complaints/:id/field-verification', startFieldVerification);
router.put(
  '/complaints/:id/field-verification/submit',
  upload.single('photo'),
  submitFieldVerification
);
router.put('/complaints/:id/fake', markComplaintFake);
router.put('/complaints/:id/assign', assignContractor);
router.put('/complaints/:id/status', updateComplaintStatus);
router.put('/complaints/:id/close', closeComplaint);

// Analytics
router.get('/analytics', getAnalytics);

// Contractors
router.get('/contractors', getContractors);

// Contractor onboarding (certificate + verification + appointment)
router.get('/contractor-applications', getContractorApplications);
router.put('/contractor-applications/:userId/verify', verifyContractorApplication);
router.put(
  '/contractor-applications/:userId/appointment',
  scheduleContractorAppointment
);

export default router;
