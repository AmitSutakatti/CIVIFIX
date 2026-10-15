import Complaint from '../models/Complaint.js';
import MunicipalOffice from '../models/MunicipalOffice.js';
import User from '../models/User.js';
import Contractor from '../models/Contractor.js';
import Notification from '../models/Notification.js';

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

    // Find complaints within jurisdiction using geospatial query
    const complaints = await Complaint.find({
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [
              municipalOffice.location.coordinates[0], // longitude
              municipalOffice.location.coordinates[1], // latitude
            ],
          },
          $maxDistance: radiusInMeters,
        },
      },
      status: { $ne: 'Closed' }, // Exclude closed complaints
    }).populate('user', 'name email phone');

    // Calculate stats
    const stats = {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'Submitted').length,
      verified: complaints.filter((c) => c.status === 'Verified').length,
      inProgress: complaints.filter(
        (c) => c.status === 'Assigned' || c.status === 'In-progress'
      ).length,
      completed: complaints.filter((c) => c.status === 'Completed').length,
      closed: await Complaint.countDocuments({
        geoLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [
                municipalOffice.location.coordinates[0],
                municipalOffice.location.coordinates[1],
              ],
            },
            $maxDistance: radiusInMeters,
          },
        },
        status: 'Closed',
      }),
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
    const { status, category, page = 1, limit = 20 } = req.query;

    // Build query
    const geoQuery = {
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [
              municipalOffice.location.coordinates[0],
              municipalOffice.location.coordinates[1],
            ],
          },
          $maxDistance: radiusInMeters,
        },
      },
    };

    if (status && status !== 'all') {
      geoQuery.status = status;
    }

    if (category && category !== 'all') {
      geoQuery.category = category;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await Complaint.find(geoQuery)
      .populate('user', 'name email phone')
      .populate('assignedContractor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(geoQuery);

    // Calculate distance for each complaint
    const complaintsWithDistance = complaints.map((complaint) => {
      const distance = calculateDistance(
        municipalOffice.latitude,
        municipalOffice.longitude,
        complaint.location.latitude,
        complaint.location.longitude
      );
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
    const radiusInMeters = (municipalOffice.jurisdictionRadius || 15) * 1000;
    const distance = calculateDistance(
      municipalOffice.latitude,
      municipalOffice.longitude,
      complaint.location.latitude,
      complaint.location.longitude
    );

    if (distance > municipalOffice.jurisdictionRadius) {
      return res.status(403).json({
        success: false,
        message: 'Complaint is outside your jurisdiction',
      });
    }

    if (action === 'verify') {
      complaint.status = 'Verified';
      complaint.assignedOfficer = officer._id;
      complaint.statusHistory.push({
        status: 'Verified',
        updatedAt: new Date(),
        updatedBy: officer.name,
        note: reason || 'Complaint verified by municipal officer',
      });

      // Create notification
      await Notification.create({
        user: complaint.user._id,
        complaint: complaint._id,
        title: 'Complaint Verified',
        message: `Your ${complaint.category} complaint has been verified and is being processed.`,
        type: 'status_update',
      });
    } else if (action === 'reject') {
      complaint.status = 'Closed';
      complaint.statusHistory.push({
        status: 'Closed',
        updatedAt: new Date(),
        updatedBy: officer.name,
        note: reason || 'Complaint rejected by municipal officer',
      });

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

    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Complaint ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
      data: { complaint },
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
    const distance = calculateDistance(
      municipalOffice.latitude,
      municipalOffice.longitude,
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

    const validStatuses = ['Submitted', 'Verified', 'Assigned', 'In-progress', 'Completed', 'Closed'];
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
    const distance = calculateDistance(
      municipalOffice.latitude,
      municipalOffice.longitude,
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
    const distance = calculateDistance(
      municipalOffice.latitude,
      municipalOffice.longitude,
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

    // Get all complaints in jurisdiction
    const complaints = await Complaint.find({
      geoLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [
              municipalOffice.location.coordinates[0],
              municipalOffice.location.coordinates[1],
            ],
          },
          $maxDistance: radiusInMeters,
        },
      },
    });

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

    const contractors = await User.find({ 
      role: 'contractor',
      $or: [{ isActive: { $exists: false } }, { isActive: true }]
    })
      .select('name email phone contractorInfo isActive')
      .sort({ 'contractorInfo.rating': -1 });

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
