import { getComplaintCategoryLabel } from '../constants/complaintCategories.js';

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

const formatSubmissionDate = (date) =>
  `${new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(date))} UTC`;

export function buildComplaintSubmissionEmail(complaint) {
  const subject = 'CIVIFIX - Complaint Submitted Successfully';
  const category = getComplaintCategoryLabel(complaint.category);
  const location = complaint.location?.address?.trim();
  const details = [
    ['Complaint ID', complaint._id],
    ['Category', category],
    ['Title', complaint.title || 'Not provided'],
    ['Description', complaint.description],
    ['Submitted', formatSubmissionDate(complaint.createdAt)],
    ...(location ? [['Location', location]] : []),
    ['Status', complaint.status],
  ];

  const rows = details
    .map(
      ([label, value]) => `
        <tr>
          <th align="left" valign="top" style="padding:12px 14px;border-bottom:1px solid #e5e7eb;color:#475569;font-size:14px;width:34%;">${escapeHtml(label)}</th>
          <td valign="top" style="padding:12px 14px;border-bottom:1px solid #e5e7eb;color:#172033;font-size:14px;overflow-wrap:anywhere;">${escapeHtml(value)}</td>
        </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:24px 12px;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#172033;line-height:1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:28px 24px;background:#2563eb;color:#ffffff;text-align:center;">
          <div style="font-size:13px;font-weight:700;letter-spacing:2px;">CIVIFIX</div>
          <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;">CIVIFIX — Complaint Submission Confirmation</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 12px;">Dear Citizen,</p>
          <p style="margin:0 0 20px;">Your complaint has been successfully submitted to CIVIFIX.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;">
            <tbody>${rows}</tbody>
          </table>
          <p style="margin:22px 0 0;padding:16px;background:#eff6ff;border-left:4px solid #2563eb;border-radius:4px;">
            Your complaint has been received and is awaiting verification by the Municipal Officer. You will be able to track its progress through CIVIFIX.
          </p>
          <p style="margin:22px 0 0;">Thank you for helping us improve our community.</p>
          <p style="margin:8px 0 0;font-weight:700;">CIVIFIX Team</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html };
}
