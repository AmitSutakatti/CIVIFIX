import Quotation from '../../models/Quotation.js';
import Complaint from '../../models/Complaint.js';
import User from '../../models/User.js';

// Get quotations for municipal office
export const getMunicipalQuotations = async (req, res) => {
  try {
    const officer = await User.findById(req.user._id).populate('municipalOffice');
    if (!officer || !officer.municipalOffice) {
      return res.status(404).json({ message: 'Municipal office not found' });
    }

    const quotations = await Quotation.find({ 
      municipalOffice: officer.municipalOffice._id,
      status: { $in: ['submitted', 'approved', 'rejected'] }
    })
      .populate('contractor', 'name email contractorInfo')
      .populate('complaint', 'description category status')
      .populate('reviewedBy', 'name')
      .sort({ submittedAt: -1 });

    res.json(quotations);
  } catch (error) {
    console.error('Error fetching quotations:', error);
    res.status(500).json({ message: 'Error fetching quotations', error: error.message });
  }
};

// Get quotation by ID
export const getQuotationById = async (req, res) => {
  try {
    const officer = await User.findById(req.user._id).populate('municipalOffice');
    if (!officer || !officer.municipalOffice) {
      return res.status(404).json({ message: 'Municipal office not found' });
    }

    const quotation = await Quotation.findById(req.params.quotationId)
      .populate('contractor', 'name email contractorInfo phone')
      .populate('complaint', 'description category status')
      .populate('municipalOffice', 'name address phone email')
      .populate('reviewedBy', 'name');

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.municipalOffice._id.toString() !== officer.municipalOffice._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(quotation);
  } catch (error) {
    console.error('Error fetching quotation:', error);
    res.status(500).json({ message: 'Error fetching quotation', error: error.message });
  }
};

// Approve quotation
export const approveQuotation = async (req, res) => {
  try {
    const officer = await User.findById(req.user._id).populate('municipalOffice');
    if (!officer || !officer.municipalOffice) {
      return res.status(404).json({ message: 'Municipal office not found' });
    }

    const quotation = await Quotation.findById(req.params.quotationId);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.municipalOffice.toString() !== officer.municipalOffice._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (quotation.status !== 'submitted') {
      return res.status(400).json({ message: 'Quotation is not in submitted status' });
    }

    quotation.status = 'approved';
    quotation.reviewedBy = officer._id;
    quotation.reviewedAt = new Date();
    await quotation.save();

    res.json({
      message: 'Quotation approved successfully',
      quotation,
    });
  } catch (error) {
    console.error('Error approving quotation:', error);
    res.status(500).json({ message: 'Error approving quotation', error: error.message });
  }
};

// Reject quotation
export const rejectQuotation = async (req, res) => {
  try {
    const { reason } = req.body;
    const officer = await User.findById(req.user._id).populate('municipalOffice');
    if (!officer || !officer.municipalOffice) {
      return res.status(404).json({ message: 'Municipal office not found' });
    }

    const quotation = await Quotation.findById(req.params.quotationId);

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    if (quotation.municipalOffice.toString() !== officer.municipalOffice._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (quotation.status !== 'submitted') {
      return res.status(400).json({ message: 'Quotation is not in submitted status' });
    }

    quotation.status = 'rejected';
    quotation.reviewedBy = officer._id;
    quotation.reviewedAt = new Date();
    quotation.rejectionReason = reason || '';
    await quotation.save();

    res.json({
      message: 'Quotation rejected successfully',
      quotation,
    });
  } catch (error) {
    console.error('Error rejecting quotation:', error);
    res.status(500).json({ message: 'Error rejecting quotation', error: error.message });
  }
};















