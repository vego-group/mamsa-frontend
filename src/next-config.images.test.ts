// @vitest-environment node
/**
 * `/_next/image` fetches and re-serves any image its config allows, for anyone
 * who asks. No page sends a remote image through it — next/image renders only
 * local files, and unit photos and Unsplash pictures are plain <img> or CSS the
 * browser fetches itself — so it must allow no remote host at all. With
 * Unsplash allowed it was an open image proxy to Unsplash, measured on a
 * production build and on Vercel.
 *
 * This asks Next's own validator (the step that answers 400 "url parameter is
 * not allowed") with the real next.config.js, defaults merged the way Next
 * merges them.
 */
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const { ImageOptimizerCache } = require('next/dist/server/image-optimizer');
const { imageConfigDefault } = require('next/dist/shared/lib/image-config');
const nextConfig = require('../next.config.js');

const images = { ...imageConfigDefault, ...nextConfig.images };

/** The validator's verdict: null when the optimizer would fetch the URL, else its 400 message. */
function refusal(url: string): string | null {
  const result = ImageOptimizerCache.validateParams(
    { headers: { accept: 'image/webp' } },
    { url, w: '64', q: '75' },
    { images },
    false,
  );
  return result.errorMessage ?? null;
}

describe('/_next/image allows no remote host', () => {
  it('configures no remote patterns and no domains', () => {
    expect(images.remotePatterns).toEqual([]);
    expect(images.domains).toEqual([]);
  });

  it.each([
    'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf',
    'https://plus.unsplash.com/premium_photo-1',
    'https://api.mamsaa.com/api/v1/units',
    'https://cdn.mamsaa.com/x.webp',
    'https://partner.mamsaa.com/logo.png',
    'http://169.254.169.254/latest/',
    'https://example.com/a.png',
  ])('refuses %s', (url) => {
    expect(refusal(url)).toBe('"url" parameter is not allowed');
  });

  it.each(['/Mamsa_logo.png', '/Mamsa_logo.jpg', '/onboarding-hero.png'])(
    'still optimizes the local image %s',
    (url) => {
      expect(refusal(url)).toBeNull();
    },
  );
});
