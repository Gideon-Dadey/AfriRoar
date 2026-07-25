const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarhive',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
    expire: process.env.JWT_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceMonthly: process.env.STRIPE_PRICE_MONTHLY,
    priceYearly: process.env.STRIPE_PRICE_YEARLY,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || 'AfriRoar <noreply@afriroar.com>',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  redis: {
    url: process.env.REDIS_URL,
  },

  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
};
