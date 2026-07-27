const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const { NotFoundError } = require('./utils/errors');

// Route imports
const authRoutes = require('./routes/auth');
const scholarshipRoutes = require('./routes/scholarships');
const applicationRoutes = require('./routes/applications');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');
const contactRoutes = require('./routes/contact');
const contentRoutes = require('./routes/content');

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
// Allow same-origin images (local flags/covers) plus https CDNs if used later.
// Google Identity Services needs accounts.google.com scripts/frames + allow-popups COOP.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'img-src': ["'self'", 'data:', 'blob:', 'https:'],
        'script-src': [
          "'self'",
          'https://accounts.google.com',
          'https://apis.google.com',
        ],
        'script-src-elem': [
          "'self'",
          'https://accounts.google.com',
          'https://apis.google.com',
        ],
        'frame-src': ["'self'", 'https://accounts.google.com'],
        'connect-src': [
          "'self'",
          'https://accounts.google.com',
          'https://oauth2.googleapis.com',
          'https://www.googleapis.com',
        ],
        'worker-src': ["'self'", 'blob:'],
        'manifest-src': ["'self'"],
        'upgrade-insecure-requests': null,
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting - generous in development so dashboard polling / Strict Mode
// remounts do not lock out the local UI.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.env === 'development' ? 2000 : 300,
  message: { status: 'fail', message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: 'fail', message: 'Too many authentication attempts. Please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/google', authLimiter);

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.env === 'development' ? 40 : 8,
  message: { status: 'fail', message: 'Too many contact messages. Please try again later.' },
});
app.use('/api/contact', contactLimiter);

// Stripe webhook needs raw body (before json parser)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization (Express 5-safe - req.query is read-only)
const sanitizeValue = (value) => {
  if (value && typeof value === 'object') {
    if (Array.isArray(value)) return value.map(sanitizeValue);
    const clean = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith('$') || key.includes('.')) continue;
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }
  return value;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
});
app.use(hpp());

// Local uploads (MVP fallback when Cloudinary is not configured)
const path = require('path');
const fs = require('fs');
const { sniffExtFromBuffer, mimeFromExt } = require('./utils/fileTypes');

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    setHeaders(res, filePath) {
      const ext = path.extname(filePath).toLowerCase();
      // Legacy avatar uploads were saved as .bin - sniff bytes so mobile Safari can render them
      if (ext === '.bin') {
        try {
          const fd = fs.openSync(filePath, 'r');
          const buf = Buffer.alloc(16);
          fs.readSync(fd, buf, 0, 16, 0);
          fs.closeSync(fd);
          const sniffed = sniffExtFromBuffer(buf);
          const mime = mimeFromExt(sniffed);
          if (mime) {
            res.setHeader('Content-Type', mime);
          }
        } catch {
          /* keep default */
        }
      } else {
        const mime = mimeFromExt(ext);
        if (mime) res.setHeader('Content-Type', mime);
      }
      res.setHeader('Cache-Control', 'public, max-age=86400');
      // Allow opening CVs/docs in new tabs and viewers without CORP blocking
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);

// HTTP request logging
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/job-applications', require('./routes/jobApplications'));
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/content', contentRoutes);

const { robotsTxt, sitemapXml } = require('./controllers/seoController');
app.get('/robots.txt', robotsTxt);
app.get('/sitemap.xml', sitemapXml);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AfriRoar API is running',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// Serve the Vite client build when present (Render / production single-service)
const clientDist = path.join(__dirname, '../../client/dist');
const serveClient = fs.existsSync(path.join(clientDist, 'index.html'));

if (serveClient) {
  app.use(
    express.static(clientDist, {
      index: false,
      // Default short; setHeaders overrides critical files so deploys are picked up quickly
      maxAge: '1h',
      setHeaders(res, filePath) {
        const rel = path.relative(clientDist, filePath).split(path.sep).join('/');
        if (
          rel === 'index.html' ||
          rel === 'sw.js' ||
          rel === 'manifest.webmanifest' ||
          rel.endsWith('.html')
        ) {
          // Always revalidate entry + SW so PWA/browser clients detect new builds
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else if (rel.startsWith('assets/')) {
          // Vite content-hashed bundles are immutable
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
      },
    })
  );
  app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next(new NotFoundError(`Cannot find ${req.originalUrl} on this server.`));
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.all('/{*splat}', (req, res, next) => {
    next(new NotFoundError(`Cannot find ${req.originalUrl} on this server.`));
  });
}

// Global error handler
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDB();
    const { bootstrapDemoData } = require('./utils/bootstrapDemoData');
    await bootstrapDemoData();
    const { migrateBinAvatars } = require('./utils/migrateBinAvatars');
    await migrateBinAvatars();

    const { startDeadlineReminderJob } = require('./jobs/deadlineReminders');
    startDeadlineReminderJob();

    app.listen(config.port, () => {
      logger.info(`🚀 AfriRoar API running on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION 💥:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION 💥:', err.message);
  process.exit(1);
});

start();

module.exports = app;
