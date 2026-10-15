import express from 'express';
import { generateLetter } from '../../controllers/user/letterController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', protect, generateLetter);

export default router;
