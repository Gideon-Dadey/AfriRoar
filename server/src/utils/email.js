const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

let transporter;

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

const sendEmail = async ({ to, subject, html, text, replyTo }) => {
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
const logoUrl = () => `${clientUrl()}/sr/logo.png`;
const supportEmail = () => config.email.support || 'afriroar.support@gmail.com';
const year = () => new Date().getFullYear();

/** Primary CTA — navy, high contrast, email-safe */
const ctaButton = (href, label) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
    <tr>
      <td align="left" bgcolor="#2f4468" style="border-radius:4px;">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;line-height:1;color:#ffffff;text-decoration:none;border-radius:4px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>
`;

/** Large mono code block for OTP / reset codes */
const codeBlock = (label, code) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr>
      <td align="center" style="background:#f8fafc;border:1px solid #e2e8f0;padding:22px 16px;">
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#64748b;margin:0 0 10px;">
          ${label}
        </div>
        <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:0.32em;color:#1e2f4a;line-height:1.2;">
          ${escapeHtml(code)}
        </div>
      </td>
    </tr>
  </table>
`;

/**
 * Shared shell: logo-only header (no text wordmark), clean body, quiet footer.
 * Table-based for Outlook / Gmail compatibility.
 */
const wrapEmail = ({ preheader = '', title, bodyHtml }) => {
  const logo = logoUrl();
  const site = clientUrl();
  const safePreheader = escapeHtml(preheader);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]><style>table,td{font-family:Arial,Helvetica,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f4f6f8;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${safePreheader}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6f8;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;">
          <!-- Logo header (replaces text brand bar) -->
          <tr>
            <td align="left" style="padding:28px 32px 22px;border-bottom:1px solid #eef1f5;">
              <a href="${site}" target="_blank" style="text-decoration:none;">
                <img
                  src="${logo}"
                  alt="AfriRoar"
                  width="148"
                  style="display:block;width:148px;max-width:148px;height:auto;border:0;outline:none;text-decoration:none;"
                />
              </a>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1e1e1e;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid #eef1f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.65;color:#94a3b8;">
              <p style="margin:0 0 8px;">
                Sent by AfriRoar ·
                <a href="${site}" target="_blank" style="color:#64748b;text-decoration:underline;">afriroar.com</a>
              </p>
              <p style="margin:0 0 8px;">
                Need help?
                <a href="mailto:${supportEmail()}" style="color:#64748b;text-decoration:underline;">${supportEmail()}</a>
              </p>
              <p style="margin:0;">© ${year()} AfriRoar. All rights reserved.</p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding:16px 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.5;color:#94a3b8;">
              If you did not expect this email, you can safely ignore it.
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
  <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;line-height:1.3;color:#1e2f4a;">
    ${text}
  </h1>
`;

const paragraph = (text, { muted = false, bottom = 16 } = {}) => `
  <p style="margin:0 0 ${bottom}px;font-size:${muted ? '14' : '16'}px;line-height:1.65;color:${muted ? '#64748b' : '#334155'};">
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
    const site = clientUrl();
    return {
      subject: 'Reset your AfriRoar password',
      text: `Hi ${userName},\n\nYour AfriRoar password reset code is ${code}. It expires in 15 minutes.\n\nReset: ${site}/forgot-password\n\nIf you did not request this, ignore this email.`,
      html: wrapEmail({
        title: 'Reset your password',
        preheader: `Your password reset code is ${code}. It expires in 15 minutes.`,
        bodyHtml: `
          ${heading('Reset your password')}
          ${paragraph(`Hi ${name},`)}
          ${paragraph(
            'We received a request to reset your AfriRoar password. Enter this code to choose a new one.',
          )}
          ${codeBlock('Reset code', code)}
          ${paragraph('This code expires in <strong>15 minutes</strong>. Do not share it with anyone.', {
            muted: true,
            bottom: 0,
          })}
          ${ctaButton(`${site}/forgot-password`, 'Reset password')}
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
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#334155;">
            <tr>
              <td style="padding:8px 0;width:72px;color:#64748b;vertical-align:top;">Name</td>
              <td style="padding:8px 0;font-weight:600;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;vertical-align:top;">Email</td>
              <td style="padding:8px 0;"><a href="mailto:${safeEmail}" style="color:#2f4468;text-decoration:underline;">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#64748b;vertical-align:top;">Topic</td>
              <td style="padding:8px 0;">${safeTopic}</td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding:16px;background:#f8fafc;border:1px solid #e2e8f0;font-size:15px;line-height:1.65;color:#334155;">
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
