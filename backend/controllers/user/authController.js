import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import { contractorVerificationForClient } from '../../utils/contractorVerification.js';
import {
  citizenBlockPayload,
  clearExpiredCitizenBlock,
  isCitizenBlocked,
  REVIEW_CONFIG,
} from '../../utils/complaintReview.js';
import { isValidMobile, normalizePhone } from '../../utils/phone.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone number, and password',
      });
    }

    if (!isValidMobile(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number',
      });
    }

    const emailLower = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const normalized = normalizePhone(phone);
    const phoneAlreadyUsed = await User.exists({
      role: 'user',
      $or: [{ phoneNormalized: normalized }, { phone: { $regex: `${normalized}$` } }],
    });

    const awardBonus = !phoneAlreadyUsed;
    const bonusPoints = awardBonus ? REVIEW_CONFIG.registrationBonusPoints : 0;

    const user = await User.create({
      name,
      email: emailLower,
      phone: normalized,
      phoneNormalized: normalized,
      password,
      role: 'user',
      rewardPoints: bonusPoints,
      registrationBonusAwarded: awardBonus,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: awardBonus
        ? `Registration successful. You received ${bonusPoints} CivicFix points.`
        : 'Registration successful. This phone number is already on an account, so no registration bonus was added.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          rewardPoints: user.rewardPoints,
          registrationBonusAwarded: user.registrationBonusAwarded,
        },
        token,
        registrationBonus: {
          awarded: awardBonus,
          points: bonusPoints,
          reason: awardBonus
            ? 'Welcome bonus for first registration with this phone number'
            : 'Phone number already registered',
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    await clearExpiredCitizenBlock(user);
    if (isCitizenBlocked(user)) {
      return res.status(403).json(citizenBlockPayload(user));
    }

    // Generate token
    const token = generateToken(user._id);

    // Populate municipal office if MUNICIPAL_OFFICER
    let populatedUser = user;
    if (user.role === 'MUNICIPAL_OFFICER') {
      populatedUser = await User.findById(user._id).populate('municipalOffice');
    }

    const userData = {
      id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      phone: populatedUser.phone,
      role: populatedUser.role,
    };

    // Include municipal office info for MUNICIPAL_OFFICER
    if (populatedUser.role === 'MUNICIPAL_OFFICER' && populatedUser.municipalOffice) {
      userData.municipalOffice = {
        id: populatedUser.municipalOffice._id,
        name: populatedUser.municipalOffice.name,
        type: populatedUser.municipalOffice.type,
      };
    }

    if (populatedUser.role === 'contractor') {
      userData.contractorVerification = contractorVerificationForClient(populatedUser);
    }

    if (populatedUser.role === 'user') {
      userData.demeritPoints = populatedUser.demeritPoints || 0;
      userData.fakeComplaintCount = populatedUser.fakeComplaintCount || 0;
      userData.rewardPoints = populatedUser.rewardPoints || 0;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('municipalOffice');

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    // Include municipal office info for MUNICIPAL_OFFICER
    if (user.role === 'MUNICIPAL_OFFICER' && user.municipalOffice) {
      userData.municipalOffice = {
        id: user.municipalOffice._id,
        name: user.municipalOffice.name,
        type: user.municipalOffice.type,
      };
    }

    if (user.role === 'contractor') {
      userData.contractorVerification = contractorVerificationForClient(user);
    }

    if (user.role === 'user') {
      userData.demeritPoints = user.demeritPoints || 0;
      userData.fakeComplaintCount = user.fakeComplaintCount || 0;
      userData.rewardPoints = user.rewardPoints || 0;
    }

    res.status(200).json({
      success: true,
      data: {
        user: userData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};
