import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getComplaint,
} from '../../controllers/user/complaintController.js';
import { protect, requireActiveCitizen } from '../../middleware/authMiddleware.js';
import { upload } from '../../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', protect, requireActiveCitizen, upload.array('images', 5), createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/:id', protect, getComplaint);

export default router;
