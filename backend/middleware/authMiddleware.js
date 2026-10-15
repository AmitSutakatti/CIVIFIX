import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isContractorPortalEligible } from '../utils/contractorVerification.js';
import {
  citizenBlockPayload,
  clearExpiredCitizenBlock,
  isCitizenBlocked,
} from '../utils/complaintReview.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      await clearExpiredCitizenBlock(req.user);

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

/** Citizens with confirmed fake-report blocks cannot file new complaints. */
export const requireActiveCitizen = (req, res, next) => {
  if (req.user.role !== 'user') {
    return next();
  }
  if (isCitizenBlocked(req.user)) {
    return res.status(403).json(citizenBlockPayload(req.user));
  }
  next();
};

/** Block contractors until municipal workflow reaches `eligible`. Other roles pass through. */
export const requireEligibleContractor = (req, res, next) => {
  if (req.user.role !== 'contractor') {
    return next();
  }
  if (!isContractorPortalEligible(req.user)) {
    return res.status(403).json({
      success: false,
      code: 'CONTRACTOR_NOT_ELIGIBLE',
      message:
        'Your contractor account is not active yet. Finish municipal verification and your scheduled appointment.',
      verificationStatus: req.user.contractorVerification?.status || null,
    });
  }
  next();
};

