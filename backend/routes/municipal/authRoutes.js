import express from 'express';
import { login, getMe } from '../../controllers/user/authController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Municipal officer login (uses same auth controller but checks for MUNICIPAL_OFFICER role)
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
