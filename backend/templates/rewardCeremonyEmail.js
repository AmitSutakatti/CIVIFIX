const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const isAvailableNumber = (value) =>
  value !== undefined && value !== null && Number.isFinite(Number(value));

export const REWARD_CEREMONY_SUBJECT =
  'CIVIFIX — Congratulations! You Are a Top 5 Contributor';

export function buildRewardCeremonyEmail({
  citizenName,
  rank,
  periodLabel,
  netPoints,
  verifiedComplaints,
  pointsEarned,
  pointsDeducted,
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
  const announcement = safe.message.replace(/\r?\n/g, '<br />');
  const numericMetrics = [
    isAvailableNumber(pointsEarned)
      ? `<tr><td style="padding:8px 0;color:#d9e2f2">Points earned</td><td align="right" style="padding:8px 0;color:#fff;font-weight:bold">${Number(pointsEarned)}</td></tr>`
      : '',
    isAvailableNumber(pointsDeducted)
      ? `<tr><td style="padding:8px 0;color:#d9e2f2">Points deducted</td><td align="right" style="padding:8px 0;color:#fff;font-weight:bold">${Number(pointsDeducted)}</td></tr>`
      : '',
  ].join('');
  const plainTextMetrics = [
    isAvailableNumber(pointsEarned) ? `Points earned: ${Number(pointsEarned)}` : '',
    isAvailableNumber(pointsDeducted) ? `Points deducted: ${Number(pointsDeducted)}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const text = `CIVIFIX — OFFICIAL CONTRIBUTOR HONOUR

YOU DID IT!
TOP 5 CIVIFIX CONTRIBUTOR

Congratulations, ${citizenName}!

Your contribution has made a real difference! Every genuine complaint you raised helped improve your community. Your dedication and active participation have earned you a place among CIVIFIX's Top 5 Contributors. This achievement belongs to you. Congratulations!

YOUR ACHIEVEMENT
Leaderboard rank: #${Number(rank)}
Six-month leaderboard period: ${periodLabel}
Net CIVIFIX points: ${Number(netPoints)}
Genuine, verified complaints: ${Number(verifiedComplaints)}
${plainTextMetrics ? `${plainTextMetrics}\n` : ''}
REWARD CEREMONY INVITATION
Event: ${eventName}
Venue: ${venueName}
Complete address: ${venueAddress}
Date: ${eventDate}
Time: ${eventTime}

A MESSAGE FROM YOUR MUNICIPAL OFFICER
${message}

You are invited to receive your reward and be honoured for your contribution. We look forward to celebrating your achievement.

CIVIFIX — Building better communities together`;

  return {
    subject: REWARD_CEREMONY_SUBJECT,
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${REWARD_CEREMONY_SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background-color:#07152b;color:#17233a;font-family:Arial,Helvetica,sans-serif">
  <div style="display:none;font-size:1px;color:#07152b;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">A CIVIFIX Top 5 achievement and official reward ceremony invitation.</div>
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#07152b" style="width:100%;background-color:#07152b">
    <tr>
      <td align="center" style="padding:24px 12px">
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="width:100%;max-width:640px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,.32)">
          <tr>
            <td align="center" bgcolor="#102543" style="padding:26px 22px 30px;background-color:#102543;border-bottom:4px solid #d6b45e">
              <p style="margin:0 0 8px;color:#f0d98f;font-family:Georgia,'Times New Roman',serif;font-size:15px;letter-spacing:4px">✦ &nbsp; CIVIFIX &nbsp; ✦</p>
              <p style="margin:0;color:#d8e1ef;font-size:10px;font-weight:bold;letter-spacing:2px">OFFICIAL CONTRIBUTOR HONOUR</p>
              <p style="margin:20px 0 2px;color:#f6e8b8;font-size:38px;line-height:1" role="img" aria-label="Trophy">🏆</p>
              <p style="margin:12px 0 0;color:#f2d77f;font-family:Georgia,'Times New Roman',serif;font-size:31px;font-weight:bold;line-height:1.15">YOU DID IT!</p>
              <p style="margin:10px 0 0;color:#ffffff;font-size:16px;font-weight:bold;letter-spacing:1.5px;line-height:1.4">TOP 5 CIVIFIX CONTRIBUTOR</p>
              <p style="margin:14px 0 0;color:#f0d98f;font-size:13px">★ &nbsp; A community achievement worth celebrating &nbsp; ★</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 8px">
              <p style="margin:0;color:#17233a;font-size:19px;font-weight:bold">Congratulations, ${safe.citizenName}!</p>
              <p style="margin:12px 0 0;color:#46536a;font-size:15px;line-height:1.7">Your contribution has made a real difference! Every genuine complaint you raised helped improve your community. Your dedication and active participation have earned you a place among CIVIFIX's Top 5 Contributors. This achievement belongs to you. Congratulations!</p>
              <p style="margin:24px 0 10px;color:#102543;font-size:12px;font-weight:bold;letter-spacing:1.5px">YOUR ACHIEVEMENT</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 22px">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#102543" style="width:100%;background-color:#102543;border:1px solid #d6b45e;border-radius:12px">
                <tr>
                  <td style="padding:16px 18px 4px;color:#f0d98f;font-size:11px;font-weight:bold;letter-spacing:1.5px">SIX-MONTH LEADERBOARD HONOURS</td>
                  <td align="right" style="padding:12px 18px 0;color:#f0d98f;font-size:12px">🏆</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:0 18px 12px">
                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.45">
                      <tr><td style="padding:8px 0;color:#d9e2f2">Leaderboard rank</td><td align="right" style="padding:8px 0;color:#f2d77f;font-size:20px;font-weight:bold">#${Number(rank)}</td></tr>
                      <tr><td style="padding:8px 0;color:#d9e2f2">Six-month period</td><td align="right" style="padding:8px 0;color:#fff;font-weight:bold">${safe.periodLabel}</td></tr>
                      <tr><td style="padding:8px 0;color:#d9e2f2">Net CIVIFIX points</td><td align="right" style="padding:8px 0;color:#fff;font-weight:bold">${Number(netPoints)}</td></tr>
                      <tr><td style="padding:8px 0;color:#d9e2f2">Genuine complaints verified</td><td align="right" style="padding:8px 0;color:#fff;font-weight:bold">${Number(verifiedComplaints)}</td></tr>
                      ${numericMetrics}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f7eed1" style="width:100%;background-color:#f7eed1;border:1px solid #d6b45e;border-radius:14px">
                <tr>
                  <td style="padding:20px 20px 6px">
                    <p style="margin:0;color:#765a18;font-size:11px;font-weight:bold;letter-spacing:1.5px">YOU ARE OFFICIALLY INVITED</p>
                    <p style="margin:6px 0 0;color:#102543;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:bold;line-height:1.35">${safe.eventName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 20px 18px">
                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.55">
                      <tr><td valign="top" width="105" style="width:105px;padding:7px 10px 7px 0;color:#765a18;font-weight:bold">Venue</td><td style="padding:7px 0;color:#17233a">${safe.venueName}</td></tr>
                      <tr><td valign="top" width="105" style="width:105px;padding:7px 10px 7px 0;color:#765a18;font-weight:bold">Address</td><td style="padding:7px 0;color:#17233a">${safe.venueAddress}</td></tr>
                      <tr><td valign="top" width="105" style="width:105px;padding:7px 10px 7px 0;color:#765a18;font-weight:bold">Date</td><td style="padding:7px 0;color:#17233a">${safe.eventDate}</td></tr>
                      <tr><td valign="top" width="105" style="width:105px;padding:7px 10px 7px 0;color:#765a18;font-weight:bold">Time</td><td style="padding:7px 0;color:#17233a">${safe.eventTime}</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 24px 0">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="width:100%;border-left:3px solid #d6b45e">
                <tr><td style="padding:4px 0 4px 14px;color:#102543;font-size:12px;font-weight:bold;letter-spacing:1px">A MESSAGE FROM YOUR MUNICIPAL OFFICER</td></tr>
                <tr><td style="padding:4px 0 4px 14px;color:#46536a;font-size:14px;line-height:1.7">${announcement}</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 24px 26px">
              <p style="margin:0;color:#46536a;font-size:14px;line-height:1.7">You are invited to receive your reward and be honoured for your contribution. We look forward to celebrating your achievement.</p>
              <p style="margin:20px 0 0;color:#102543;font-size:14px;font-weight:bold">With appreciation,<br />CIVIFIX Municipal Team</p>
            </td>
          </tr>
          <tr>
            <td align="center" bgcolor="#102543" style="padding:18px 20px;background-color:#102543">
              <p style="margin:0;color:#f0d98f;font-size:14px;font-weight:bold;letter-spacing:2px">CIVIFIX</p>
              <p style="margin:6px 0 0;color:#d9e2f2;font-size:11px;line-height:1.5">Building better communities together</p>
              <p style="margin:8px 0 0;color:#f0d98f;font-size:12px">✦ &nbsp; Your effort matters &nbsp; ✦</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text,
  };
}
