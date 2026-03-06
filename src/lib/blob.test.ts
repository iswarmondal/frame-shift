import test from 'node:test';
import assert from 'node:assert';
import { isWithinSizeLimit, isAllowedVideoType, MAX_SIZE_BYTES, VIDEO_TYPES } from './blob.ts';

test('isWithinSizeLimit boundary conditions', () => {
  assert.strictEqual(isWithinSizeLimit(0), false, '0 should be invalid (lower boundary)');
  assert.strictEqual(isWithinSizeLimit(-1), false, 'Negative should be invalid');
  assert.strictEqual(isWithinSizeLimit(1), true, '1 should be valid (above lower boundary)');
  assert.strictEqual(isWithinSizeLimit(MAX_SIZE_BYTES), true, 'MAX_SIZE_BYTES should be valid (upper boundary)');
  assert.strictEqual(isWithinSizeLimit(MAX_SIZE_BYTES + 1), false, 'Above MAX_SIZE_BYTES should be invalid (above upper boundary)');
});

  assert.ok(VIDEO_TYPES.length > 0, 'VIDEO_TYPES should not be empty');
  VIDEO_TYPES.forEach(type => {
    assert.strictEqual(isAllowedVideoType(type), true, `${type} should be allowed`);
  });

  assert.strictEqual(isAllowedVideoType('image/png'), false, 'image/png should not be allowed');
  assert.strictEqual(isAllowedVideoType('video/avi'), false, 'video/avi should not be allowed');
});
