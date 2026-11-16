import express from 'express';
import {
  signup,
  login,
  getMe,
  updateProfilePhoto,
} from '../../controllers/user/authController.js';
import { registerContractor } from '../../controllers/user/contractorRegistrationController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { upload, uploadCertificate } from '../../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post(
  '/contractor/register',
  uploadCertificate.single('degreeCertificate'),
  registerContractor
);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile/photo', protect, upload.single('profilePhoto'), updateProfilePhoto);

export default router;
