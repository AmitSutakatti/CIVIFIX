import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRewardCeremonyEmail,
  REWARD_CEREMONY_SUBJECT,
} from '../templates/rewardCeremonyEmail.js';
import {
  getSixMonthPeriod,
  rankLeaderboardCitizens,
} from '../utils/rewardLeaderboard.js';

test('uses stable UTC half-year boundaries for the leaderboard period', () => {
  const firstHalf = getSixMonthPeriod(new Date('2026-06-30T23:59:59.000Z'));
  assert.equal(firstHalf.id, '2026-H1');
  assert.equal(firstHalf.startsAt.toISOString(), '2026-01-01T00:00:00.000Z');
  assert.equal(firstHalf.endsAt.toISOString(), '2026-07-01T00:00:00.000Z');

  const secondHalf = getSixMonthPeriod(new Date('2026-07-01T00:00:00.000Z'));
  assert.equal(secondHalf.id, '2026-H2');
  assert.equal(secondHalf.label, 'July 1 – December 31, 2026');
});

test('ranks eligible citizens by net points, verified complaints, then name and keeps five', () => {
  const citizens = rankLeaderboardCitizens([
    { citizenId: 'd', name: 'D', netPoints: 20, verifiedComplaints: 4 },
    { citizenId: 'b', name: 'B', netPoints: 15, verifiedComplaints: 3 },
    { citizenId: 'a', name: 'A', netPoints: 15, verifiedComplaints: 3 },
    { citizenId: 'c', name: 'C', netPoints: 15, verifiedComplaints: 2 },
    { citizenId: 'e', name: 'E', netPoints: 5, verifiedComplaints: 1 },
    { citizenId: 'f', name: 'F', netPoints: 0, verifiedComplaints: 0 },
    { citizenId: 'g', name: 'G', netPoints: -3, verifiedComplaints: 1 },
  ]);

  assert.deepEqual(
    citizens.map(({ citizenId, rank }) => [citizenId, rank]),
    [['d', 1], ['a', 2], ['b', 3], ['c', 4], ['e', 5]]
  );
});

test('builds a personalized branded email and escapes officer-provided HTML', () => {
  const { subject, html } = buildRewardCeremonyEmail({
    citizenName: '<Alex>',
    rank: 2,
    periodLabel: 'July 1 – December 31, 2026',
    netPoints: 17,
    verifiedComplaints: 4,
    eventName: 'Civic & Community Day',
    venueName: 'Town Hall',
    venueAddress: '1 Main Street',
    eventDate: '2026-12-10',
    eventTime: '15:30',
    message: 'Welcome <citizen> & thank you.',
  });

  assert.equal(subject, 'CIVIFIX — Congratulations! You Are a Top 5 Contributor');
  assert.equal(subject, REWARD_CEREMONY_SUBJECT);
  assert.match(html, /CIVIFIX/);
  assert.match(html, /Congratulations, &lt;Alex&gt;/);
  assert.match(html, /Rank:<\/strong> #2/);
  assert.match(html, /Net leaderboard points:<\/strong> 17/);
  assert.match(html, /Genuine complaints verified:<\/strong> 4/);
  assert.match(html, /Civic &amp; Community Day/);
  assert.match(html, /Welcome &lt;citizen&gt; &amp; thank you\./);
  assert.match(html, /invited to receive your reward and be honoured/);
});
