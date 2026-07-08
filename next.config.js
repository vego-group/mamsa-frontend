const createNextIntlPlugin = require('next-intl/plugin');

// Cookie-based i18n (see src/i18n/request.ts) — no locale URL prefixes.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  // Apple Pay domain verification: Apple's crawler fetches this file and
  // rejects redirects or wrong content types. Any future middleware/rewrite
  // must keep /.well-known/* untouched.
  async headers() {
    return [
      {
        source: '/.well-known/apple-developer-merchantid-domain-association',
        headers: [{ key: 'Content-Type', value: 'application/octet-stream' }],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
