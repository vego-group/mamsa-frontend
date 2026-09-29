/**
 * The expiry stamp decides which message the guest reads when a photo does
 * not load, so every shape the link can take is pinned, and "no stamp" is
 * pinned as "not expired" — a fault on a valid link must never be blamed on
 * the link.
 */
import { describe, expect, it } from 'vitest';
import { imageLinkExpiresAt, isImageLinkExpired } from './imageLinks';

const NOW = Date.parse('2026-09-07T10:00:00Z');
const NOW_S = NOW / 1000;

describe('imageLinkExpiresAt', () => {
  it('reads a Laravel signed route: `expires` in unix seconds', () => {
    const url = `https://api.mamsaa.com/complaints/12/images/1?expires=${NOW_S + 900}&signature=abc`;
    expect(imageLinkExpiresAt(url)).toBe(NOW + 900_000);
  });

  it('reads an S3 v2 presigned link: `Expires` in unix seconds', () => {
    const url = `https://bucket.s3.amazonaws.com/k?AWSAccessKeyId=A&Expires=${NOW_S + 60}&Signature=s`;
    expect(imageLinkExpiresAt(url)).toBe(NOW + 60_000);
  });

  it('reads an S3 v4 presigned link: X-Amz-Date plus X-Amz-Expires', () => {
    const url =
      'https://bucket.s3.amazonaws.com/k?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20260907T095000Z&X-Amz-Expires=900&X-Amz-Signature=s';
    expect(imageLinkExpiresAt(url)).toBe(Date.parse('2026-09-07T10:05:00Z'));
  });

  it('is null for a link that carries no expiry, an unparseable one, or a malformed stamp', () => {
    expect(imageLinkExpiresAt('https://cdn.mamsaa.com/complaints/12/1.jpg')).toBeNull();
    expect(imageLinkExpiresAt('blob:http://localhost/8b6e5c2a')).toBeNull();
    expect(imageLinkExpiresAt('')).toBeNull();
    expect(imageLinkExpiresAt('https://api.mamsaa.com/x?expires=soon&signature=s')).toBeNull();
    expect(imageLinkExpiresAt('https://b.s3.amazonaws.com/k?X-Amz-Expires=900')).toBeNull();
  });
});

describe('isImageLinkExpired', () => {
  const signed = (expires: number) => `https://api.mamsaa.com/x?expires=${expires}&signature=s`;

  it('is true once the stamp has passed, inclusive of the instant itself', () => {
    expect(isImageLinkExpired(signed(NOW_S - 1), NOW)).toBe(true);
    expect(isImageLinkExpired(signed(NOW_S), NOW)).toBe(true);
  });

  it('is false while the stamp is still ahead', () => {
    expect(isImageLinkExpired(signed(NOW_S + 1), NOW)).toBe(false);
    expect(isImageLinkExpired(signed(NOW_S + 900), NOW)).toBe(false);
  });

  it('never calls a link without a stamp expired', () => {
    expect(isImageLinkExpired('https://cdn.mamsaa.com/1.jpg', NOW)).toBe(false);
    expect(isImageLinkExpired('blob:http://localhost/8b6e5c2a', NOW)).toBe(false);
  });
});
