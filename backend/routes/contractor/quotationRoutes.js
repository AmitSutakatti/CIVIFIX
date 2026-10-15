import express from 'express';
import { protect, authorize, requireEligibleContractor } from '../../middleware/authMiddleware.js';
import { upload } from '../../middleware/uploadMiddleware.js';
import {
  createQuotation,
  getMyQuotations,
  getMyQuotationById,
} from '../../controllers/contractor/quotationController.js';

const router = express.Router();

// All routes require authentication and contractor role
router.use(protect);
router.use(authorize('contractor'));
router.use(requireEligibleContractor);

router.get('/', getMyQuotations);
router.post('/', upload.single('contractorSignature'), createQuotation);
router.get('/:quotationId', getMyQuotationById);

export default router;

