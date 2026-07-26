const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

let transporter;

const BRAND = {
  navy: '#2f4468',
  navyDeep: '#1e2f4a',
  navyDark: '#243652',
  gold: '#f5c518',
  goldHover: '#e0b400',
  text: '#1e1e1e',
  muted: '#64748b',
  body: '#334155',
  border: '#e5e7eb',
  canvas: '#f3f4f6',
  white: '#ffffff',
  soft: '#fafafa',
};

const createTransporter = () => {
  if (!transporter) {
    if (!config.email.user || !config.email.pass) {
      return null;
    }
    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: config.email.host || 'smtp.gmail.com',
      port: config.email.port || 587,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text, replyTo, attachments = [] }) => {
  try {
    const transport = createTransporter();
    if (!transport) {
      logger.warn(`Email not configured. Skipping send to ${to}: ${subject}`);
      return { skipped: true };
    }

    const info = await transport.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
      ...(attachments.length ? { attachments } : {}),
    });
    logger.info(`Email sent: ${info.messageId} to ${to}`);
    return info;
  } catch (error) {
    logger.error(`Email sending failed: ${error.message}`);
    return null;
  }
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const clientUrl = () => String(config.clientUrl || 'https://afriroar.com').replace(/\/$/, '');
const supportEmail = () => config.email.support || 'afriroar.support@gmail.com';
const year = () => new Date().getFullYear();

/** Full-width gold CTA — Omnisend-style single primary action */
const ctaButton = (href, label) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:100%;">
          <tr>
            <td align="center" class="ar-btn" bgcolor="${BRAND.gold}" style="background:${BRAND.gold};">
              <a href="${href}" target="_blank" class="ar-btn-label" style="display:block;padding:16px 24px;font-family:Helvetica,Arial,sans-serif;font-size:16px;font-weight:700;line-height:1.2;color:${BRAND.navyDeep};text-decoration:none;text-align:center;">
                ${label}
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

/** OTP / reset code — neutral card, no gold accent */
const codeBlock = (label, code) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
    <tr>
      <td class="ar-code" bgcolor="${BRAND.soft}" style="background:${BRAND.soft};border:1px solid ${BRAND.border};padding:28px 20px;text-align:center;">
        <div class="ar-code-label" style="font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${BRAND.muted};margin:0 0 14px;">
          ${label}
        </div>
        <div class="ar-code-value" style="font-family:Courier New,Courier,monospace;font-size:36px;font-weight:700;letter-spacing:0.24em;color:${BRAND.navyDeep};line-height:1.2;">
          ${escapeHtml(code)}
        </div>
      </td>
    </tr>
  </table>
`;

/**
 * OmniH-style shell: full-bleed (no floating card / outer canvas),
 * brand header, body, footer. Header colors fixed in light + dark.
 */
const wrapEmail = ({ preheader = '', title, bodyHtml }) => {
  const site = clientUrl();
  const safePreheader = escapeHtml(preheader);

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light dark; }
    @media only screen and (max-width: 620px) {
      .ar-pad { padding-left: 20px !important; padding-right: 20px !important; }
    }
    @media (prefers-color-scheme: dark) {
      /* Header stays navy + gold (same as light) */
      .ar-shell { background-color: #121212 !important; }
      .ar-body { background-color: #121212 !important; color: #ffffff !important; }
      .ar-footer { background-color: #0e0e0e !important; border-top-color: #2a2a2a !important; color: #a1a1aa !important; }
      .ar-footer a { color: #cbd5e1 !important; }
      .ar-heading { color: #ffffff !important; }
      .ar-text { color: #ffffff !important; }
      .ar-text-muted { color: #a1a1aa !important; }
      .ar-code { background-color: #1a1a1b !important; border-color: #2a2a2a !important; }
      .ar-code-label { color: #a1a1aa !important; }
      .ar-code-value { color: #ffffff !important; }
      .ar-panel { background-color: #1a1a1b !important; border-color: #2a2a2a !important; color: #e4e4e7 !important; }
      .ar-link { color: #f5c518 !important; }
    }
  </style>
  <!--[if mso]><style>table,td{font-family:Arial,Helvetica,sans-serif!important;}</style><![endif]-->
</head>
<body class="ar-shell" style="margin:0;padding:0;background:${BRAND.white};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;">
    ${safePreheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" class="ar-shell" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.white};">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${BRAND.white};">

          <!-- Brand header — full width, fixed navy + gold -->
          <tr>
            <td bgcolor="${BRAND.navyDeep}" style="background:${BRAND.navyDeep};padding:18px 24px;text-align:left;">
              <a href="${site}" target="_blank" style="text-decoration:none;">
                <span style="font-family:Helvetica,Arial,sans-serif;font-size:18px;font-weight:800;letter-spacing:0.04em;color:${BRAND.gold};line-height:1;">
                  AfriRoar
                </span>
              </a>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="ar-body ar-pad" bgcolor="${BRAND.white}" style="padding:32px 24px 28px;font-family:Helvetica,Arial,sans-serif;color:${BRAND.text};background:${BRAND.white};">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="ar-footer ar-pad" bgcolor="${BRAND.white}" style="padding:24px;border-top:1px solid ${BRAND.border};font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:${BRAND.muted};background:${BRAND.white};text-align:center;">
              <p style="margin:0 0 10px;">
                <a href="${site}/privacy" target="_blank" style="color:${BRAND.navy};text-decoration:underline;">Privacy Policy</a>
                &nbsp;|&nbsp;
                <a href="mailto:${supportEmail()}" style="color:${BRAND.navy};text-decoration:underline;">Contact Support</a>
              </p>
              <p style="margin:0;">
                <a href="mailto:${supportEmail()}" style="color:${BRAND.muted};text-decoration:underline;">${supportEmail()}</a>
              </p>
              <p style="margin:12px 0 0;">© ${year()} AfriRoar. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
};

const heading = (text) => `
  <h1 class="ar-heading" style="margin:0 0 16px;font-size:24px;font-weight:700;line-height:1.3;color:${BRAND.navyDeep};font-family:Helvetica,Arial,sans-serif;">
    ${text}
  </h1>
`;

const paragraph = (text, { muted = false, bottom = 16 } = {}) => `
  <p class="${muted ? 'ar-text-muted' : 'ar-text'}" style="margin:0 0 ${bottom}px;font-size:${muted ? '14' : '16'}px;line-height:1.7;color:${muted ? BRAND.muted : BRAND.body};font-family:Helvetica,Arial,sans-serif;">
    ${text}
  </p>
`;

const templates = {
  emailVerification: (userName, code) => {
    const name = escapeHtml(userName || 'there');
    const site = clientUrl();
    return {
      subject: 'Verify your AfriRoar email address',
      text: `Hi ${userName},\n\nYour AfriRoar verification code is ${code}. It expires in 15 minutes.\n\nVerify: ${site}/verify-email\n\nIf you did not create an account, ignore this email.`,
      html: wrapEmail({
        title: 'Verify your email',
        preheader: `Your verification code is ${code}. It expires in 15 minutes.`,
        bodyHtml: `
          ${heading('Verify your email')}
          ${paragraph(`Hi ${name},`)}
          ${paragraph(
            'Thanks for creating an AfriRoar account. Enter this code to confirm your email and activate your student workspace.',
          )}
          ${codeBlock('Verification code', code)}
          ${paragraph('This code expires in <strong>15 minutes</strong>. Do not share it with anyone.', {
            muted: true,
            bottom: 8,
          })}
          ${paragraph('After verification, you can sign in and start applying for scholarships.', {
            muted: true,
            bottom: 0,
          })}
          ${ctaButton(`${site}/verify-email`, 'Verify email')}
        `,
      }),
    };
  },

  applicationSubmitted: (userName, scholarshipTitle) => {
    const name = escapeHtml(userName || 'there');
    const title = escapeHtml(scholarshipTitle || 'your scholarship');
    const site = clientUrl();
    return {
      subject: `Application received — ${scholarshipTitle}`,
      text: `Hi ${userName},\n\nYour application for ${scholarshipTitle} was submitted successfully. We will notify you when the status changes.\n\nView: ${site}/dashboard/applications`,
      html: wrapEmail({
        title: 'Application submitted',
        preheader: `Your application for ${scholarshipTitle} was received.`,
        bodyHtml: `
          ${heading('Application submitted')}
          ${paragraph(`Hi ${name},`)}
          ${paragraph(
            `Your application for <strong>${title}</strong> was submitted successfully. We will email you when the status changes.`,
          )}
          ${paragraph('You can track progress anytime from your dashboard.', { muted: true, bottom: 0 })}
          ${ctaButton(`${site}/dashboard/applications`, 'View application')}
        `,
      }),
    };
  },

  applicationStatusUpdate: (userName, scholarshipTitle, status) => {
    const name = escapeHtml(userName || 'there');
    const title = escapeHtml(scholarshipTitle || 'your scholarship');
    const safeStatus = escapeHtml(String(status || '').replace(/_/g, ' '));
    const site = clientUrl();
    return {
      subject: `Application update — ${scholarshipTitle}`,
      text: `Hi ${userName},\n\nYour application for ${scholarshipTitle} is now ${status}.\n\nView: ${site}/dashboard/applications`,
      html: wrapEmail({
        title: 'Application update',
        preheader: `Your application for ${scholarshipTitle} is now ${status}.`,
        bodyHtml: `
          ${heading('Application update')}
          ${paragraph(`Hi ${name},`)}
          ${paragraph(
            `Your application for <strong>${title}</strong> is now <strong style="text-transform:capitalize;">${safeStatus}</strong>.`,
          )}
          ${paragraph('Open your dashboard for full details and next steps.', { muted: true, bottom: 0 })}
          ${ctaButton(`${site}/dashboard/applications`, 'View details')}
        `,
      }),
    };
  },

  welcome: (userName) => {
    const name = escapeHtml(userName || 'there');
    const site = clientUrl();
    return {
      subject: 'Welcome to AfriRoar',
      text: `Hi ${userName},\n\nYour email is verified and your AfriRoar student account is ready. Complete your profile and start applying for scholarships.\n\nDashboard: ${site}/dashboard`,
      html: wrapEmail({
        title: 'Welcome to AfriRoar',
        preheader: 'Your account is ready. Start exploring scholarships.',
        bodyHtml: `
          ${heading(`Welcome, ${name}`)}
          ${paragraph(
            'Your email is verified and your AfriRoar student account is ready. Complete your profile, then browse and apply for scholarships.',
          )}
          ${paragraph('Save drafts, upload documents, and track deadlines in one place.', {
            muted: true,
            bottom: 0,
          })}
          ${ctaButton(`${site}/dashboard`, 'Go to dashboard')}
        `,
      }),
    };
  },

  passwordReset: (userName, code) => {
    const name = escapeHtml(userName || 'there');
    const actionUrl = `${clientUrl()}/forgot-password`;
    return {
      subject: 'Password reset request',
      text: `Hi ${userName},\n\nWe received a request to reset the password for your account. Your reset code is ${code}. It expires in 15 minutes.\n\nReset: ${actionUrl}\n\nIf you did not request this, ignore this email.`,
      html: wrapEmail({
        title: 'Password reset request',
        preheader: `Your password reset code is ${code}. It expires in 15 minutes.`,
        bodyHtml: `
          ${heading('Password reset request')}
          ${paragraph(`Hi ${name},`)}
          ${paragraph(
            'We received a request to reset the password for your account. Enter the code below, then choose a new password.',
          )}
          ${paragraph('<strong>Please note:</strong> This request will expire in 15 minutes.')}
          ${codeBlock('Reset code', code)}
          ${ctaButton(actionUrl, 'Reset your password')}
          <p class="ar-text-muted" style="margin:24px 0 0;font-size:13px;line-height:1.6;color:${BRAND.muted};font-family:Helvetica,Arial,sans-serif;">
            If you&apos;re having trouble with the button above, copy and paste this URL into your browser:
          </p>
          <p style="margin:8px 0 0;font-size:13px;line-height:1.5;word-break:break-all;font-family:Helvetica,Arial,sans-serif;">
            <a class="ar-link" href="${actionUrl}" target="_blank" style="color:${BRAND.navy};text-decoration:underline;">${actionUrl}</a>
          </p>
        `,
      }),
    };
  },

  contactMessage: ({ name, email, topic, message }) => {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeTopic = escapeHtml(topic);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
    return {
      subject: `[AfriRoar Contact] ${topic}: ${name}`,
      text: `New contact message\n\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`,
      html: wrapEmail({
        title: 'New contact message',
        preheader: `${topic} from ${name}`,
        bodyHtml: `
          ${heading('New contact message')}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;font-size:14px;line-height:1.5;color:${BRAND.body};">
            <tr>
              <td style="padding:8px 0;width:72px;color:${BRAND.muted};vertical-align:top;">Name</td>
              <td style="padding:8px 0;font-weight:600;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:${BRAND.muted};vertical-align:top;">Email</td>
              <td style="padding:8px 0;"><a href="mailto:${safeEmail}" style="color:${BRAND.navy};text-decoration:underline;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:${BRAND.muted};vertical-align:top;">Topic</td>
              <td style="padding:8px 0;">${safeTopic}</td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td class="ar-panel" style="padding:16px;background:${BRAND.soft};border:1px solid ${BRAND.border};font-size:15px;line-height:1.65;color:${BRAND.body};">
                ${safeMessage}
              </td>
            </tr>
          </table>
          ${paragraph('Reply directly to this email to respond to the sender.', {
            muted: true,
            bottom: 0,
          })}
        `,
      }),
    };
  },

  contactAcknowledgement: (name) => {
    const safeName = escapeHtml(name || 'there');
    return {
      subject: 'We received your message | AfriRoar',
      text: `Hi ${name},\n\nThanks for contacting AfriRoar. We received your message and aim to reply within 2-3 business days.\n\nFor listing deadlines and eligibility, always verify the official programme page.\n\nAfriRoar Support`,
      html: wrapEmail({
        title: 'Message received',
        preheader: 'We got your message and will reply within 2–3 business days.',
        bodyHtml: `
          ${heading('Message received')}
          ${paragraph(`Hi ${safeName},`)}
          ${paragraph(
            'Thanks for contacting AfriRoar. We received your message and aim to reply within <strong>2–3 business days</strong>.',
          )}
          ${paragraph(
            'For scholarship deadlines and eligibility, always verify details on the official programme website.',
            { muted: true, bottom: 0 },
          )}
        `,
      }),
    };
  },
};

module.exports = { sendEmail, templates, escapeHtml };
