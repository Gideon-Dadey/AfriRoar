const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const config = require('../config');
const logger = require('./logger');
const { resolveUploadExt } = require('./fileTypes');

const hasRealValue = (value) => {
  const v = String(value || '').trim();
  if (!v) return false;
  const lowered = v.toLowerCase();
  return !(
    lowered.includes('your_') ||
    lowered.includes('your-') ||
    lowered === 'changeme' ||
    lowered === 'xxx' ||
    lowered === 'placeholder'
  );
};

const hasCloudinary =
  hasRealValue(config.cloudinary.cloudName) &&
  hasRealValue(config.cloudinary.apiKey) &&
  hasRealValue(config.cloudinary.apiSecret);

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

const uploadsRoot = path.join(__dirname, '../../uploads');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const uploadLocally = async (buffer, options = {}) => {
  const folder = options.folder || 'afriror';
  const destDir = path.join(uploadsRoot, folder);
  ensureDir(destDir);

  const ext = resolveUploadExt({
    filename: options.filename,
    mimetype: options.mimetype,
    buffer,
  });

  if (ext === '.heic') {
    const err = new Error(
      'HEIC photos from iPhone are not supported. Please choose a JPG or PNG, or set Camera to Most Compatible.'
    );
    err.statusCode = 400;
    throw err;
  }

  const publicId = `${folder}/${crypto.randomBytes(12).toString('hex')}`;
  const filename = `${path.basename(publicId)}${ext}`;
  const fullPath = path.join(destDir, filename);

  await fs.promises.writeFile(fullPath, buffer);

  const relativeUrl = `/uploads/${folder}/${filename}`.replace(/\\/g, '/');
  return {
    secure_url: relativeUrl,
    public_id: publicId,
    bytes: buffer.length,
    format: ext.replace(/^\./, ''),
  };
};

const uploadToCloudinary = (buffer, options = {}) => {
  if (!hasCloudinary) {
    logger.warn('Cloudinary not configured - storing upload locally');
    return uploadLocally(buffer, options);
  }

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'auto',
      folder: options.folder || 'afriror',
      ...options,
    };
    // Cloudinary stream API does not use local mimetype/filename the same way
    delete uploadOptions.mimetype;
    delete uploadOptions.filename;

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error.message);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!hasCloudinary) {
    return { result: 'ok' };
  }
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Cloudinary delete error:', error.message);
    throw error;
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, cloudinary, uploadsRoot };
