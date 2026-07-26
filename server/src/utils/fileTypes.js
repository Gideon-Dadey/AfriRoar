const path = require('path');

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

const EXT_TO_MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/** Detect common file types from magic bytes (fixes legacy .bin avatar uploads). */
const sniffExtFromBuffer = (buffer) => {
  if (!buffer || buffer.length < 12) return null;

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return '.jpg';
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return '.png';
  if (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return '.webp';
  }
  if (buffer.toString('ascii', 0, 5) === '%PDF-') return '.pdf';

  // HEIC/HEIF (iPhone) — not renderable in most browsers without conversion
  const brand = buffer.toString('ascii', 4, 8);
  if (brand === 'ftyp') {
    const ftyp = buffer.toString('ascii', 8, 12);
    if (['heic', 'heif', 'mif1', 'msf1'].includes(ftyp)) return '.heic';
  }

  return null;
};

const resolveUploadExt = ({ filename, mimetype, buffer } = {}) => {
  if (filename && path.extname(filename)) {
    return path.extname(filename).toLowerCase();
  }
  if (mimetype && MIME_TO_EXT[mimetype]) {
    return MIME_TO_EXT[mimetype];
  }
  const sniffed = buffer ? sniffExtFromBuffer(buffer) : null;
  if (sniffed) return sniffed;
  return '.bin';
};

const mimeFromExt = (ext) => EXT_TO_MIME[String(ext || '').toLowerCase()] || null;

module.exports = {
  MIME_TO_EXT,
  EXT_TO_MIME,
  sniffExtFromBuffer,
  resolveUploadExt,
  mimeFromExt,
};
