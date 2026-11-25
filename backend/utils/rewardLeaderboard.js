import Complaint from '../models/Complaint.js';
import { REVIEW_CONFIG } from './complaintReview.js';

export function getSixMonthPeriod(now = new Date()) {
  const year = now.getUTCFullYear();
  const half = now.getUTCMonth() < 6 ? 1 : 2;
  const startMonth = half === 1 ? 0 : 6;
  const startsAt = new Date(Date.UTC(year, startMonth, 1));
  const endsAt = new Date(Date.UTC(year, startMonth + 6, 1));

  return {
    id: `${year}-H${half}`,
    label: `${startsAt.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} 1 – ${new Date(endsAt.getTime() - 1).toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })} ${new Date(endsAt.getTime() - 1).getUTCDate()}, ${year}`,
    startsAt,
    endsAt,
  };
}

export function rankLeaderboardCitizens(citizens) {
  return [...citizens]
    .filter((citizen) => citizen.verifiedComplaints > 0)
    .sort(
      (a, b) =>
        b.netPoints - a.netPoints ||
        b.verifiedComplaints - a.verifiedComplaints ||
        a.name.localeCompare(b.name)
    )
    .slice(0, 5)
    .map((citizen, index) => ({ ...citizen, rank: index + 1 }));
}

export async function getCurrentRewardLeaderboard(now = new Date()) {
  const period = getSixMonthPeriod(now);
  const [verifiedComplaints, fakeComplaints] = await Promise.all([
    Complaint.find({
      isFake: { $ne: true },
      verificationRewardAwarded: true,
      statusHistory: {
        $elemMatch: {
          status: 'Verified',
          updatedAt: { $gte: period.startsAt, $lt: period.endsAt },
        },
      },
    })
      .select('user statusHistory')
      .populate('user', 'name role')
      .lean(),
    Complaint.find({
      isFake: true,
      markedFakeAt: { $gte: period.startsAt, $lt: period.endsAt },
    })
      .select('user fakeRewardPointsDeducted')
      .lean(),
  ]);

  const totals = new Map();
  for (const complaint of verifiedComplaints) {
    const user = complaint.user;
    if (!user || user.role !== 'user') continue;
    const hasPeriodVerification = complaint.statusHistory.some(
      (entry) =>
        entry.status === 'Verified' &&
        entry.updatedAt >= period.startsAt &&
        entry.updatedAt < period.endsAt
    );
    if (!hasPeriodVerification) continue;

    const key = user._id.toString();
    const current = totals.get(key) || {
      citizenId: key,
      name: user.name,
      verifiedComplaints: 0,
      pointsEarned: 0,
      pointsDeducted: 0,
      deductionsAvailable: true,
      netPoints: 0,
    };
    current.verifiedComplaints += 1;
    current.pointsEarned += REVIEW_CONFIG.verifiedComplaintReward;
    current.netPoints = current.pointsEarned - current.pointsDeducted;
    totals.set(key, current);
  }

  for (const complaint of fakeComplaints) {
    const key = complaint.user?.toString();
    const current = totals.get(key);
    if (current) {
      if (Number.isFinite(complaint.fakeRewardPointsDeducted)) {
        current.pointsDeducted += complaint.fakeRewardPointsDeducted;
      } else {
        current.deductionsAvailable = false;
      }
      current.netPoints = current.pointsEarned - current.pointsDeducted;
    }
  }

  const citizens = rankLeaderboardCitizens([...totals.values()]).map((citizen) => ({
    ...citizen,
    pointsDeducted: citizen.deductionsAvailable ? citizen.pointsDeducted : null,
    deductionsAvailable: undefined,
  }));

  return {
    period: {
      id: period.id,
      label: period.label,
      startsAt: period.startsAt,
      endsAt: period.endsAt,
    },
    leaderboard: citizens,
    periodDetails: period,
  };
}
