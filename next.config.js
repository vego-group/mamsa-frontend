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
      {
        // RFC 9727 API catalog: served as a linkset document, not JSON, so that
        // agents fetching the api-catalog target get the registered media type.
        source: '/.well-known/api-catalog',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
          },
        ],
      },
      {
        // Baseline security headers for every page. A strict CSP is deliberately
        // NOT set here: moyasar.js injects inline styles/scripts and data: images,
        // so a CSP must be introduced in Report-Only mode first or it will break
        // the payment form silently.
        source: '/:path*',
        headers: [
          // Blocks MIME-type sniffing of responses.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Clickjacking protection — nothing legitimate frames this app.
          // (Moyasar's 3-DS return is a top-level redirect, not an iframe.)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Don't leak full URLs (which may contain payment ids) cross-origin.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // We never use these browser capabilities.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // RFC 8288 agent discovery: advertise the API catalog (published at
          // /.well-known/api-catalog) and the MCP Server Card (SEP-1649, which
          // describes the read-only MCP server at /mcp) so agents can find both
          // from any page — including the homepage.
          {
            key: 'Link',
            value:
              '</.well-known/api-catalog>; rel="api-catalog", </.well-known/mcp/server-card.json>; rel="mcp-server-card"',
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
