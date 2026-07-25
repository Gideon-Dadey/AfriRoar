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

const brandHeader = `
  <div style="background:#2f4468;padding:28px 32px;text-align:center;">
    <div style="font-size:22px;font-weight:700;color:#f5c518;letter-spacing:0.04em;">AFRIROAR</div>
    <div style="font-size:12px;color:#cbd5e1;margin-top:6px;">Scholarships &amp; Internships for Africa and Beyond</div>
  </div>
`;

const brandFooter = `
  <div style="padding:20px 32px;background:#243652;text-align:center;font-size:12px;color:#94a3b8;line-height:1.6;">
    <p style="margin:0 0 8px;">This message was sent by AfriRoar. If you did not request this email, you can safely ignore it.</p>
    <p style="margin:0;">© ${new Date().getFullYear()} AfriRoar. All rights reserved.</p>
  </div>
`;

const templates = {
  emailVerification: (userName, code) => ({
    subject: 'Verify your AfriRoar email address',
    text: `Hi ${userName},\n\nYour AfriRoar verification code is ${code}. It expires in 15 minutes.\n\nIf you did not create an account, ignore this email.`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#1e1e1e;border:1px solid #e5e7eb;">
        ${brandHeader}
        <div style="padding:36px 32px;">
          <h1 style="margin:0 0 12px;font-size:22px;color:#2f4468;">Verify your email</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">
            Hi ${userName},
          </p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#334155;">
            Thank you for creating an AfriRoar student account. Enter the verification code below to confirm your email address and activate your account.
          </p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
            <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-bottom:10px;">Verification Code</div>
            <div style="font-size:36px;font-weight:700;letter-spacing:0.28em;color:#2f4468;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">
              ${code}
            </div>
          </div>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#64748b;">
            This code expires in <strong>15 minutes</strong>. For your security, do not share it with anyone.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">
            After verification, you can sign in and begin your scholarship application.
          </p>
          <div style="margin-top:28px;text-align:center;">
            <a href="${config.clientUrl}/verify-email" style="background:#2f4468;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block;font-weight:600;">
              Verify Email
            </a>
          </div>
        </div>
        ${brandFooter}
      </div>
    `,
  }),

  applicationSubmitted: (userName, scholarshipTitle) => ({
    subject: `Application received — ${scholarshipTitle}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;">
        ${brandHeader}
        <div style="padding:32px;">
          <h2 style="margin:0 0 12px;color:#2f4468;">Application submitted</h2>
          <p style="line-height:1.6;color:#334155;">Hi ${userName},</p>
          <p style="line-height:1.6;color:#334155;">
            Your application for <strong>${scholarshipTitle}</strong> was submitted successfully. We will notify you when the status changes.
          </p>
          <div style="margin-top:24px;text-align:center;">
            <a href="${config.clientUrl}/dashboard/applications" style="background:#2f4468;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block;font-weight:600;">
              View application
            </a>
          </div>
        </div>
        ${brandFooter}
      </div>
    `,
  }),

  applicationStatusUpdate: (userName, scholarshipTitle, status) => ({
    subject: `Application update — ${scholarshipTitle}`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;">
        ${brandHeader}
        <div style="padding:32px;">
          <h2 style="margin:0 0 12px;color:#2f4468;">Application update</h2>
          <p style="line-height:1.6;color:#334155;">Hi ${userName},</p>
          <p style="line-height:1.6;color:#334155;">
            Your application for <strong>${scholarshipTitle}</strong> is now <strong>${status}</strong>.
          </p>
          <div style="margin-top:24px;text-align:center;">
            <a href="${config.clientUrl}/dashboard/applications" style="background:#2f4468;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block;font-weight:600;">
              View details
            </a>
          </div>
        </div>
        ${brandFooter}
      </div>
    `,
  }),

  welcome: (userName) => ({
    subject: 'Welcome to AfriRoar',
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;">
        ${brandHeader}
        <div style="padding:32px;">
          <h2 style="margin:0 0 12px;color:#2f4468;">Welcome, ${userName}</h2>
          <p style="line-height:1.6;color:#334155;">
            Your email is verified and your AfriRoar student account is ready. Complete your profile and start applying for scholarships.
          </p>
          <div style="margin-top:24px;text-align:center;">
            <a href="${config.clientUrl}/dashboard" style="background:#2f4468;color:#fff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block;font-weight:600;">
              Go to dashboard
            </a>
          </div>
        </div>
        ${brandFooter}
      </div>
    `,
  }),

  passwordReset: (userName, code) => ({
    subject: 'Reset your AfriRoar password',
    text: `Hi ${userName},\n\nYour AfriRoar password reset code is ${code}. It expires in 15 minutes.\n\nIf you did not request this, ignore this email.`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#1e1e1e;border:1px solid #e5e7eb;">
        ${brandHeader}
        <div style="padding:36px 32px;">
          <h1 style="margin:0 0 12px;font-size:22px;color:#2f4468;">Reset your password</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">
            Hi ${userName},
          </p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#334155;">
            We received a request to reset your AfriRoar password. Enter the code below to choose a new one.
          </p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:24px;text-align:center;margin:24px 0;">
            <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-bottom:10px;">Reset Code</div>
            <div style="font-size:36px;font-weight:700;letter-spacing:0.28em;color:#2f4468;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">
              ${code}
            </div>
          </div>
          <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#64748b;">
            This code expires in <strong>15 minutes</strong>. Do not share it with anyone.
          </p>
          <div style="margin-top:28px;text-align:center;">
            <a href="${config.clientUrl}/forgot-password" style="background:#2f4468;color:#ffffff;padding:12px 28px;border-radius:4px;text-decoration:none;display:inline-block;font-weight:600;">
              Reset password
            </a>
          </div>
        </div>
        ${brandFooter}
      </div>
    `,
  }),

  contactMessage: ({ name, email, topic, message }) => {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeTopic = escapeHtml(topic);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
    return {
      subject: `[AfriRoar Contact] ${topic}: ${name}`,
      text: `New contact message\n\nName: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#1e1e1e;border:1px solid #e5e7eb;">
          ${brandHeader}
          <div style="padding:32px;">
            <h1 style="margin:0 0 16px;font-size:22px;color:#2f4468;">New contact message</h1>
            <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.5;color:#334155;">
              <tr>
                <td style="padding:8px 0;width:88px;color:#64748b;">Name</td>
                <td style="padding:8px 0;font-weight:600;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;">Email</td>
                <td style="padding:8px 0;"><a href="mailto:${safeEmail}" style="color:#2f4468;">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b;">Topic</td>
                <td style="padding:8px 0;">${safeTopic}</td>
              </tr>
            </table>
            <div style="margin-top:20px;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;font-size:15px;line-height:1.65;color:#334155;">
              ${safeMessage}
            </div>
            <p style="margin:20px 0 0;font-size:13px;color:#64748b;">
              Reply directly to this email to respond to the sender.
            </p>
          </div>
          ${brandFooter}
        </div>
      `,
    };
  },

  contactAcknowledgement: (name) => ({
    subject: 'We received your message | AfriRoar',
    text: `Hi ${name},\n\nThanks for contacting AfriRoar. We received your message and aim to reply within 2-3 business days.\n\nFor listing deadlines and eligibility, always verify the official programme page.\n\nAfriRoar Support`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;color:#1e1e1e;border:1px solid #e5e7eb;">
        ${brandHeader}
        <div style="padding:32px;">
          <h1 style="margin:0 0 12px;font-size:22px;color:#2f4468;">Message received</h1>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">Hi ${escapeHtml(name)},</p>
          <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">
            Thanks for contacting AfriRoar. We received your message and aim to reply within
            <strong>2-3 business days</strong>.
          </p>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">
            For scholarship deadlines and eligibility, always verify details on the official programme website.
          </p>
        </div>
        ${brandFooter}
      </div>
    `,
  }),
};

module.exports = { sendEmail, templates, escapeHtml };
