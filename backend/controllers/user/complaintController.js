import Complaint from '../../models/Complaint.js';
import Notification from '../../models/Notification.js';
import { getCategoryPriority } from '../../utils/categoryPriority.js';
import {
  computeReviewSignals,
  persistReviewFlagsOnNearby,
} from '../../utils/complaintReview.js';
import { saveUploads } from '../../utils/imageStorage.js';
import {
  COMPLAINT_CATEGORY_VALUES,
  getComplaintCategoryLabel,
} from '../../constants/complaintCategories.js';
import { sendComplaintSubmissionEmail } from '../../services/emailService.js';

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private
export const createComplaint = async (req, res) => {
  try {
    const {
      category,
      title,
      description,
      additionalInfo,
      latitude,
      longitude,
      address,
    } = req.body || {};
    const hasCoordinate = (value) =>
      value !== undefined && value !== null && String(value).trim() !== '';
    const hasLatitude = hasCoordinate(latitude);
    const hasLongitude = hasCoordinate(longitude);
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    const normalizedTitle = typeof title === 'string' ? title.trim() : '';
    const normalizedDescription =
      typeof description === 'string' ? description.trim() : '';
    const normalizedAdditionalInfo =
      typeof additionalInfo === 'string' ? additionalInfo.trim() : '';

    if (!COMPLAINT_CATEGORY_VALUES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a supported complaint category',
      });
    }

    if (
      !normalizedDescription ||
      !hasLatitude ||
      !hasLongitude ||
      !Number.isFinite(parsedLatitude) ||
      !Number.isFinite(parsedLongitude) ||
      parsedLatitude < -90 ||
      parsedLatitude > 90 ||
      parsedLongitude < -180 ||
      parsedLongitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description and valid latitude and longitude',
      });
    }

    if (normalizedTitle.length > 100 || normalizedAdditionalInfo.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Title must be 100 characters or fewer and additional information 300 characters or fewer',
      });
    }

    const storedImages = await saveUploads(req.files || [], 'complaints');
    const images = storedImages.map((file) => ({
      url: file.url,
      publicId: file.publicId,
    }));

    const review = await computeReviewSignals({
      userId: req.user.id,
      category,
      latitude,
      longitude,
      includeCurrentInVolume: true,
    });

    // Create complaint with priority based on category
    const complaint = await Complaint.create({
      user: req.user.id,
      category,
      title: normalizedTitle || undefined,
      description: normalizedDescription,
      additionalInfo: normalizedAdditionalInfo || undefined,
      images,
      location: {
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        address: address || '',
      },
      status: 'Submitted',
      priority: getCategoryPriority(category), // Set priority based on category
      requiresReview: review.requiresReview,
      reviewFlags: review.flags,
    });

    if (review.nearbySummaries.length) {
      await persistReviewFlagsOnNearby(review.nearbySummaries);
    }

    // Create notification
    await Notification.create({
      user: req.user.id,
      complaint: complaint._id,
      title: 'Complaint Submitted',
      message: `Your ${getComplaintCategoryLabel(category)} complaint has been submitted successfully.`,
      type: 'status_update',
    });

    let emailConfirmationSent = false;
    const registeredEmail =
      typeof req.user.email === 'string' ? req.user.email.trim() : '';
    if (registeredEmail) {
      try {
        const emailResult = await sendComplaintSubmissionEmail(registeredEmail, complaint);
        emailConfirmationSent = emailResult?.success === true;
        if (!emailConfirmationSent) {
          console.warn(`[Complaint] Confirmation email delivery failed for complaint ${complaint._id}`);
        }
      } catch {
        console.warn(`[Complaint] Confirmation email delivery failed for complaint ${complaint._id}`);
      }
    } else {
      console.warn(`[Complaint] Confirmation email skipped for complaint ${complaint._id}: no registered email`);
    }

    const reviewNotice = review.requiresReview
      ? 'Your report was submitted. Similar nearby complaints or recent volume were flagged for municipal review — this does not mean the report is fake.'
      : null;

    res.status(201).json({
      success: true,
      message: reviewNotice || 'Complaint created successfully',
      data: {
        complaint,
        requiresReview: review.requiresReview,
        reviewFlags: review.flags,
        reviewNotice,
        emailConfirmationSent,
      },
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
