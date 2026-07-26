const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const { uploadsRoot } = require('./cloudinary');
const { sniffExtFromBuffer } = require('./fileTypes');

/**
 * Legacy local avatar uploads were saved as *.bin (no extension).
 * Mobile Safari often refuses to render those. Rename files + rewrite User URLs.
 */
const migrateBinAvatars = async () => {
  const avatarDir = path.join(uploadsRoot, 'afriror', 'avatars');
  if (!fs.existsSync(avatarDir)) return { renamed: 0, updatedUsers: 0 };

  const files = (await fs.promises.readdir(avatarDir)).filter((f) => f.toLowerCase().endsWith('.bin'));
  if (!files.length) return { renamed: 0, updatedUsers: 0 };

  const renames = [];
  for (const file of files) {
    const fullPath = path.join(avatarDir, file);
    try {
      const fd = await fs.promises.open(fullPath, 'r');
      const buf = Buffer.alloc(16);
      await fd.read(buf, 0, 16, 0);
      await fd.close();

      const ext = sniffExtFromBuffer(buf);
      if (!ext || ext === '.heic' || ext === '.bin') continue;

      const nextName = `${path.basename(file, path.extname(file))}${ext}`;
      const nextPath = path.join(avatarDir, nextName);
      if (fs.existsSync(nextPath)) continue;

      await fs.promises.rename(fullPath, nextPath);
      renames.push({
        fromUrl: `/uploads/afriror/avatars/${file}`,
        toUrl: `/uploads/afriror/avatars/${nextName}`,
      });
    } catch (err) {
      logger.warn(`Avatar migrate skipped for ${file}: ${err.message}`);
    }
  }

  if (!renames.length) return { renamed: 0, updatedUsers: 0 };

  let updatedUsers = 0;
  try {
    const User = require('../models/User');
    for (const { fromUrl, toUrl } of renames) {
      const result = await User.updateMany(
        { 'profile.avatar': fromUrl },
        { $set: { 'profile.avatar': toUrl } }
      );
      updatedUsers += result.modifiedCount || 0;
    }
  } catch (err) {
    logger.warn(`Avatar URL rewrite failed: ${err.message}`);
  }

  logger.info(`Migrated ${renames.length} avatar file(s); updated ${updatedUsers} user URL(s)`);
  return { renamed: renames.length, updatedUsers };
};

module.exports = { migrateBinAvatars };
