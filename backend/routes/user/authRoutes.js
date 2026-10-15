import express from 'express';
import { signup, login, getMe } from '../../controllers/user/authController.js';
import { registerContractor } from '../../controllers/user/contractorRegistrationController.js';
import { protect } from '../../middleware/authMiddleware.js';
import { uploadCertificate } from '../../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post(
  '/contractor/register',
  uploadCertificate.single('degreeCertificate'),
  registerContractor
);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
