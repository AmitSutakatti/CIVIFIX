import Quotation from '../../models/Quotation.js';
import Complaint from '../../models/Complaint.js';
import User from '../../models/User.js';
import { generateQuotationPdf } from '../../services/quotationPdfService.js';
import { saveUpload } from '../../utils/imageStorage.js';

function safeJsonParse(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  try {
    return JSON.parse(trimmed);
  } catch {
    return fallback;
  }
}

// @desc    Create/submit a quotation for an assigned complaint
// @route   POST /api/quotation
// @access  Private (contractor)
export const createQuotation = async (req, res) => {
  try {
    const contractor = await User.findById(req.user.id);
    if (!contractor || contractor.role !== 'contractor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Contractor account required.',
      });
    }

    const {
      complaintId,
      workDescription,
      labor: laborRaw = [],
      material: materialRaw = [],
      other: otherRaw = [],
      taxRate = 0,
      pdfUrl = '',
      quotationNumber,
    } = req.body || {};

    const labor = safeJsonParse(laborRaw, []);
    const material = safeJsonParse(materialRaw, []);
    const other = safeJsonParse(otherRaw, []);

    if (!complaintId) {
      return res.status(400).json({ success: false, message: 'complaintId is required' });
    }
    if (!workDescription || !String(workDescription).trim()) {
      return res.status(400).json({ success: false, message: 'workDescription is required' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (!complaint.assignedContractor || complaint.assignedContractor.toString() !== contractor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized: complaint is not assigned to you' });
    }

    if (!complaint.assignedOfficer) {
      return res.status(400).json({ success: false, message: 'Complaint is missing an assigned officer' });
    }

    const assignedOfficer = await User.findById(complaint.assignedOfficer).populate('municipalOffice');
    if (!assignedOfficer?.municipalOffice?._id) {
      return res.status(400).json({ success: false, message: 'Municipal office not found for assigned officer' });
    }

    const quotation = await Quotation.create({
      quotationNumber,
      complaint: complaint._id,
      contractor: contractor._id,
      municipalOffice: assignedOfficer.municipalOffice._id,
      workDescription: String(workDescription).trim(),
      labor,
      material,
      other,
      taxRate,
      pdfUrl,
      contractorSignatureUrl: (await saveUpload(req.file, 'signatures'))?.url || '',
      status: 'submitted',
      submittedAt: new Date(),
    });

    // Generate PDF and persist its URL on the quotation
    const populated = await Quotation.findById(quotation._id)
      .populate('complaint', 'category description location priority deadline')
      .populate('contractor', 'name contractorInfo email phone')
      .populate('municipalOffice', 'name address phone email');

    const { pdfUrl: generatedPdfUrl } = await generateQuotationPdf({
      quotation: populated,
      complaint: populated.complaint,
      contractor: populated.contractor,
      municipalOffice: populated.municipalOffice,
    });

    populated.pdfUrl = generatedPdfUrl;
    await populated.save();

    res.status(201).json({
      success: true,
      data: { quotation: populated },
    });
  } catch (error) {
    // Duplicate quotation per (complaint, contractor)
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A quotation for this complaint has already been submitted by this contractor.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating quotation',
      error: error.message,
    });
  }
};

// @desc    Get quotations created by the logged-in contractor
// @route   GET /api/quotation
// @access  Private (contractor)
export const getMyQuotations = async (req, res) => {
  try {
    const contractor = await User.findById(req.user.id);
    if (!contractor || contractor.role !== 'contractor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Contractor account required.',
      });
    }

    const quotations = await Quotation.find({ contractor: contractor._id })
      .populate('complaint', 'category description status location createdAt')
      .populate('municipalOffice', 'name type address phone email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { quotations },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quotations',
      error: error.message,
    });
  }
};

// @desc    Get a quotation by id (contractor owner only)
// @route   GET /api/quotation/:quotationId
// @access  Private (contractor)
export const getMyQuotationById = async (req, res) => {
  try {
    const contractor = await User.findById(req.user.id);
    if (!contractor || contractor.role !== 'contractor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Contractor account required.',
      });
    }

    const quotation = await Quotation.findById(req.params.quotationId)
      .populate('complaint', 'category description status location createdAt')
      .populate('municipalOffice', 'name type address phone email');

    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    if (quotation.contractor.toString() !== contractor._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.status(200).json({
      success: true,
      data: { quotation },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching quotation',
      error: error.message,
    });
  }
};

