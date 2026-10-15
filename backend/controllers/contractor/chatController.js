import ChatMessage from '../../models/Chat.js';
import Complaint from '../../models/Complaint.js';
import User from '../../models/User.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/chat');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, and documents are allowed.'));
    }
  },
});

export const uploadMiddleware = upload.array('files', 5); // Max 5 files

// @desc    Get chat messages for a complaint
// @route   GET /api/chat/:complaintId
// @access  Private (contractor or MUNICIPAL_OFFICER)
export const getChatMessages = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const user = await User.findById(req.user.id);

    // Verify user is contractor or municipal officer
    if (!['contractor', 'MUNICIPAL_OFFICER'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Contractor or Municipal Officer account required.',
      });
    }

    // Verify complaint exists and user has access
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check if user is assigned to this complaint
    if (user.role === 'contractor' && complaint.assignedContractor?.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this complaint.',
      });
    }

    if (user.role === 'MUNICIPAL_OFFICER' && complaint.assignedOfficer?.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this complaint.',
      });
    }

    const messages = await ChatMessage.find({ complaint: complaintId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat messages',
      error: error.message,
    });
  }
};

// @desc    Send a chat message
// @route   POST /api/chat/:complaintId
// @access  Private (contractor or MUNICIPAL_OFFICER)
export const sendMessage = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { message } = req.body;
    const user = await User.findById(req.user.id);

    // Verify user is contractor or municipal officer
    if (!['contractor', 'MUNICIPAL_OFFICER'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Contractor or Municipal Officer account required.',
      });
    }

    // Verify complaint exists and user has access
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check if user is assigned to this complaint
    if (user.role === 'contractor' && complaint.assignedContractor?.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this complaint.',
      });
    }

    if (user.role === 'MUNICIPAL_OFFICER' && complaint.assignedOfficer?.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this complaint.',
      });
    }

    // Process file uploads
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        attachments.push({
          url: `/uploads/chat/${file.filename}`,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        });
      });
    }

    // Create chat message
    const chatMessage = await ChatMessage.create({
      complaint: complaintId,
      sender: user._id,
      message: message || '',
      attachments,
    });

    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate('sender', 'name email role');

    res.status(201).json({
      success: true,
      data: { message: populatedMessage },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:complaintId/read
// @access  Private (contractor or MUNICIPAL_OFFICER)
export const markMessagesRead = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const user = await User.findById(req.user.id);

    // Verify user is contractor or municipal officer
    if (!['contractor', 'MUNICIPAL_OFFICER'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Contractor or Municipal Officer account required.',
      });
    }

    // Update messages to mark as read by this user
    await ChatMessage.updateMany(
      {
        complaint: complaintId,
        sender: { $ne: user._id }, // Not sent by current user
        'readBy.user': { $ne: user._id }, // Not already read by this user
      },
      {
        $push: {
          readBy: {
            user: user._id,
            readAt: new Date(),
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message,
    });
  }
};

