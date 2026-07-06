import { describe, it, expect } from 'vitest';
import { optimizeCloudinaryUrl } from '../pages/CompanyProfile';

describe('optimizeCloudinaryUrl', () => {
  it('transforms a Cloudinary URL by inserting transform params before the filename', () => {
    const input = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
    const expected = 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_300/sample.jpg';
    expect(optimizeCloudinaryUrl(input)).toBe(expected);
  });

  it('returns the original URL unchanged when it is not a Cloudinary URL', () => {
    const input = 'https://example.com/logo.png';
    expect(optimizeCloudinaryUrl(input)).toBe(input);
  });

  it('returns the original URL unchanged when the input is an empty string', () => {
    expect(optimizeCloudinaryUrl('')).toBe('');
  });

  it('accepts custom transform parameters', () => {
    const input = 'https://res.cloudinary.com/demo/image/upload/v1234/logo.png';
    const expected = 'https://res.cloudinary.com/demo/image/upload/w_100,h_100,c_fill/v1234/logo.png';
    expect(optimizeCloudinaryUrl(input, 'w_100,h_100,c_fill')).toBe(expected);
  });
});
