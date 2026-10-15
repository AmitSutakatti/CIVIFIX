import path from 'path';
import User from '../../models/User.js';

// @desc    Register as contractor (details + degree certificate) — pending municipal review
// @route   POST /api/auth/contractor/register
// @access  Public
export const registerContractor = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your degree or qualification certificate.',
      });
    }

    const { name, email, phone, password, companyName, licenseNumber } = req.body;

    if (!name || !email || !password || !companyName || !licenseNumber) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide name, email, password, company name, and license number.',
      });
    }

    const emailLower = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account already exists with this email.',
      });
    }

    const publicPath = `/uploads/${path.basename(req.file.path)}`;

    const user = await User.create({
      name: name.trim(),
      email: emailLower,
      phone: phone?.trim(),
      password,
      role: 'contractor',
      isActive: false,
      contractorInfo: {
        companyName: companyName.trim(),
        licenseNumber: licenseNumber.trim(),
      },
      contractorVerification: {
        status: 'pending',
        degreeCertificatePath: publicPath,
        degreeCertificateOriginalName: req.file.originalname,
        submittedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message:
        'Registration received. Municipal staff will verify your details and certificate, then schedule an in-person appointment before your account becomes active.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          contractorVerification: { status: user.contractorVerification.status },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not complete registration.',
      error: error.message,
    });
  }
};
