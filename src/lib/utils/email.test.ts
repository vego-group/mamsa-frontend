import { describe, it, expect } from 'vitest';
import { isValidEmail } from './email';

describe('isValidEmail', () => {
  it('accepts well-formed addresses', () => {
    expect(isValidEmail('user@mamsaa.com')).toBe(true);
    expect(isValidEmail('first.last@mamsaa.com')).toBe(true);
    expect(isValidEmail('  user@mamsaa.com  ')).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@mamsaa.com')).toBe(false);
    expect(isValidEmail('user@mamsaa')).toBe(false);
    expect(isValidEmail('user name@mamsaa.com')).toBe(false);
  });
});
