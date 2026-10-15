import express from 'express';
import {
  getMunicipalQuotations,
  getQuotationById,
  approveQuotation,
  rejectQuotation,
} from '../../controllers/municipal/quotationController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and MUNICIPAL_OFFICER role
router.use(protect);
router.use(authorize('MUNICIPAL_OFFICER'));

// Quotation routes
router.get('/', getMunicipalQuotations);
router.get('/:quotationId', getQuotationById);
router.post('/:quotationId/approve', approveQuotation);
router.post('/:quotationId/reject', rejectQuotation);

export default router;















