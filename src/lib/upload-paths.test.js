const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isCloudinaryUrl,
  localCloudinaryUrl,
  localUploadUrl,
  isImageUrl,
  sanitizePathSegment,
} = require('./upload-paths');

test('detects Cloudinary delivery URLs only', () => {
  assert.equal(isCloudinaryUrl('https://res.cloudinary.com/demo/image/upload/v1/folder/a.jpg'), true);
  assert.equal(isCloudinaryUrl('/uploads/products/a.jpg'), false);
  assert.equal(isCloudinaryUrl('https://example.com/a.jpg'), false);
});

test('builds stable local URLs for Cloudinary assets', () => {
  const local = localCloudinaryUrl('https://res.cloudinary.com/dqgqonnnm/image/upload/c_fill,w_300/v177/foo/bar/rau sạch.png');

  assert.match(local, /^\/uploads\/cloudinary\/foo\/bar\/rau-sach-[a-f0-9]{10}\.png$/);
});

test('builds safe upload URLs from admin filenames', () => {
  assert.equal(localUploadUrl('Sản phẩm mới', 'Cà chua Đà Lạt.JPG', 'abc123'), '/uploads/San-pham-moi/Ca-chua-Da-Lat-abc123.JPG');
});

test('sanitizes empty path segments to a safe fallback', () => {
  assert.equal(sanitizePathSegment('***'), 'file');
});

test('recognizes remote and local upload image URLs', () => {
  assert.equal(isImageUrl('https://res.cloudinary.com/demo/image/upload/v1/a.jpg'), true);
  assert.equal(isImageUrl('/uploads/cloudinary/categories/a.jpg'), true);
  assert.equal(isImageUrl('🥬'), false);
  assert.equal(isImageUrl('categories/a.jpg'), false);
});
