import Complaint from '../../models/Complaint.js';
import MunicipalOffice from '../../models/MunicipalOffice.js';
import User from '../../models/User.js';
import Contractor from '../../models/Contractor.js';
import Notification from '../../models/Notification.js';
import {
  sendComplaintVerificationEmail,
  sendFakeComplaintEmail,
  sendContractorAssignmentEmail,
  sendContractorPortalReadyEmail,
} from '../../services/emailService.js';
import { getCategoryPriority, getResolutionTime } from '../../utils/categoryPriority.js';
import { saveUpload } from '../../utils/imageStorage.js';
import {
  applyFakePenalty,
  awardVerifiedComplaintReward,
  computeReviewSignals,
  getReporterStats,
  haversineKm,
  REVIEW_CONFIG,
} from '../../utils/complaintReview.js';

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Helper function to get coordinates from municipal office (handles missing location.coordinates)
async function getOfficeCoordinates(municipalOffice) {
  // Check if location.coordinates exists
  if (municipalOffice.location && municipalOffice.location.coordinates && 
      Array.isArray(municipalOffice.location.coordinates) && 
      municipalOffice.location.coordinates.length === 2) {
    return municipalOffice.location.coordinates;
  }
  
  // Fallback to latitude/longitude if location.coordinates is missing
  if (municipalOffice.latitude && municipalOffice.longitude) {
    const coordinates = [municipalOffice.longitude, municipalOffice.latitude]; // [lng, lat] for GeoJSON
    
    // Update the document to set location.coordinates for future use
    if (!municipalOffice.location || !municipalOffice.location.coordinates) {
      municipalOffice.location = {
        type: 'Point',
        coordinates: coordinates,
      };
      await municipalOffice.save();
    }
    
    return coordinates;
  }
  
  // If neither exists, throw an error
  throw new Error('Municipal office location is not properly configured. Please update the office with location coordinates.');
}

// Helper function to get latitude and longitude from municipal office (for distance calculations)
function getOfficeLatLng(municipalOffice) {
  // Try location.coordinates first (GeoJSON format: [lng, lat])
  if (municipalOffice.location && municipalOffice.location.coordinates && 
      Array.isArray(municipalOffice.location.coordinates) && 
      municipalOffice.location.coordinates.length === 2) {
    return {
      latitude: municipalOffice.location.coordinates[1],
      longitude: municipalOffice.location.coordinates[0],
    };
  }
  
  // Fallback to direct latitude/longitude fields
  if (municipalOffice.latitude && municipalOffice.longitude) {
    return {
      latitude: municipalOffice.latitude,
      longitude: municipalOffice.longitude,
    };
  }
  
  // If neither exists, throw an error
  throw new Error('Municipal office location is not properly configured.');
}

// @desc    Get dashboard stats for municipal officer
// @route   GET /api/municipal/dashboard/stats
// @access  Private (MUNICIPAL_OFFICER)
export const getDashboardStats = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id).populate('municipalOffice');
    
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER' || !officer.municipalOffice) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    const municipalOffice = officer.municipalOffice;
    const radiusInMeters = (municipalOffice.jurisdictionRadius || 15) * 1000; // Convert km to meters

    // Get office coordinates (handles missing location.coordinates)
    const officeCoordinates = await getOfficeCoordinates(municipalOffice);

    // Find complaints within jurisdiction using geospatial query
    // Use try-catch to handle cases where geospatial index might not exist
    let complaints = [];
    try {
      complaints = await Complaint.find({
        geoLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: officeCoordinates, // [longitude, latitude]
            },
            $maxDistance: radiusInMeters,
          },
        },
        status: { $ne: 'Closed' }, // Exclude closed complaints
      }).populate('user', 'name email phone');
    } catch (geoError) {
      // Fallback: If geospatial query fails, get all non-closed complaints
      // This handles cases where index doesn't exist or geoLocation is missing
      console.warn('Geospatial query failed, using fallback:', geoError.message);
      complaints = await Complaint.find({
        status: { $ne: 'Closed' },
      }).populate('user', 'name email phone');
    }

    // Calculate closed count with fallback
    // Use $geoWithin instead of $near for countDocuments (which doesn't support $near)
    let closedCount = 0;
    try {
      // Convert $near to $geoWithin with $centerSphere
      // $centerSphere expects radius in radians (divide by Earth's radius in meters: 6378100)
      const radiusInRadians = radiusInMeters / 6378100;
      closedCount = await Complaint.countDocuments({
        geoLocation: {
          $geoWithin: {
            $centerSphere: [officeCoordinates, radiusInRadians], // [lng, lat], radius in radians
          },
        },
        status: 'Closed',
      });
    } catch (geoError) {
      // Fallback: count all closed complaints if geospatial query fails
      closedCount = await Complaint.countDocuments({ status: 'Closed' });
    }

    let fakeConfirmed = 0;
    try {
      const radiusInRadians = radiusInMeters / 6378100;
      fakeConfirmed = await Complaint.countDocuments({
        geoLocation: {
          $geoWithin: {
            $centerSphere: [officeCoordinates, radiusInRadians],
          },
        },
        isFake: true,
      });
    } catch (geoError) {
      fakeConfirmed = await Complaint.countDocuments({ isFake: true });
    }

    const openForReview = (c) =>
      c.requiresReview && ['Submitted', 'Field-verification'].includes(c.status);

    // Calculate stats
    const stats = {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'Submitted').length,
      verified: complaints.filter((c) => c.status === 'Verified').length,
      inProgress: complaints.filter(
        (c) => c.status === 'Assigned' || c.status === 'In-progress'
      ).length,
      completed: complaints.filter((c) => c.status === 'Completed').length,
      closed: closedCount,
      pendingReview: complaints.filter(openForReview).length,
      fieldVerificationPending: complaints.filter((c) => c.status === 'Field-verification').length,
      fakeConfirmed,
      reviewQueue: {
        possibleDuplicates: complaints.filter(
          (c) =>
            openForReview(c) &&
            (c.reviewFlags || []).some((f) => f.type === 'possible_duplicate')
        ).length,
        highVolume: complaints.filter(
          (c) =>
            openForReview(c) && (c.reviewFlags || []).some((f) => f.type === 'high_volume')
        ).length,
        fieldPending: complaints.filter((c) => c.status === 'Field-verification').length,
      },
    };

    res.status(200).json({
      success: true,
      data: {
        stats,
        municipalOffice: {
          name: municipalOffice.name,
          type: municipalOffice.type,
          jurisdictionRadius: municipalOffice.jurisdictionRadius,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message,
    });
  }
};

// @desc    Get complaints for municipal officer (geo-filtered)
// @route   GET /api/municipal/complaints
// @access  Private (MUNICIPAL_OFFICER)
export const getComplaints = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id).populate('municipalOffice');
    
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER' || !officer.municipalOffice) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    const municipalOffice = officer.municipalOffice;
    const radiusInMeters = (municipalOffice.jurisdictionRadius || 15) * 1000;
    const { status, category, page = 1, limit = 20, review } = req.query;

    // Get office coordinates (handles missing location.coordinates)
    const officeCoordinates = await getOfficeCoordinates(municipalOffice);

    // Build query with fallback for geospatial queries
    // Use separate queries for find() ($near) and countDocuments() ($geoWithin)
    let geoQuery = {};
    let countQuery = {};
    try {
      // For find() - use $near (supports sorting)
      geoQuery = {
        geoLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: officeCoordinates, // [longitude, latitude]
            },
            $maxDistance: radiusInMeters,
          },
        },
      };
      // For countDocuments() - use $geoWithin (doesn't require sorting)
      const radiusInRadians = radiusInMeters / 6378100; // Convert to radians
      countQuery = {
        geoLocation: {
          $geoWithin: {
            $centerSphere: [officeCoordinates, radiusInRadians], // [lng, lat], radius in radians
          },
        },
      };
    } catch (geoError) {
      // If geospatial query setup fails, use empty query (will get all complaints)
      console.warn('Geospatial query setup failed, using fallback:', geoError.message);
      geoQuery = {};
      countQuery = {};
    }

    if (status === 'review' || review === 'true') {
      geoQuery.requiresReview = true;
      countQuery.requiresReview = true;
      geoQuery.status = { $in: ['Submitted', 'Field-verification'] };
      countQuery.status = { $in: ['Submitted', 'Field-verification'] };
    } else if (status === 'fake') {
      geoQuery.isFake = true;
      countQuery.isFake = true;
    } else if (status && status !== 'all') {
      geoQuery.status = status;
      countQuery.status = status;
    }

    if (category && category !== 'all') {
      geoQuery.category = category;
      countQuery.category = category;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let complaints = [];
    let total = 0;
    
    try {
      complaints = await Complaint.find(geoQuery)
        .populate('user', 'name email phone demeritPoints fakeComplaintCount blockedUntil rewardPoints')
        .populate('assignedContractor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Use countQuery (with $geoWithin) for countDocuments
      total = await Complaint.countDocuments(countQuery);
    } catch (queryError) {
      // Fallback: If geospatial query fails, use simple query
      console.warn('Query execution failed, using fallback:', queryError.message);
      const fallbackQuery = { ...geoQuery };
      delete fallbackQuery.geoLocation; // Remove geospatial part
      
      complaints = await Complaint.find(fallbackQuery)
        .populate('user', 'name email phone demeritPoints fakeComplaintCount blockedUntil rewardPoints')
        .populate('assignedContractor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      total = await Complaint.countDocuments(fallbackQuery);
    }

    // Calculate distance for each complaint
    const officeLocation = getOfficeLatLng(municipalOffice);
    
    const complaintsWithDistance = complaints.map((complaint) => {
      let distance = 0;
      if (complaint.location && complaint.location.latitude && complaint.location.longitude) {
        distance = calculateDistance(
          officeLocation.latitude,
          officeLocation.longitude,
          complaint.location.latitude,
          complaint.location.longitude
        );
      }
      return {
        ...complaint.toObject(),
        distance: distance.toFixed(2),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        complaints: complaintsWithDistance,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message,
    });
  }
};

// @desc    Verify or reject a complaint
// @route   PUT /api/municipal/complaints/:id/verify
// @access  Private (MUNICIPAL_OFFICER)
export const verifyComplaint = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id).populate('municipalOffice');
    
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER' || !officer.municipalOffice) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    const { id } = req.params;
    const { action, reason } = req.body; // action: 'verify' or 'reject'

    const complaint = await Complaint.findById(id).populate('user');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check if complaint is in officer's jurisdiction
    const municipalOffice = officer.municipalOffice;
    const officeLocation = getOfficeLatLng(municipalOffice);
    const distance = calculateDistance(
      officeLocation.latitude,
      officeLocation.longitude,
      complaint.location.latitude,
      complaint.location.longitude
    );

    if (distance > municipalOffice.jurisdictionRadius) {
      return res.status(403).json({
        success: false,
        message: 'Complaint is outside your jurisdiction',
      });
    }

    let reward = null;
    if (action === 'verify') {
      if (complaint.isFake) {
        return res.status(400).json({
          success: false,
          message: 'A complaint already marked fake cannot be verified.',
        });
      }

      if (!complaint.verificationRewardAwarded) {
        const wasPreviouslyVerified =
          complaint.status === 'Verified' ||
          complaint.statusHistory.some((entry) => entry.status === 'Verified');
        if (!wasPreviouslyVerified) {
          reward = await awardVerifiedComplaintReward(complaint.user);
        }
        complaint.verificationRewardAwarded = true;
      }

      // Set priority if not already set (based on category)
      if (!complaint.priority) {
        complaint.priority = getCategoryPriority(complaint.category);
      }
      
      complaint.status = 'Verified';
      complaint.requiresReview = false;
      complaint.assignedOfficer = officer._id;
      complaint.statusHistory.push({
        status: 'Verified',
        updatedAt: new Date(),
        updatedBy: officer.name,
        note: reason || 'Complaint verified by municipal officer',
      });
      await complaint.save();

      // Create notification
      await Notification.create({
        user: complaint.user._id,
        complaint: complaint._id,
        title: 'Complaint Verified',
        message: `Your ${complaint.category} complaint has been verified and is being processed.`,
        type: 'status_update',
      });

      if (reward) {
        await Notification.create({
          user: complaint.user._id,
          complaint: complaint._id,
          title: 'CivicFix points awarded',
          message: `Your complaint was verified. ${reward.rewardPointsAwarded} CivicFix reward points were added (balance ${reward.rewardPoints}).`,
          type: 'status_update',
        });
      }

      // Send email notification to the complainant (if email exists)
      const userEmail = complaint.user?.email;
      console.log(`[Verify Complaint] 📧 Attempting to send email notification`);
      console.log(`[Verify Complaint] User ID: ${complaint.user?._id}`);
      console.log(`[Verify Complaint] User Name: ${complaint.user?.name || 'N/A'}`);
      console.log(`[Verify Complaint] User Email: ${userEmail || 'NOT PROVIDED'}`);
      console.log(`[Verify Complaint] Priority: ${complaint.priority}`);
      
      if (userEmail) {
        const municipalOffice = officer.municipalOffice;
        const complaintId = complaint._id.toString().slice(-6);
        const category = complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1);
        const priority = complaint.priority || getCategoryPriority(complaint.category);
        const resolutionTime = getResolutionTime(priority);
        
        const emailData = {
          userName: complaint.user.name || 'Citizen',
          category: category,
          complaintId: complaintId,
          municipalOfficeName: municipalOffice?.name || 'Municipal Office',
          municipalOfficePhone: municipalOffice?.contact?.phone || '',
          priority: priority,
          resolutionTime: resolutionTime,
          rewardPointsAwarded: reward?.rewardPointsAwarded || 0,
        };
        
        console.log(`[Verify Complaint] 📤 Calling sendComplaintVerificationEmail function...`);
        try {
          const emailResult = await sendComplaintVerificationEmail(userEmail, emailData);
          console.log(`[Verify Complaint] 📥 Email Result:`, emailResult);
          
          if (emailResult.success) {
            console.log(`[Verify Complaint] ✅ Email sent successfully! Message ID: ${emailResult.messageId}`);
          } else if (emailResult.fallback) {
            console.warn(`[Verify Complaint] ⚠️ EmailJS not configured, using fallback mode`);
          } else {
            console.error(`[Verify Complaint] ❌ Email failed: ${emailResult.error}`);
            console.error(`[Verify Complaint] Raw error: ${emailResult.rawError || 'N/A'}`);
          }
        } catch (emailError) {
          console.error('[Verify Complaint] ❌ Exception while sending email:', emailError.message);
          console.error('[Verify Complaint] Stack:', emailError.stack);
        }
      } else {
        console.warn(`[Verify Complaint] ⚠️ No email address found for user: ${complaint.user?._id}`);
        console.warn(`[Verify Complaint] User object:`, JSON.stringify(complaint.user, null, 2));
      }
    } else if (action === 'reject') {
      complaint.status = 'Closed';
      complaint.closedReason = 'other';
      complaint.requiresReview = false;
      complaint.statusHistory.push({
        status: 'Closed',
        updatedAt: new Date(),
        updatedBy: officer.name,
        note: reason || 'Complaint rejected by municipal officer',
      });
      await complaint.save();

      // Create notification
      await Notification.create({
        user: complaint.user._id,
        complaint: complaint._id,
        title: 'Complaint Rejected',
        message: `Your complaint has been rejected. Reason: ${reason || 'Not specified'}`,
        type: 'status_update',
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "verify" or "reject"',
      });
    }

    res.status(200).json({
      success: true,
      message:
        action === 'verify'
          ? reward
            ? `Complaint verified. ${reward.rewardPointsAwarded} reward points were awarded.`
            : 'Complaint verified successfully'
          : 'Complaint rejected successfully',
      data: { complaint, reward },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message,
    });
  }
};

// @desc    Assign contractor to complaint
// @route   PUT /api/municipal/complaints/:id/assign
// @access  Private (MUNICIPAL_OFFICER)
export const assignContractor = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id).populate('municipalOffice');
    
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER' || !officer.municipalOffice) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    const { id } = req.params;
    const { contractorId, deadline } = req.body;

    if (!contractorId) {
      return res.status(400).json({
        success: false,
        message: 'Contractor ID is required',
      });
    }

    const complaint = await Complaint.findById(id).populate('user');
    const contractor = await User.findById(contractorId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (!contractor || contractor.role !== 'contractor') {
      return res.status(404).json({
        success: false,
        message: 'Contractor not found',
      });
    }

    // Check jurisdiction
    const municipalOffice = officer.municipalOffice;
    const officeLocation = getOfficeLatLng(municipalOffice);
    const distance = calculateDistance(
      officeLocation.latitude,
      officeLocation.longitude,
      complaint.location.latitude,
      complaint.location.longitude
    );

    if (distance > municipalOffice.jurisdictionRadius) {
      return res.status(403).json({
        success: false,
        message: 'Complaint is outside your jurisdiction',
      });
    }

    complaint.status = 'Assigned';
    complaint.assignedContractor = contractorId;
    complaint.assignedOfficer = officer._id;
    if (deadline) {
      complaint.deadline = new Date(deadline);
    }
    complaint.statusHistory.push({
      status: 'Assigned',
      updatedAt: new Date(),
      updatedBy: officer.name,
      note: `Assigned to contractor: ${contractor.name}`,
    });

    await complaint.save();

    // Create notifications
    await Notification.create({
      user: complaint.user._id,
      complaint: complaint._id,
      title: 'Contractor Assigned',
      message: `A contractor has been assigned to your ${complaint.category} complaint.`,
      type: 'status_update',
    });

    // Create notification for contractor
    await Notification.create({
      user: contractorId,
      complaint: complaint._id,
      title: 'New Project Assigned',
      message: `You have been assigned to a ${complaint.category} complaint.`,
      type: 'assignment',
    });

    if (contractor.email) {
      try {
        const category =
          complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1);
        await sendContractorAssignmentEmail(contractor.email, {
          contractorName: contractor.name || 'Contractor',
          category,
          complaintId: complaint._id.toString().slice(-6),
          address: complaint.location?.address || '',
          deadline: complaint.deadline || null,
          municipalOfficeName: municipalOffice?.name || 'Municipal Office',
        });
      } catch (emailError) {
        console.error('[Assign Contractor] Email failed:', emailError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Contractor assigned successfully',
      data: { complaint },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning contractor',
      error: error.message,
    });
  }
};

// @desc    Update complaint status
// @route   PUT /api/municipal/complaints/:id/status
// @access  Private (MUNICIPAL_OFFICER)
export const updateComplaintStatus = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id).populate('municipalOffice');
    
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER' || !officer.municipalOffice) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      'Submitted',
      'Verified',
      'Assigned',
      'In-progress',
      'Completed',
      'Closed',
      'Field-verification',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const complaint = await Complaint.findById(id).populate('user');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check jurisdiction
    const municipalOffice = officer.municipalOffice;
    const officeLocation = getOfficeLatLng(municipalOffice);
    const distance = calculateDistance(
      officeLocation.latitude,
      officeLocation.longitude,
      complaint.location.latitude,
      complaint.location.longitude
    );

    if (distance > municipalOffice.jurisdictionRadius) {
      return res.status(403).json({
        success: false,
        message: 'Complaint is outside your jurisdiction',
      });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      updatedAt: new Date(),
      updatedBy: officer.name,
      note: note || `Status updated to ${status}`,
    });

    await complaint.save();

    // Create notification
    await Notification.create({
      user: complaint.user._id,
      complaint: complaint._id,
      title: 'Status Updated',
      message: `Your complaint status has been updated to ${status}.`,
      type: 'status_update',
    });

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: { complaint },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message,
    });
  }
};

// @desc    Close complaint after verification
// @route   PUT /api/municipal/complaints/:id/close
// @access  Private (MUNICIPAL_OFFICER)
export const closeComplaint = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id).populate('municipalOffice');
    
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER' || !officer.municipalOffice) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    const { id } = req.params;
    const { note } = req.body;

    const complaint = await Complaint.findById(id).populate('user');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check jurisdiction
    const municipalOffice = officer.municipalOffice;
    const officeLocation = getOfficeLatLng(municipalOffice);
    const distance = calculateDistance(
      officeLocation.latitude,
      officeLocation.longitude,
      complaint.location.latitude,
      complaint.location.longitude
    );

    if (distance > municipalOffice.jurisdictionRadius) {
      return res.status(403).json({
        success: false,
        message: 'Complaint is outside your jurisdiction',
      });
    }

    if (complaint.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Complaint must be completed before closing',
      });
    }

    complaint.status = 'Closed';
    complaint.statusHistory.push({
      status: 'Closed',
      updatedAt: new Date(),
      updatedBy: officer.name,
      note: note || 'Complaint closed after verification',
    });

    await complaint.save();

    // Create notification
    await Notification.create({
      user: complaint.user._id,
      complaint: complaint._id,
      title: 'Complaint Closed',
      message: `Your ${complaint.category} complaint has been closed. Thank you for your report!`,
      type: 'status_update',
    });

    res.status(200).json({
      success: true,
      message: 'Complaint closed successfully',
      data: { complaint },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error closing complaint',
      error: error.message,
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/municipal/analytics
// @access  Private (MUNICIPAL_OFFICER)
export const getAnalytics = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id).populate('municipalOffice');
    
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER' || !officer.municipalOffice) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    const municipalOffice = officer.municipalOffice;
    const radiusInMeters = (municipalOffice.jurisdictionRadius || 15) * 1000;

    // Get office coordinates (handles missing location.coordinates)
    const officeCoordinates = await getOfficeCoordinates(municipalOffice);

    // Get all complaints in jurisdiction with fallback
    let complaints = [];
    try {
      complaints = await Complaint.find({
        geoLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: officeCoordinates, // [longitude, latitude]
            },
            $maxDistance: radiusInMeters,
          },
        },
      });
    } catch (geoError) {
      // Fallback: Get all complaints if geospatial query fails
      console.warn('Geospatial query failed in analytics, using fallback:', geoError.message);
      complaints = await Complaint.find({});
    }

    // Category-wise distribution
    const categoryStats = {};
    complaints.forEach((complaint) => {
      categoryStats[complaint.category] = (categoryStats[complaint.category] || 0) + 1;
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      monthlyTrend[monthKey] = 0;
    }

    complaints.forEach((complaint) => {
      const month = new Date(complaint.createdAt);
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyTrend.hasOwnProperty(monthKey)) {
        monthlyTrend[monthKey]++;
      }
    });

    // Average resolution time (for closed complaints)
    const closedComplaints = complaints.filter((c) => c.status === 'Closed');
    let totalResolutionTime = 0;
    let count = 0;

    closedComplaints.forEach((complaint) => {
      const submittedDate = complaint.createdAt;
      const closedDate = complaint.statusHistory.find((h) => h.status === 'Closed')?.updatedAt;
      if (closedDate) {
        const resolutionTime = (closedDate - submittedDate) / (1000 * 60 * 60 * 24); // days
        totalResolutionTime += resolutionTime;
        count++;
      }
    });

    const avgResolutionTime = count > 0 ? (totalResolutionTime / count).toFixed(1) : 0;

    // Contractor performance (if any contractors assigned)
    const contractorStats = {};
    const complaintsWithContractors = complaints.filter((c) => c.assignedContractor);
    complaintsWithContractors.forEach((complaint) => {
      const contractorId = complaint.assignedContractor.toString();
      if (!contractorStats[contractorId]) {
        contractorStats[contractorId] = {
          total: 0,
          completed: 0,
        };
      }
      contractorStats[contractorId].total++;
      if (complaint.status === 'Completed' || complaint.status === 'Closed') {
        contractorStats[contractorId].completed++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        categoryStats,
        monthlyTrend,
        avgResolutionTime: parseFloat(avgResolutionTime),
        contractorStats,
        totalComplaints: complaints.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};

// @desc    Get available contractors
// @route   GET /api/municipal/contractors
// @access  Private (MUNICIPAL_OFFICER)
export const getContractors = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id);
    
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    // Only contractors who completed municipal onboarding (or legacy accounts without workflow)
    const userContractors = await User.find({
      role: 'contractor',
      $and: [
        { $or: [{ isActive: { $exists: false } }, { isActive: true }] },
        {
          $or: [
            { 'contractorVerification.status': 'eligible' },
            { contractorVerification: { $exists: false } },
            { 'contractorVerification.status': { $in: [null, 'none'] } },
          ],
        },
      ],
    })
      .select('name email phone contractorInfo isActive contractorVerification')
      .populate({
        path: 'contractorInfo',
        select: 'companyName licenseNumber rating totalJobs completedJobs'
      })
      .sort({ 'contractorInfo.rating': -1 });

    // Also get from Contractor model if it exists
    const contractorDocs = await Contractor.find({ isActive: true })
      .populate('user', 'name email phone')
      .sort({ rating: -1 });

    // Combine and format contractors
    const contractors = [
      ...userContractors.map(u => ({
        _id: u._id,
        name: u.name || u.contractorInfo?.companyName,
        email: u.email,
        phone: u.phone,
        rating: u.contractorInfo?.rating || 0,
        availability: u.isActive !== false,
        experience: 0, // Default if not in User model
        workDone: u.contractorInfo?.completedJobs || u.contractorInfo?.totalJobs || 0,
        companyName: u.contractorInfo?.companyName || u.name,
        licenseNumber: u.contractorInfo?.licenseNumber || '',
        specialties: [],
      })),
      ...contractorDocs.map(c => ({
        _id: c.user?._id || c._id,
        name: c.user?.name || c.companyName,
        email: c.user?.email || c.email,
        phone: c.user?.phone || c.phone,
        rating: c.rating || 0,
        availability: c.isActive !== false,
        experience: c.experience || 0,
        workDone: c.workDone || c.completedJobs || 0,
        companyName: c.companyName,
        licenseNumber: c.licenseNumber,
        specialties: c.specialties || [],
      }))
    ];

    // Remove duplicates and sort by rating
    const uniqueContractors = contractors.filter((c, index, self) => 
      index === self.findIndex(t => t._id.toString() === c._id.toString())
    ).sort((a, b) => (b.rating || 0) - (a.rating || 0));

    res.status(200).json({
      success: true,
      data: { contractors },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contractors',
      error: error.message,
    });
  }
};

// @desc    List contractor registration queue (certificate + details pending / in progress)
// @route   GET /api/municipal/contractor-applications
// @access  Private (MUNICIPAL_OFFICER)
export const getContractorApplications = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id);
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    const applications = await User.find({
      role: 'contractor',
      'contractorVerification.status': { $in: ['pending', 'verified', 'rejected'] },
    })
      .select('name email phone contractorInfo contractorVerification createdAt')
      .sort({ 'contractorVerification.submittedAt': -1 });

    res.status(200).json({
      success: true,
      data: { applications },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching contractor applications',
      error: error.message,
    });
  }
};

// @desc    Approve or reject contractor details + certificate
// @route   PUT /api/municipal/contractor-applications/:userId/verify
// @access  Private (MUNICIPAL_OFFICER)
export const verifyContractorApplication = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id);
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    const { action, note, rejectionReason } = req.body;
    const contractor = await User.findOne({
      _id: req.params.userId,
      role: 'contractor',
    });

    if (!contractor?.contractorVerification) {
      return res.status(404).json({
        success: false,
        message: 'Contractor application not found.',
      });
    }

    if (contractor.contractorVerification.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This application is not awaiting document verification.',
      });
    }

    if (action === 'approve') {
      contractor.contractorVerification.status = 'verified';
      contractor.contractorVerification.verifiedBy = officer._id;
      contractor.contractorVerification.verifiedAt = new Date();
      contractor.contractorVerification.verificationNote = note?.trim() || '';
      contractor.contractorVerification.rejectionReason = undefined;
    } else if (action === 'reject') {
      if (!rejectionReason?.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a reason for rejection.',
        });
      }
      contractor.contractorVerification.status = 'rejected';
      contractor.contractorVerification.rejectionReason = rejectionReason.trim();
      contractor.contractorVerification.verifiedBy = officer._id;
      contractor.contractorVerification.verifiedAt = new Date();
    } else {
      return res.status(400).json({
        success: false,
        message: 'action must be "approve" or "reject".',
      });
    }

    await contractor.save();

    res.status(200).json({
      success: true,
      message:
        action === 'approve'
          ? 'Application verified. Schedule an in-person appointment to activate this contractor.'
          : 'Application rejected.',
      data: { application: contractor },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating contractor application',
      error: error.message,
    });
  }
};

// @desc    Schedule in-person appointment and mark contractor eligible for the portal
// @route   PUT /api/municipal/contractor-applications/:userId/appointment
// @access  Private (MUNICIPAL_OFFICER)
export const scheduleContractorAppointment = async (req, res) => {
  try {
    const officer = await User.findById(req.user.id);
    if (!officer || officer.role !== 'MUNICIPAL_OFFICER') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Municipal officer account required.',
      });
    }

    const { appointmentAt, appointmentNotes } = req.body;
    if (!appointmentAt) {
      return res.status(400).json({
        success: false,
        message: 'Please provide appointmentAt (ISO date/time).',
      });
    }

    const when = new Date(appointmentAt);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment date.',
      });
    }

    const contractor = await User.findOne({
      _id: req.params.userId,
      role: 'contractor',
    });

    if (!contractor?.contractorVerification) {
      return res.status(404).json({
        success: false,
        message: 'Contractor application not found.',
      });
    }

    if (contractor.contractorVerification.status !== 'verified') {
      return res.status(400).json({
        success: false,
        message:
          'Verify the contractor’s details and certificate before scheduling an appointment.',
      });
    }

    contractor.contractorVerification.appointmentAt = when;
    contractor.contractorVerification.appointmentNotes =
      appointmentNotes?.trim() || '';
    contractor.contractorVerification.appointmentSetBy = officer._id;
    contractor.contractorVerification.appointmentSetAt = new Date();
    contractor.contractorVerification.status = 'eligible';
    contractor.isActive = true;

    await contractor.save();

    if (contractor.email) {
      try {
        await sendContractorPortalReadyEmail(contractor.email, {
          contractorName: contractor.name || 'Contractor',
          companyName: contractor.contractorInfo?.companyName || '',
          appointmentAt: contractor.contractorVerification.appointmentAt,
          appointmentNotes: contractor.contractorVerification.appointmentNotes,
        });
      } catch (emailError) {
        console.error('[Contractor eligible] Email failed:', emailError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Appointment scheduled. The contractor can now use the portal.',
      data: { application: contractor },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error scheduling appointment',
      error: error.message,
    });
  }
};

const FAKE_REASON_LABELS = {
  fabricated_issue: 'Fabricated issue',
  misleading_information: 'Misleading information',
  unrelated_photo: 'Misleading / unrelated photo',
  incorrect_location: 'Incorrect location',
  other: 'Other',
};

async function getOfficerAndComplaint(req, res) {
  const officer = await User.findById(req.user.id).populate('municipalOffice');
  if (!officer || officer.role !== 'MUNICIPAL_OFFICER' || !officer.municipalOffice) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Municipal officer account required.',
    });
    return {};
  }

  const complaint = await Complaint.findById(req.params.id).populate(
    'user',
    'name email phone demeritPoints fakeComplaintCount blockedUntil role rewardPoints'
  );
  if (!complaint) {
    res.status(404).json({ success: false, message: 'Complaint not found' });
    return {};
  }

  const municipalOffice = officer.municipalOffice;
  const officeLocation = getOfficeLatLng(municipalOffice);
  const distance = calculateDistance(
    officeLocation.latitude,
    officeLocation.longitude,
    complaint.location.latitude,
    complaint.location.longitude
  );
  if (distance > municipalOffice.jurisdictionRadius) {
    res.status(403).json({
      success: false,
      message: 'Complaint is outside your jurisdiction',
    });
    return {};
  }

  return { officer, complaint };
}

async function buildReviewPayload(complaint) {
  const review = await computeReviewSignals({
    userId: complaint.user?._id || complaint.user,
    category: complaint.category,
    latitude: complaint.location?.latitude,
    longitude: complaint.location?.longitude,
    excludeId: complaint._id,
  });
  const reporterStats = complaint.user
    ? await getReporterStats(complaint.user._id)
    : { totalComplaints: 0, fakeComplaints: 0 };
  const demeritPoints = complaint.user?.demeritPoints || 0;
  const fakeComplaintCount = Math.max(
    complaint.user?.fakeComplaintCount || 0,
    reporterStats.fakeComplaints || 0
  );
  return {
    complaint,
    reviewSignals: review.flags,
    nearbyComplaints: review.nearbySummaries,
    reporterStats: {
      ...reporterStats,
      demeritPoints,
      fakeComplaintCount,
      blockedUntil: complaint.user?.blockedUntil || null,
      rewardPoints: complaint.user?.rewardPoints || 0,
    },
    penaltyPreview: {
      currentPoints: demeritPoints,
      afterFake: demeritPoints + REVIEW_CONFIG.demeritsPerFake,
      fakeComplaintCount,
      afterFakeComplaintCount: fakeComplaintCount + 1,
      wouldBlock:
        fakeComplaintCount + 1 >= REVIEW_CONFIG.fakeComplaintBlockThreshold,
      blockDays: REVIEW_CONFIG.blockDays,
      fakeComplaintBlockThreshold: REVIEW_CONFIG.fakeComplaintBlockThreshold,
    },
  };
}

// @desc    Complaint detail with review signals and reporter stats
// @route   GET /api/municipal/complaints/:id
export const getMunicipalComplaint = async (req, res) => {
  try {
    const { complaint } = await getOfficerAndComplaint(req, res);
    if (!complaint) return;

    const payload = await buildReviewPayload(complaint);
    res.status(200).json({ success: true, data: payload });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message,
    });
  }
};

// @desc    Mark complaint as a duplicate of another real issue (no demerit)
// @route   PUT /api/municipal/complaints/:id/duplicate
export const markComplaintDuplicate = async (req, res) => {
  try {
    const { officer, complaint } = await getOfficerAndComplaint(req, res);
    if (!complaint) return;

    const { duplicateOf, reason } = req.body;
    complaint.status = 'Closed';
    complaint.closedReason = 'duplicate';
    complaint.requiresReview = false;
    complaint.isFake = false;
    if (duplicateOf) complaint.duplicateOf = duplicateOf;
    complaint.statusHistory.push({
      status: 'Closed',
      updatedAt: new Date(),
      updatedBy: officer.name,
      note: reason || 'Closed as duplicate of an existing complaint',
    });
    await complaint.save();

    if (complaint.user?._id) {
      await Notification.create({
        user: complaint.user._id,
        complaint: complaint._id,
        title: 'Complaint closed as duplicate',
        message:
          'Your report matched an existing open complaint. No penalty was applied — thank you for reporting.',
        type: 'status_update',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint closed as duplicate. No demerit was applied.',
      data: { complaint },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error closing duplicate complaint',
      error: error.message,
    });
  }
};

// @desc    Start field verification (officer records the check in v1)
// @route   PUT /api/municipal/complaints/:id/field-verification
export const startFieldVerification = async (req, res) => {
  try {
    const { officer, complaint } = await getOfficerAndComplaint(req, res);
    if (!complaint) return;

    if (!['Submitted', 'Field-verification'].includes(complaint.status)) {
      return res.status(400).json({
        success: false,
        message: 'Field verification can only start on submitted or already pending complaints.',
      });
    }

    complaint.status = 'Field-verification';
    complaint.requiresReview = true;
    complaint.fieldVerification = {
      ...(complaint.fieldVerification?.toObject?.() || complaint.fieldVerification || {}),
      status: 'pending',
      instructions:
        req.body.instructions?.trim() ||
        'Verify whether the reported issue actually exists at this location.',
      assignedAt: new Date(),
      assignedBy: officer._id,
    };
    complaint.statusHistory.push({
      status: 'Field-verification',
      updatedAt: new Date(),
      updatedBy: officer.name,
      note: 'Field verification pending',
    });
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Field verification started. Record the site check when complete.',
      data: { complaint },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error starting field verification',
      error: error.message,
    });
  }
};

// @desc    Submit field verification evidence (officer on municipal dashboard)
// @route   PUT /api/municipal/complaints/:id/field-verification/submit
export const submitFieldVerification = async (req, res) => {
  try {
    const { officer, complaint } = await getOfficerAndComplaint(req, res);
    if (!complaint) return;

    const { result, remarks, latitude, longitude } = req.body;
    const allowed = ['issue_exists', 'issue_not_found', 'unable_to_access'];
    if (!allowed.includes(result)) {
      return res.status(400).json({
        success: false,
        message: 'result must be issue_exists, issue_not_found, or unable_to_access.',
      });
    }

    let photoUrl = complaint.fieldVerification?.photoUrl;
    if (req.file) {
      const stored = await saveUpload(req.file, 'field-verification');
      photoUrl = stored?.url || photoUrl;
    }

    const lat = latitude != null ? parseFloat(latitude) : null;
    const lng = longitude != null ? parseFloat(longitude) : null;
    let distanceFromReportMeters;
    if (lat != null && lng != null && complaint.location?.latitude) {
      distanceFromReportMeters = Math.round(
        haversineKm(complaint.location.latitude, complaint.location.longitude, lat, lng) * 1000
      );
    }

    complaint.fieldVerification = {
      ...(complaint.fieldVerification?.toObject?.() || complaint.fieldVerification || {}),
      status: 'completed',
      result,
      remarks: remarks || '',
      photoUrl,
      latitude: lat,
      longitude: lng,
      distanceFromReportMeters,
      submittedAt: new Date(),
      submittedBy: officer._id,
    };
    complaint.requiresReview = true;
    complaint.statusHistory.push({
      status: complaint.status,
      updatedAt: new Date(),
      updatedBy: officer.name,
      note: `Field verification: ${result.replaceAll('_', ' ')}`,
    });
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Field verification recorded. Review the evidence and make a decision.',
      data: { complaint },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting field verification',
      error: error.message,
    });
  }
};

// @desc    Officer confirms complaint is fake → demerit / possible timed block
// @route   PUT /api/municipal/complaints/:id/fake
export const markComplaintFake = async (req, res) => {
  try {
    const { officer, complaint } = await getOfficerAndComplaint(req, res);
    if (!complaint) return;

    if (complaint.isFake) {
      return res.status(400).json({
        success: false,
        message: 'This complaint is already marked fake.',
      });
    }

    const { fakeReason, remarks } = req.body;
    if (!fakeReason || !FAKE_REASON_LABELS[fakeReason]) {
      return res.status(400).json({
        success: false,
        message: 'Please select a fake-report reason.',
      });
    }
    if (!remarks?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Officer remarks are required before marking a complaint fake.',
      });
    }

    const reporter = await User.findById(complaint.user?._id || complaint.user);
    if (!reporter) {
      return res.status(404).json({ success: false, message: 'Reporter not found' });
    }

    const existingFakeComplaintCount = await Complaint.countDocuments({
      user: reporter._id,
      isFake: true,
    });
    reporter.fakeComplaintCount = Math.max(
      reporter.fakeComplaintCount || 0,
      existingFakeComplaintCount
    );
    const penalty = await applyFakePenalty(reporter);

    complaint.status = 'Closed';
    complaint.isFake = true;
    complaint.closedReason = 'fake';
    complaint.fakeReason = fakeReason;
    complaint.fakeRemarks = remarks.trim();
    complaint.markedFakeBy = officer._id;
    complaint.markedFakeAt = new Date();
    complaint.requiresReview = false;
    complaint.statusHistory.push({
      status: 'Closed',
      updatedAt: new Date(),
      updatedBy: officer.name,
      note: `Marked fake (${FAKE_REASON_LABELS[fakeReason]}): ${remarks.trim()}`,
    });
    await complaint.save();

    await Notification.create({
      user: reporter._id,
      complaint: complaint._id,
      title: penalty.blocked ? 'Account temporarily blocked' : 'Complaint marked as fake',
      message: penalty.blocked
        ? `A municipal officer confirmed this report as fake. ${penalty.rewardPointsDeducted} CivicFix reward points were deducted (balance ${penalty.rewardPoints}). You now have ${penalty.demeritPoints} demerit points and ${penalty.fakeComplaintCount} confirmed fake complaints. Your account is blocked until ${new Date(penalty.blockedUntil).toLocaleString()}.`
        : `A municipal officer confirmed this report as fake. ${penalty.rewardPointsDeducted} CivicFix reward points were deducted (balance ${penalty.rewardPoints}). You received ${REVIEW_CONFIG.demeritsPerFake} demerit points (now ${penalty.demeritPoints}) and have ${penalty.fakeComplaintCount} confirmed fake complaints.`,
      type: 'status_update',
    });

    if (reporter.email) {
      try {
        const category = complaint.category
          ? complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)
          : 'complaint';
        await sendFakeComplaintEmail(reporter.email, {
          userName: reporter.name || 'Citizen',
          category,
          complaintId: complaint._id.toString().slice(-6),
          reasonLabel: FAKE_REASON_LABELS[fakeReason],
          remarks: remarks.trim(),
          pointsDeducted: penalty.rewardPointsDeducted || 0,
          pointsBalance: penalty.rewardPoints || 0,
          demeritPoints: penalty.demeritPoints,
          fakeComplaintCount: penalty.fakeComplaintCount,
          blocked: penalty.blocked,
          blockedUntil: penalty.blockedUntil,
        });
      } catch (emailError) {
        console.error('[Mark fake] Email failed:', emailError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: penalty.blocked
        ? 'Complaint marked fake. Reporter has 3 confirmed fake complaints and is blocked for 7 days.'
        : `Complaint marked fake. ${REVIEW_CONFIG.demeritsPerFake} demerit points were added to the reporter.`,
      data: {
        complaint,
        penalty: {
          ...penalty,
          reasonLabel: FAKE_REASON_LABELS[fakeReason],
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking complaint as fake',
      error: error.message,
    });
  }
};
