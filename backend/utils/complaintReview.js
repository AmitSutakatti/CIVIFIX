import Complaint from '../models/Complaint.js';

export const REVIEW_CONFIG = {
  duplicateRadiusMeters: 50,
  highVolumeHours: 24,
  highVolumeThreshold: 5,
  demeritsPerFake: 3,
  fakeComplaintBlockThreshold: 3,
  blockDays: 7,
  registrationBonusPoints: 20,
  fakeRewardPenalty: 3,
  verifiedComplaintReward: 5,
};

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isCitizenBlocked(user) {
  if (!user || user.role !== 'user') return false;
  if (!user.blockedUntil) return false;
  return new Date(user.blockedUntil) > new Date();
}

export function citizenBlockPayload(user) {
  const until = user.blockedUntil ? new Date(user.blockedUntil) : null;
  return {
    success: false,
    code: 'ACCOUNT_BLOCKED',
    message: until
      ? `Your account is frozen until ${until.toLocaleString()} because of 3 confirmed fake complaints.`
      : 'Your account is frozen because of 3 confirmed fake complaints.',
    blockedUntil: user.blockedUntil,
    demeritPoints: user.demeritPoints || 0,
  };
}

export async function clearExpiredCitizenBlock(user) {
  if (!user || user.role !== 'user') return user;
  if (user.blockedUntil && new Date(user.blockedUntil) <= new Date()) {
    user.blockedUntil = undefined;
    user.isActive = true;
    await user.save();
  }
  return user;
}

export async function computeReviewSignals({
  userId,
  category,
  latitude,
  longitude,
  excludeId,
  includeCurrentInVolume = false,
}) {
  const flags = [];
  const nearbySummaries = [];

  if (latitude != null && longitude != null && category) {
    try {
      const nearby = await Complaint.find({
        ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        category,
        isFake: { $ne: true },
        closedReason: { $ne: 'duplicate' },
        status: { $nin: ['Closed'] },
        geoLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: REVIEW_CONFIG.duplicateRadiusMeters,
          },
        },
      })
        .select('category status location description createdAt user')
        .limit(8);

      nearby.forEach((item) => {
        const meters = Math.round(
          haversineKm(
            parseFloat(latitude),
            parseFloat(longitude),
            item.location.latitude,
            item.location.longitude
          ) * 1000
        );
        nearbySummaries.push({
          _id: item._id,
          category: item.category,
          status: item.status,
          address: item.location?.address,
          distanceMeters: meters,
          createdAt: item.createdAt,
        });
      });

      if (nearbySummaries.length > 0) {
        const closest = nearbySummaries[0];
        flags.push({
          type: 'possible_duplicate',
          message: `Similar ${category} complaint found ${closest.distanceMeters}m away and is still unresolved.`,
          relatedComplaint: closest._id,
          distanceMeters: closest.distanceMeters,
        });
      }
    } catch (err) {
      console.warn('Nearby complaint lookup failed:', err.message);
    }
  }

  const since = new Date(Date.now() - REVIEW_CONFIG.highVolumeHours * 60 * 60 * 1000);
  let recentCount = await Complaint.countDocuments({
    user: userId,
    createdAt: { $gte: since },
  });
  if (includeCurrentInVolume) {
    recentCount += 1;
  }

  if (recentCount >= REVIEW_CONFIG.highVolumeThreshold) {
    flags.push({
      type: 'high_volume',
      message: `Reporter submitted ${recentCount} complaints in the last ${REVIEW_CONFIG.highVolumeHours} hours.`,
    });
  }

  return {
    flags,
    requiresReview: flags.length > 0,
    nearbySummaries,
    recentCount,
  };
}

export async function persistReviewFlagsOnNearby(nearbySummaries) {
  const ids = nearbySummaries.map((n) => n._id);
  if (!ids.length) return;
  await Complaint.updateMany(
    {
      _id: { $in: ids },
      status: { $in: ['Submitted', 'Field-verification'] },
    },
    { $set: { requiresReview: true } }
  );
}

export async function applyFakePenalty(user) {
  user.demeritPoints = (user.demeritPoints || 0) + REVIEW_CONFIG.demeritsPerFake;
  user.fakeComplaintCount = (user.fakeComplaintCount || 0) + 1;

  const beforePoints = user.rewardPoints || 0;
  const deducted = Math.min(beforePoints, REVIEW_CONFIG.fakeRewardPenalty);
  user.rewardPoints = beforePoints - deducted;

  let blocked = false;
  if (user.fakeComplaintCount >= REVIEW_CONFIG.fakeComplaintBlockThreshold) {
    const until = new Date();
    until.setDate(until.getDate() + REVIEW_CONFIG.blockDays);
    user.blockedUntil = until;
    user.isActive = false;
    blocked = true;
  }

  await user.save();

  return {
    demeritPoints: user.demeritPoints,
    fakeComplaintCount: user.fakeComplaintCount,
    blockedUntil: user.blockedUntil || null,
    blocked,
    rewardPoints: user.rewardPoints,
    rewardPointsDeducted: deducted,
  };
}

export async function awardVerifiedComplaintReward(user) {
  user.rewardPoints = (user.rewardPoints || 0) + REVIEW_CONFIG.verifiedComplaintReward;
  await user.save();
  return {
    rewardPoints: user.rewardPoints,
    rewardPointsAwarded: REVIEW_CONFIG.verifiedComplaintReward,
  };
}

export async function getReporterStats(userId) {
  const [totalComplaints, fakeComplaints] = await Promise.all([
    Complaint.countDocuments({ user: userId }),
    Complaint.countDocuments({ user: userId, isFake: true }),
  ]);
  return { totalComplaints, fakeComplaints };
}
