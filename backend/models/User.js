import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { normalizePhone } from '../utils/phone.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    phoneNormalized: {
      type: String,
      trim: true,
      index: true,
    },
    rewardPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    registrationBonusAwarded: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'officer', 'MUNICIPAL_OFFICER', 'contractor'],
      default: 'user',
    },
    // For municipal officers - link to their municipal office
    municipalOffice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MunicipalOffice',
    },
    // For contractors - additional info
    contractorInfo: {
      companyName: String,
      licenseNumber: String,
      rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      totalJobs: {
        type: Number,
        default: 0,
      },
      completedJobs: {
        type: Number,
        default: 0,
      },
    },
    // Municipal onboarding: certificate upload, verification, in-person appointment, then eligible
    contractorVerification: {
      status: {
        type: String,
        enum: ['none', 'pending', 'verified', 'eligible', 'rejected'],
        default: 'none',
      },
      degreeCertificatePath: String,
      degreeCertificateOriginalName: String,
      submittedAt: Date,
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: Date,
      verificationNote: String,
      rejectionReason: String,
      appointmentAt: Date,
      appointmentNotes: String,
      appointmentSetBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      appointmentSetAt: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    demeritPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    fakeComplaintCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    blockedUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('phone')) {
    this.phoneNormalized = this.phone ? normalizePhone(this.phone) : undefined;
  }
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

