import mongoose from 'mongoose';

const recipientSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    citizenName: { type: String, required: true },
    rank: { type: Number, required: true },
    netPoints: { type: Number, required: true },
    verifiedComplaints: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'sending', 'sent', 'failed'],
      default: 'pending',
    },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: Date,
    deliveredAt: Date,
    lastError: String,
  },
  { _id: false }
);

const rewardAnnouncementSchema = new mongoose.Schema(
  {
    periodId: { type: String, required: true, unique: true },
    periodLabel: { type: String, required: true },
    periodStartsAt: { type: Date, required: true },
    periodEndsAt: { type: Date, required: true },
    eventName: { type: String, required: true, trim: true, maxlength: 120 },
    venueName: { type: String, required: true, trim: true, maxlength: 160 },
    venueAddress: { type: String, required: true, trim: true, maxlength: 500 },
    eventDate: { type: String, required: true },
    eventTime: { type: String, required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipients: { type: [recipientSchema], required: true },
  },
  { timestamps: true }
);

const RewardAnnouncement = mongoose.model(
  'RewardAnnouncement',
  rewardAnnouncementSchema
);

export default RewardAnnouncement;
