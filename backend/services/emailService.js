import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildComplaintSubmissionEmail } from '../templates/complaintSubmissionEmail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SMTP_HOST = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true' || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER?.trim();
const SMTP_PASS = process.env.SMTP_PASS?.trim();
const SMTP_FROM = process.env.SMTP_FROM?.trim() || SMTP_USER;

const TEAM_LOGO_PATH = [
  path.join(__dirname, '../assets/civifixteamlogo.png'),
  path.join(__dirname, '../../assets/civifixteamlogo.png'),
].find((p) => fs.existsSync(p));

const TEAM_LOGO_CID = 'civifix-logo';
const TEAM_LOGO_HTML = TEAM_LOGO_PATH
  ? `<img src="cid:${TEAM_LOGO_CID}" alt="CivicFix" style="max-height:72px;width:auto;display:block;margin:0 auto 8px;background:#fff;padding:8px;border-radius:8px;" />`
  : `<div style="font-size:24px;font-weight:bold;">CIVICFIX</div>`;

const isSmtpConfigured = Boolean(SMTP_USER && SMTP_PASS);

const htmlToText = (html) =>
  String(html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isTlsCertError = (error) => {
  const code = error?.code || '';
  const message = error?.message || '';
  return (
    code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
    code === 'CERT_UNTRUSTED' ||
    code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY' ||
    message.includes('unable to verify the first certificate') ||
    message.includes('self-signed certificate')
  );
};

const createTransporter = (relaxTls = false) =>
  nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: !relaxTls,
    },
  });

const sendViaNodemailer = async (to, subject, htmlBody) => {
  console.log('[Email] Sending via Nodemailer SMTP');

  const mail = {
    from: SMTP_FROM,
    to,
    subject,
    html: htmlBody,
    text: htmlToText(htmlBody),
    attachments: TEAM_LOGO_PATH
      ? [
          {
            filename: 'civifixteamlogo.png',
            path: TEAM_LOGO_PATH,
            cid: TEAM_LOGO_CID,
          },
        ]
      : [],
  };

  try {
    const info = await createTransporter(false).sendMail(mail);
    return {
      success: true,
      messageId: info.messageId,
      provider: 'nodemailer',
    };
  } catch (error) {
    if (!isTlsCertError(error)) {
      throw error;
    }

    console.warn(
      '[Email] SMTP TLS certificate could not be verified (often Windows antivirus HTTPS scanning). Retrying with relaxed TLS for this send only.'
    );
    const info = await createTransporter(true).sendMail(mail);
    return {
      success: true,
      messageId: info.messageId,
      provider: 'nodemailer',
    };
  }
};

/**
 * Send an email notification through Nodemailer SMTP.
 */
export const sendEmail = async (to, subject, htmlBody) => {
  console.log('[Email] Attempting to send email');

  if (!to) {
    console.warn('[Email] Missing recipient email address');
    return { success: false, error: 'Missing email address' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    console.warn('[Email] Invalid recipient email format');
    return { success: false, error: 'Invalid email format' };
  }

  if (!isSmtpConfigured) {
    console.warn('[Email] SMTP is not configured; email not sent');
    return { success: false, error: 'SMTP not configured', provider: 'nodemailer' };
  }

  try {
    const result = await sendViaNodemailer(to, subject, htmlBody);
    console.log(`[Email] Sent via Nodemailer: ${result.messageId}`);
    return result;
  } catch (error) {
    const code = typeof error?.code === 'string' ? error.code : 'unknown';
    const syscall = typeof error?.syscall === 'string' ? `, syscall: ${error.syscall}` : '';
    console.error(
      `[Email] Nodemailer SMTP delivery failed (code: ${code}${syscall})`
    );

    return {
      success: false,
      error: 'SMTP delivery failed',
      provider: 'nodemailer',
    };
  }
};

export const sendComplaintSubmissionEmail = async (to, complaint) => {
  const { subject, html } = buildComplaintSubmissionEmail(complaint);
  return sendEmail(to, subject, html);
};

export const sendComplaintVerificationEmail = async (to, complaintData) => {
  const {
    userName = 'Citizen',
    category = 'Complaint',
    complaintId = '',
    municipalOfficeName = 'Municipal Office',
    municipalOfficePhone = '',
    priority = 'medium',
    resolutionTime = '2-4 working days',
    rewardPointsAwarded = 0,
  } = complaintData;

  const subject = `🏛️ CIVICFIX - Your ${category} Complaint Has Been Verified`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border: 1px solid #e5e7eb;
        }
        .status-badge {
          display: inline-block;
          background-color: #10b981;
          color: white;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          margin: 10px 0;
        }
        .complaint-id {
          background-color: #f3f4f6;
          padding: 10px;
          border-radius: 5px;
          margin: 15px 0;
          font-family: monospace;
        }
        .steps {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .steps ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 12px;
          border-top: 1px solid #e5e7eb;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${TEAM_LOGO_HTML}
        <div class="logo">CIVICFIX</div>
      </div>
      
      <div class="content">
        <h2>Dear ${userName},</h2>
        
        <p>Your <strong>${category}</strong> complaint has been <strong>VERIFIED</strong> by ${municipalOfficeName}.</p>
        
        <div class="status-badge">✅ Status: Verified</div>
        
        <div class="complaint-id">
          <strong>📋 Complaint ID:</strong> ${complaintId}
        </div>

        ${
          rewardPointsAwarded > 0
            ? `<p style="background:#fef3c7;padding:12px;border-radius:5px;"><strong>${rewardPointsAwarded} CivicFix reward points have been added to your account.</strong></p>`
            : ''
        }
        
        <div class="steps">
          <h3>📝 Next Steps:</h3>
          <ul>
            <li>Your complaint is now under review</li>
            <li>A contractor will be assigned shortly</li>
            <li>You will receive updates on the progress</li>
            <li><strong>Expected resolution within ${resolutionTime}</strong></li>
          </ul>
        </div>
        
        <div style="background-color: ${priority === 'high' ? '#fee2e2' : priority === 'medium' ? '#fef3c7' : '#d1fae5'}; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid ${priority === 'high' ? '#dc2626' : priority === 'medium' ? '#f59e0b' : '#10b981'};">
          <strong>Priority Level:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${priority === 'high' ? '#dc2626' : priority === 'medium' ? '#f59e0b' : '#059669'};">${priority}</span>
        </div>
        
        <p>Thank you for helping us serve you better!</p>
        
        <p>
          <strong>- ${municipalOfficeName}</strong><br>
          ${municipalOfficePhone ? `📞 ${municipalOfficePhone}` : ''}
        </p>
      </div>
      
      <div class="footer">
        <p>This is an automated email from CivicFix - Public Issue Reporting System</p>
        <p>Please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail(to, subject, htmlBody);
};

const wrapHtml = (title, inner) => `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
      ${TEAM_LOGO_HTML}
      <p style="margin: 8px 0 0;">${title}</p>
    </div>
    <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
      ${inner}
    </div>
    <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
      This is an automated email from CivicFix. Please do not reply.
    </div>
  </body>
  </html>
`;

export const sendFakeComplaintEmail = async (to, data = {}) => {
  const {
    userName = 'Citizen',
    category = 'complaint',
    complaintId = '',
    reasonLabel = 'Confirmed fake',
    remarks = '',
    pointsDeducted = 0,
    pointsBalance = 0,
    demeritPoints = 0,
    fakeComplaintCount = 0,
    blocked = false,
    blockedUntil = null,
  } = data;

  const subject = 'CIVICFIX - Your complaint was marked as fake';
  const htmlBody = wrapHtml(
    'Complaint marked as fake',
    `
      <h2>Dear ${userName},</h2>
      <p>A municipal officer reviewed your <strong>${category}</strong> complaint
      ${complaintId ? `(ID: ${complaintId})` : ''} and marked it as <strong>fake</strong>.</p>
      <p><strong>Reason:</strong> ${reasonLabel}</p>
      ${remarks ? `<p><strong>Officer remarks:</strong> ${remarks}</p>` : ''}
      <div style="background:#fee2e2;border-left:4px solid #dc2626;padding:16px;border-radius:6px;margin:20px 0;">
        <p style="margin:0;"><strong>CivicFix reward points deducted:</strong> ${pointsDeducted}</p>
        <p style="margin:8px 0 0;"><strong>Current CivicFix points:</strong> ${pointsBalance}</p>
        <p style="margin:8px 0 0;"><strong>Demerit points:</strong> ${demeritPoints}</p>
        <p style="margin:8px 0 0;"><strong>Confirmed fake complaints:</strong> ${fakeComplaintCount}</p>
      </div>
      ${
        blocked
          ? `<p>Your account is temporarily blocked until ${
              blockedUntil ? new Date(blockedUntil).toLocaleString() : 'further notice'
            } because of repeated confirmed fake reports.</p>`
          : '<p>Repeated confirmed fake reports can temporarily block your account.</p>'
      }
      <p>If you believe this was a mistake, contact your municipal office.</p>
    `
  );

  return sendEmail(to, subject, htmlBody);
};

export const sendContractorAssignmentEmail = async (to, data = {}) => {
  const {
    contractorName = 'Contractor',
    category = 'civic issue',
    complaintId = '',
    address = '',
    deadline = null,
    municipalOfficeName = 'Municipal Office',
    portalUrl = process.env.CONTRACTOR_FRONTEND_URL || 'http://localhost:5174',
  } = data;

  const subject = 'CIVICFIX - New work has been assigned to you';
  const htmlBody = wrapHtml(
    'New work assigned',
    `
      <h2>Dear ${contractorName},</h2>
      <p>${municipalOfficeName} has assigned you a new <strong>${category}</strong> job.</p>
      ${complaintId ? `<p><strong>Complaint ID:</strong> ${complaintId}</p>` : ''}
      ${address ? `<p><strong>Location:</strong> ${address}</p>` : ''}
      ${
        deadline
          ? `<p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>`
          : ''
      }
      <p>Please log in to the contractor portal to view details, submit a quotation if needed, and start work.</p>
      <p><a href="${portalUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Open contractor portal</a></p>
    `
  );

  return sendEmail(to, subject, htmlBody);
};

export const sendContractorPortalReadyEmail = async (to, data = {}) => {
  const {
    contractorName = 'Contractor',
    companyName = '',
    appointmentAt = null,
    appointmentNotes = '',
    portalUrl = process.env.CONTRACTOR_FRONTEND_URL || 'http://localhost:5174',
  } = data;

  const subject = 'CIVICFIX - Your contractor account is approved — you can log in';
  const htmlBody = wrapHtml(
    'You can enter the contractor portal',
    `
      <h2>Dear ${contractorName},</h2>
      <p>A municipal officer has accepted your contractor application
      ${companyName ? `for <strong>${companyName}</strong>` : ''}.</p>
      <p>Your account is now <strong>active</strong>. You can log in to the CivicFix contractor portal and start receiving work.</p>
      ${
        appointmentAt
          ? `<p><strong>In-person appointment:</strong> ${new Date(appointmentAt).toLocaleString()}</p>`
          : ''
      }
      ${appointmentNotes ? `<p><strong>Notes:</strong> ${appointmentNotes}</p>` : ''}
      <p><a href="${portalUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Open contractor portal</a></p>
      <p>Use the email and password you registered with.</p>
    `
  );

  return sendEmail(to, subject, htmlBody);
};

export default sendEmail;
