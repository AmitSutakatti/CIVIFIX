import Complaint from '../../models/Complaint.js';
import Notification from '../../models/Notification.js';
import User from '../../models/User.js';
import MunicipalOffice from '../../models/MunicipalOffice.js';

// @desc    Get assigned complaints for contractor
// @route   GET /api/contractor/complaints
// @access  Private (contractor)
export const getComplaints = async (req, res) => {
  try {
    const contractor = await User.findById(req.user.id);
    
    if (!contractor || contractor.role !== 'contractor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Contractor account required.',
      });
    }

    const complaints = await Complaint.find({
      assignedContractor: contractor._id,
    })
      .populate('user', 'name email phone')
      .populate('assignedOfficer', 'name email')
      .populate({
        path: 'assignedOfficer',
        populate: {
          path: 'municipalOffice',
          select: 'name type',
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
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

// @desc    Get notifications for contractor
// @route   GET /api/contractor/notifications
// @access  Private (contractor)
export const getNotifications = async (req, res) => {
  try {
    const contractor = await User.findById(req.user.id);
    
    if (!contractor || contractor.role !== 'contractor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Contractor account required.',
      });
    }

    const notifications = await Notification.find({
      user: contractor._id,
    })
      .populate('complaint', 'category description status')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

