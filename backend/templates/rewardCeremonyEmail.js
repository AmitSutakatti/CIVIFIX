const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const REWARD_CEREMONY_SUBJECT =
  'CIVIFIX — Congratulations! You Are a Top 5 Contributor';

export function buildRewardCeremonyEmail({
  citizenName,
  rank,
  periodLabel,
  netPoints,
  verifiedComplaints,
  eventName,
  venueName,
  venueAddress,
  eventDate,
  eventTime,
  message,
}) {
  const details = {
    citizenName,
    periodLabel,
    eventName,
    venueName,
    venueAddress,
    eventDate,
    eventTime,
    message,
  };
  const safe = Object.fromEntries(
    Object.entries(details).map(([key, value]) => [key, escapeHtml(value)])
  );
  const announcement = safe.message.replace(/\r?\n/g, '<br>');

  return {
    subject: REWARD_CEREMONY_SUBJECT,
    html: `<!doctype html>
<html><body style="margin:0;background:#f3f4f6;font-family:Arial,sans-serif;color:#1f2937;line-height:1.6">
  <div style="max-width:640px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden">
    <header style="padding:24px;background:#1d4ed8;color:#fff;text-align:center">
      <div style="font-size:26px;font-weight:700;letter-spacing:2px">CIVIFIX</div>
      <h1 style="margin:8px 0 0;font-size:22px">Congratulations, ${safe.citizenName}!</h1>
    </header>
    <main style="padding:28px">
      <p>You are invited to receive your reward and be honoured for your contribution to CIVIFIX.</p>
      <h2 style="font-size:18px">Your leaderboard achievement</h2>
      <p><strong>Rank:</strong> #${Number(rank)}<br>
      <strong>Six-month period:</strong> ${safe.periodLabel}<br>
      <strong>Net leaderboard points:</strong> ${Number(netPoints)}<br>
      <strong>Genuine complaints verified:</strong> ${Number(verifiedComplaints)}</p>
      <h2 style="font-size:18px">Reward ceremony</h2>
      <p><strong>Event:</strong> ${safe.eventName}<br>
      <strong>Venue:</strong> ${safe.venueName}<br>
      <strong>Complete address:</strong> ${safe.venueAddress}<br>
      <strong>Date:</strong> ${safe.eventDate}<br>
      <strong>Time:</strong> ${safe.eventTime}</p>
      <h2 style="font-size:18px">A message from the Municipal Officer</h2>
      <p>${announcement}</p>
      <p>Thank you for helping make your community better. We look forward to honouring your contribution.</p>
    </main>
    <footer style="padding:16px;background:#f9fafb;text-align:center;color:#6b7280;font-size:12px">CIVIFIX — Building better communities together</footer>
  </div>
</body></html>`,
  };
}
