import { describe, it, expect } from 'vitest';
import { isAllowedVideoType } from './blob';

describe('isAllowedVideoType', () => {
  it('should return true for allowed video types', () => {
    expect(isAllowedVideoType('video/mp4')).toBe(true);
    expect(isAllowedVideoType('video/webm')).toBe(true);
    expect(isAllowedVideoType('video/quicktime')).toBe(true);
  });

  it('should return false for unallowed video types', () => {
    expect(isAllowedVideoType('video/x-msvideo')).toBe(false);
    expect(isAllowedVideoType('video/ogg')).toBe(false);
    expect(isAllowedVideoType('video/avi')).toBe(false);
  });

  it('should return false for non-video types', () => {
    expect(isAllowedVideoType('image/png')).toBe(false);
    expect(isAllowedVideoType('image/jpeg')).toBe(false);
    expect(isAllowedVideoType('application/json')).toBe(false);
    expect(isAllowedVideoType('text/plain')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isAllowedVideoType('')).toBe(false);
  });

  it('should be case-sensitive (or check strictness)', () => {
    // Current implementation uses Array.includes which is case-sensitive
    expect(isAllowedVideoType('VIDEO/MP4')).toBe(false);
    expect(isAllowedVideoType('video/Mp4')).toBe(false);
  });

  it('should return false for partial matches', () => {
    expect(isAllowedVideoType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')).toBe(false);
    expect(isAllowedVideoType('mp4')).toBe(false);
  });
});
