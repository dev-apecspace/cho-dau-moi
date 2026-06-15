const crypto = require('crypto');
const path = require('path');

const CLOUDINARY_HOST_RE = /(^|\.)res\.cloudinary\.com$/i;
const MIME_EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
  'image/avif': '.avif',
};

function isCloudinaryUrl(value) {
  try {
    const url = new URL(value);
    return CLOUDINARY_HOST_RE.test(url.hostname);
  } catch {
    return false;
  }
}

function isImageUrl(value) {
  if (typeof value !== 'string') return false;
  return /^https?:\/\//i.test(value) || value.startsWith('/uploads/');
}

function sanitizePathSegment(value) {
  const sanitized = String(value || '')
    .normalize('NFKD')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return sanitized || 'file';
}

function extensionFrom(value, contentType = '') {
  const urlPath = (() => {
    try {
      return decodeURIComponent(new URL(value).pathname);
    } catch {
      return String(value || '');
    }
  })();
  const ext = path.extname(urlPath);
  if (ext && ext.length <= 8) return ext;
  return MIME_EXTENSIONS[String(contentType).split(';')[0].toLowerCase()] || '.jpg';
}

function hashUrl(value) {
  return crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 10);
}

function localUploadUrl(folder, filename, uniqueSuffix = Date.now().toString(36)) {
  const ext = extensionFrom(filename);
  const base = sanitizePathSegment(path.basename(String(filename), ext));
  return `/uploads/${sanitizePathSegment(folder)}/${base}-${uniqueSuffix}${ext}`;
}

function localCloudinaryUrl(cloudinaryUrl, contentType = '') {
  const url = new URL(cloudinaryUrl);
  const parts = decodeURIComponent(url.pathname).split('/').filter(Boolean);
  const uploadIndex = parts.indexOf('upload');
  const assetParts = uploadIndex >= 0 ? parts.slice(uploadIndex + 1) : parts;
  const versionIndex = assetParts.findIndex((part) => /^v\d+$/.test(part));
  const publicIdParts = versionIndex >= 0 ? assetParts.slice(versionIndex + 1) : assetParts.slice(-1);
  const filename = publicIdParts.pop() || 'image';
  const ext = extensionFrom(filename, contentType);
  const base = sanitizePathSegment(path.basename(filename, ext));
  const folders = publicIdParts.map(sanitizePathSegment).filter(Boolean);

  return `/uploads/cloudinary/${[...folders, `${base}-${hashUrl(cloudinaryUrl)}${ext}`].join('/')}`;
}

module.exports = {
  extensionFrom,
  isCloudinaryUrl,
  isImageUrl,
  localCloudinaryUrl,
  localUploadUrl,
  sanitizePathSegment,
};
