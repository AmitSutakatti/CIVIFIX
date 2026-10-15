import express from 'express';
import {
  getChatMessages,
  sendMessage,
  markMessagesRead,
  uploadMiddleware,
} from '../../controllers/contractor/chatController.js';
import { protect, requireEligibleContractor } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(requireEligibleContractor);

// Get chat messages - allow both contractor and MUNICIPAL_OFFICER
router.get('/:complaintId', (req, res, next) => {
  if (['contractor', 'MUNICIPAL_OFFICER'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Contractor or Municipal Officer account required.',
    });
  }
}, getChatMessages);

// Send message - allow both contractor and MUNICIPAL_OFFICER
router.post('/:complaintId', (req, res, next) => {
  if (['contractor', 'MUNICIPAL_OFFICER'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Contractor or Municipal Officer account required.',
    });
  }
}, uploadMiddleware, sendMessage);

// Mark messages as read - allow both contractor and MUNICIPAL_OFFICER
router.put('/:complaintId/read', (req, res, next) => {
  if (['contractor', 'MUNICIPAL_OFFICER'].includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Contractor or Municipal Officer account required.',
    });
  }
}, markMessagesRead);

export default router;

