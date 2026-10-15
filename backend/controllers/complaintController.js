import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import { saveUploads } from '../utils/imageStorage.js';

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
export const createComplaint = async (req, res) => {
  try {
    const { category, description, latitude, longitude, address } = req.body;

    // Validation
    if (!category || !description || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, description, and location',
      });
    }

    const storedImages = await saveUploads(req.files || [], 'complaints');
    const images = storedImages.map((file) => ({
      url: file.url,
      publicId: file.publicId,
    }));

    // Create complaint
    const complaint = await Complaint.create({
      user: req.user.id,
      category,
      description,
      images,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address || '',
      },
      status: 'Submitted',
    });

    // Create notification
    await Notification.create({
      user: req.user.id,
      complaint: complaint._id,
      title: 'Complaint Submitted',
      message: `Your ${category} complaint has been submitted successfully.`,
      type: 'status_update',
    });

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: { complaint },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message,
    });
  }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/my
// @access  Private
export const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('assignedOfficer', 'name email')
      .populate('assignedContractor', 'name email');

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: { complaints },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message,
    });
  }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('assignedOfficer', 'name email phone')
      .populate('assignedContractor', 'name email phone');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check if user owns the complaint or is an officer/contractor
    if (
      complaint.user._id.toString() !== req.user.id &&
      req.user.role !== 'officer' &&
      req.user.role !== 'contractor'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this complaint',
      });
    }

    res.status(200).json({
      success: true,
      data: { complaint },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message,
    });
  }
};

