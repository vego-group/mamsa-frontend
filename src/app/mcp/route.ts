/**
 * Mamsa MCP server — Streamable HTTP at `/mcp`.
 *
 * Exposes the public unit-browsing surface as MCP tools so an agent can search
 * and inspect listings the same way a visitor would. Read-only by design: no
 * booking, payment, or account endpoint is reachable from here, so the server
 * needs no auth and holds no session.
 *
 * The Server Card at `/.well-known/mcp/server-card.json` describes exactly the
 * tools registered below — per SEP-1649 a card must not contradict runtime
 * behaviour, so any tool added or removed here must be mirrored there.
 */
import { z } from 'zod';
import { createMcpHandler } from 'mcp-handler';
import { McpDataError, searchUnits, getUnit, getFeaturedUnits, getUnitReviews } from '@/lib/mcp/units';
import type { Unit, Review } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mamsaa.com';

// Not exported: a route module may only export handlers and Next's own route
// config keys. These must stay in sync with public/.well-known/mcp/server-card.json.
const SERVER_NAME = 'com.mamsaa.www';
const SERVER_VERSION = '1.0.0';

/** Agent-facing projection of a unit. */
function summarize(u: Unit) {
  return {
    id: u.id,
    title: u.title,
    type: u.type,
    city: u.city,
    district: u.district || undefined,
    pricePerNight: u.pricePerNight,
    currency: 'SAR',
    capacity: u.capacity,
    bedrooms: u.bedrooms,
    beds: u.beds,
    bathrooms: u.bathrooms,
    areaSqm: u.area,
    rating: u.rating,
    reviewCount: u.reviewCount,
    amenities: u.amenities.map((a) => a.labelAr),
    url: `${SITE_URL}/units/${u.id}`,
  };
}

function detail(u: Unit) {
  return {
    ...summarize(u),
    description: u.description,
    checkInTime: u.checkInTime,
    checkOutTime: u.checkOutTime,
    cancellationPolicy: u.cancellationPolicy,
    coordinates: u.latitude || u.longitude ? { lat: u.latitude, lng: u.longitude } : undefined,
    images: u.imageUrls,
  };
}

const review = (r: Review) => ({
  rating: r.rating,
  comment: r.comment,
  author: r.userName || undefined,
  createdAt: r.createdAt,
});

type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

const ok = (data: unknown): ToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
});

/**
 * Upstream failures are reported as tool errors rather than thrown, so the agent
 * gets an actionable message instead of a dead transport. Unexpected errors are
 * not echoed verbatim — they can carry internal detail.
 */
async function run(fn: () => Promise<unknown>): Promise<ToolResult> {
  try {
    return ok(await fn());
  } catch (e) {
    const message = e instanceof McpDataError ? e.message : 'Unexpected error while querying the Mamsa API.';
    return { content: [{ type: 'text', text: message }], isError: true };
  }
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'search_units',
      {
        title: 'Search units',
        description:
          'Search Mamsa vacation-rental listings in Saudi Arabia by city, unit type, guest capacity, nightly price range and rating. Returns matching units with pricing and a link to each listing.',
        inputSchema: {
          city: z.string().optional().describe('City name in Arabic, e.g. "الرياض" or "جدة".'),
          type: z.enum(['apartment', 'studio', 'villa']).optional().describe('Unit type.'),
          capacity: z.number().int().positive().optional().describe('Minimum number of guests the unit must sleep.'),
          minPrice: z.number().nonnegative().optional().describe('Minimum nightly price in SAR.'),
          maxPrice: z.number().nonnegative().optional().describe('Maximum nightly price in SAR.'),
          minRating: z.number().min(0).max(5).optional().describe('Minimum average rating, 0–5.'),
          sort: z
            .enum(['price_asc', 'price_desc', 'rating', 'newest'])
            .optional()
            .describe('Result ordering. Defaults to the API default.'),
        },
        annotations: { readOnlyHint: true, openWorldHint: true },
      },
      async (args) => run(async () => (await searchUnits(args)).map(summarize)),
    );

    server.registerTool(
      'get_unit',
      {
        title: 'Get unit',
        description:
          'Fetch the full details of one Mamsa listing by id: description, amenities, check-in/out times, cancellation policy, coordinates and images.',
        inputSchema: { id: z.string().min(1).describe('Unit id, as returned by search_units.') },
        annotations: { readOnlyHint: true, openWorldHint: true },
      },
      async ({ id }) => run(async () => detail(await getUnit(id))),
    );

    server.registerTool(
      'list_featured_units',
      {
        title: 'List featured units',
        description: 'List the currently popular/featured Mamsa listings.',
        inputSchema: {},
        annotations: { readOnlyHint: true, openWorldHint: true },
      },
      async () => run(async () => (await getFeaturedUnits()).map(summarize)),
    );

    server.registerTool(
      'get_unit_reviews',
      {
        title: 'Get unit reviews',
        description: 'Fetch guest reviews for one Mamsa listing by id.',
        inputSchema: { id: z.string().min(1).describe('Unit id, as returned by search_units.') },
        annotations: { readOnlyHint: true, openWorldHint: true },
      },
      async ({ id }) => run(async () => (await getUnitReviews(id)).map(review)),
    );
  },
  { serverInfo: { name: SERVER_NAME, version: SERVER_VERSION } },
  {
    basePath: '',
    streamableHttpEndpoint: '/mcp',
    // SSE is not part of the spec since 2025-03-26 and is the only thing here
    // that would need Redis — Streamable HTTP alone keeps this stateless.
    disableSse: true,
    maxDuration: 60,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
