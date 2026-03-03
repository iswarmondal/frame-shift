import { describe, it, expect } from 'vitest';
import { generateShareHash } from './hash';

describe('generateShareHash', () => {
  it('should generate a string', () => {
    const hash = generateShareHash();
    expect(typeof hash).toBe('string');
  });

  it('should generate a hash of expected length (32 chars for 24 bytes in base64url)', () => {
    const hash = generateShareHash();
    expect(hash.length).toBe(32);
  });

  it('should only contain url-safe base64 characters', () => {
    const hash = generateShareHash();
    // Base64URL uses A-Z, a-z, 0-9, -, and _
    expect(hash).toMatch(/^[A-Za-z0-9\-_]+$/);
  });

  it('should generate unique hashes on subsequent calls', () => {
    const hash1 = generateShareHash();
    const hash2 = generateShareHash();
    expect(hash1).not.toBe(hash2);
  });

  it('should generate unique hashes for many calls', () => {
    const hashes = new Set<string>();
    const NUM_CALLS = 1000;

    for (let i = 0; i < NUM_CALLS; i++) {
      hashes.add(generateShareHash());
    }

    expect(hashes.size).toBe(NUM_CALLS);
  });
});
