import RewardAnnouncement from '../../models/RewardAnnouncement.js';
import User from '../../models/User.js';
import { sendEmail } from '../../services/emailService.js';
import {
  buildRewardCeremonyEmail,
  REWARD_CEREMONY_SUBJECT,
} from '../../templates/rewardCeremonyEmail.js';
import { getCurrentRewardLeaderboard } from '../../utils/rewardLeaderboard.js';

const publicAnnouncement = (announcement) => ({
  id: announcement._id,
  periodId: announcement.periodId,
  periodLabel: announcement.periodLabel,
  eventName: announcement.eventName,
  venueName: announcement.venueName,
  venueAddress: announcement.venueAddress,
  eventDate: announcement.eventDate,
  eventTime: announcement.eventTime,
  message: announcement.message,
  createdBy: announcement.createdBy,
  createdAt: announcement.createdAt,
  recipients: announcement.recipients.map((recipient) => ({
    citizenId: recipient.citizen,
    citizenName: recipient.citizenName,
    rank: recipient.rank,
    netPoints: recipient.netPoints,
    verifiedComplaints: recipient.verifiedComplaints,
    pointsEarned: recipient.pointsEarned,
    pointsDeducted: recipient.pointsDeducted,
    status: recipient.status,
    attempts: recipient.attempts,
    lastAttemptAt: recipient.lastAttemptAt,
    deliveredAt: recipient.deliveredAt,
    lastError: recipient.lastError,
  })),
});

const getAnnouncement = (periodId) =>
  RewardAnnouncement.findOne({ periodId }).populate('createdBy', 'name');

const validateAnnouncementDetails = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Announcement details must be submitted as a JSON object.' };
  }

  const fields = [
    ['eventName', 120],
    ['venueName', 160],
    ['venueAddress', 500],
    ['message', 2000],
  ];
  const result = {};
  for (const [field, maxLength] of fields) {
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      return { error: `${field} is required.` };
    }
    const value = body[field].trim();
    if (value.length > maxLength) {
      return { error: `${field} must be ${maxLength} characters or fewer.` };
    }
    result[field] = value;
  }

  const parsedEventDate =
    typeof body.eventDate === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(body.eventDate)
      ? new Date(`${body.eventDate}T00:00:00.000Z`)
      : null;
  if (
    !parsedEventDate ||
    Number.isNaN(parsedEventDate.getTime()) ||
    parsedEventDate.toISOString().slice(0, 10) !== body.eventDate
  ) {
    return { error: 'eventDate must be a valid date in YYYY-MM-DD format.' };
  }
  if (typeof body.eventTime !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(body.eventTime)) {
    return { error: 'eventTime must be a valid 24-hour time in HH:mm format.' };
  }

  result.eventDate = body.eventDate;
  result.eventTime = body.eventTime;
  return { value: result };
};

const dispatchPendingRecipients = async (announcement) => {
  for (const recipient of announcement.recipients) {
    if (!['pending', 'failed'].includes(recipient.status) || recipient.deliveredAt) {
      continue;
    }

    const claimed = await RewardAnnouncement.findOneAndUpdate(
      {
        _id: announcement._id,
        recipients: {
          $elemMatch: {
            citizen: recipient.citizen,
            status: { $in: ['pending', 'failed'] },
            deliveredAt: { $exists: false },
          },
        },
      },
      {
        $set: {
          'recipients.$.status': 'sending',
          'recipients.$.lastAttemptAt': new Date(),
        },
        $inc: { 'recipients.$.attempts': 1 },
      },
      { new: true }
    );
    if (!claimed) continue;

    let delivery;
    try {
      const citizen = await User.findById(recipient.citizen).select('email role');
      if (!citizen || citizen.role !== 'user' || !citizen.email) {
        delivery = { success: false, error: 'Citizen email address is unavailable.' };
      } else {
        const { subject, html, text } = buildRewardCeremonyEmail({
          citizenName: recipient.citizenName,
          rank: recipient.rank,
          periodLabel: announcement.periodLabel,
          netPoints: recipient.netPoints,
          verifiedComplaints: recipient.verifiedComplaints,
          pointsEarned: recipient.pointsEarned,
          pointsDeducted: recipient.pointsDeducted,
          pointsEarned: recipient.pointsEarned,
          pointsDeducted: recipient.pointsDeducted,
          eventName: announcement.eventName,
          venueName: announcement.venueName,
          venueAddress: announcement.venueAddress,
          eventDate: announcement.eventDate,
          eventTime: announcement.eventTime,
          message: announcement.message,
        });
        delivery = await sendEmail(citizen.email, subject, html, text);
      }
    } catch (error) {
      console.error('[Reward announcement] Email delivery failed:', error.message);
      delivery = { success: false, error: 'Email delivery failed.' };
    }

    const update = delivery.success
      ? {
          $set: {
            'recipients.$[recipient].status': 'sent',
            'recipients.$[recipient].deliveredAt': new Date(),
          },
          $unset: { 'recipients.$[recipient].lastError': 1 },
        }
      : {
          $set: {
            'recipients.$[recipient].status': 'failed',
            'recipients.$[recipient].lastError':
              delivery.error || 'Email delivery failed.',
          },
        };
    await RewardAnnouncement.updateOne(
      { _id: announcement._id },
      update,
      { arrayFilters: [{ 'recipient.citizen': recipient.citizen, 'recipient.status': 'sending' }] }
    );
  }
};

export const getRewardLeaderboard = async (_req, res) => {
  try {
    const current = await getCurrentRewardLeaderboard();
    const announcement = await getAnnouncement(current.period.id);
    res.status(200).json({
      success: true,
      data: {
        period: current.period,
        leaderboard: current.leaderboard,
        announcement: announcement ? publicAnnouncement(announcement) : null,
        emailSubject: REWARD_CEREMONY_SUBJECT,
      },
    });
  } catch (error) {
    console.error('[Reward leaderboard] Failed to load leaderboard:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to load the reward leaderboard.',
    });
  }
};

export const createRewardAnnouncement = async (req, res) => {
  const validation = validateAnnouncementDetails(req.body);
  if (validation.error) {
    return res.status(400).json({ success: false, message: validation.error });
  }
  if (
    Object.prototype.hasOwnProperty.call(req.body, 'recipients') ||
    Object.prototype.hasOwnProperty.call(req.body, 'recipientEmails') ||
    Object.prototype.hasOwnProperty.call(req.body, 'rankings')
  ) {
    return res.status(400).json({
      success: false,
      message: 'Recipients and rankings are selected by the backend and cannot be submitted.',
    });
  }

  try {
    const current = await getCurrentRewardLeaderboard();
    if (!current.leaderboard.length) {
      return res.status(400).json({
        success: false,
        message: 'There are no eligible citizens on the current leaderboard.',
      });
    }

    let announcement;
    try {
      announcement = await RewardAnnouncement.create({
        periodId: current.period.id,
        periodLabel: current.period.label,
        periodStartsAt: current.period.startsAt,
        periodEndsAt: current.period.endsAt,
        ...validation.value,
        createdBy: req.user._id,
        recipients: current.leaderboard.map((citizen) => ({
          citizen: citizen.citizenId,
          citizenName: citizen.name,
          rank: citizen.rank,
          netPoints: citizen.netPoints,
          verifiedComplaints: citizen.verifiedComplaints,
          pointsEarned: citizen.pointsEarned,
          pointsDeducted: citizen.pointsDeducted,
          status: 'pending',
        })),
      });
    } catch (error) {
      if (error.code === 11000) {
        const existing = await getAnnouncement(current.period.id);
        return res.status(409).json({
          success: false,
          message: 'An announcement already exists for this leaderboard period.',
          data: { announcement: existing ? publicAnnouncement(existing) : null },
        });
      }
      throw error;
    }

    await dispatchPendingRecipients(announcement);
    announcement = await getAnnouncement(current.period.id);
    return res.status(201).json({
      success: true,
      message: 'Reward ceremony announcement processed.',
      data: { announcement: publicAnnouncement(announcement) },
    });
  } catch (error) {
    console.error('[Reward announcement] Creation failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'The announcement could not be completed. Refresh to check delivery status.',
    });
  }
};

export const retryFailedRewardAnnouncement = async (req, res) => {
  try {
    const announcement = await RewardAnnouncement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    const failed = announcement.recipients.some(
      (recipient) => recipient.status === 'failed' && !recipient.deliveredAt
    );
    if (!failed) {
      return res.status(400).json({
        success: false,
        message: 'There are no failed recipient deliveries to retry.',
      });
    }

    await dispatchPendingRecipients(announcement);
    const updated = await RewardAnnouncement.findById(announcement._id).populate(
      'createdBy',
      'name'
    );
    return res.status(200).json({
      success: true,
      message: 'Failed recipient deliveries retried.',
      data: { announcement: publicAnnouncement(updated) },
    });
  } catch (error) {
    console.error('[Reward announcement] Retry failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed recipient deliveries could not be retried.',
    });
  }
};
