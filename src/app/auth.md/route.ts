import { SITE_URL } from '@/lib/constants/brand';

/**
 * Serves /auth.md — the agent authentication policy document
 * (WorkOS auth.md convention: https://github.com/workos/auth.md).
 *
 * Mamsa does NOT support agent registration: tokens are per-user and can only
 * be issued through a phone OTP flow that requires a human. Rather than leave
 * agents to probe non-existent OAuth endpoints, this document states the
 * situation plainly. The convention explicitly allows a self-contained file
 * when no OAuth metadata exists — which is our case.
 *
 * Everything below is deliberately factual: no endpoint is listed here unless
 * it actually exists.
 */
export const dynamic = 'force-static';

/** Production API base — matches NEXT_PUBLIC_API_BASE_URL in .env.example. */
const API_BASE = 'https://api.mamsaa.com/api/v1';

function buildAuthMd(): string {
  return `# auth.md

Agent authentication policy for Mamsa (مَمسَى) — ${SITE_URL}

## Summary

**Mamsa does not support agent registration.** There is no endpoint through
which an autonomous agent can provision its own credentials, and no OAuth 2.0
or OpenID Connect authorization server exists for this service.

## How authentication actually works

- **API base:** ${API_BASE}
- **Scheme:** bearer token in the \`Authorization: Bearer <token>\` header
- **Token issuance:** phone-based one-time password (OTP) only
  - \`POST /auth/request-otp\` — sends a code by SMS to a user's phone
  - \`POST /auth/verify-otp\` — exchanges the code for an access token
- **Renewal:** \`POST /auth/refresh\`
- **Token format:** opaque, server-side (Laravel Sanctum). These are not JWTs;
  there is no JWKS endpoint and no key material to validate offline.

## What this means for agents

Issuing a token requires a human to receive an SMS code on their own phone.
An agent therefore **cannot obtain credentials autonomously**. An agent may act
only with a token supplied to it by an already-authenticated human user, and
that token carries that user's full account privileges — including the ability
to create bookings and payments. Treat it as a user credential, not a service
credential.

## Not supported

The following are intentionally absent, not merely unimplemented:

- OAuth 2.0 / OpenID Connect authorization server
  (\`/.well-known/openid-configuration\`, \`/.well-known/oauth-authorization-server\`)
- Agent self-registration, claim ceremonies, or delegated-identity flows
- Client-credentials grants or service accounts
- Scopes — the API has no scope model; a token is all-or-nothing

## What agents can do without authentication

Most public content needs no credentials at all:

- Browse listings: ${SITE_URL}/units
- Crawl rules and content-usage signals: ${SITE_URL}/robots.txt
- Canonical page list: ${SITE_URL}/sitemap.xml
- API catalog: ${SITE_URL}/.well-known/api-catalog
- Request any page as Markdown by sending \`Accept: text/markdown\`

## Contact

For partnership or programmatic-access enquiries: info@mamsaa.com
`;
}

export function GET() {
  return new Response(buildAuthMd(), {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
