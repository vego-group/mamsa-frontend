/**
 * The server half of the unit page: one cached read of the unit, which both
 * sends an old URL on to the listing's own (308) and fills in the <head>.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import UnitPage, { generateMetadata } from './page';
import UnitDetailsPage from './unit-page-client';
import { ApiError, unitsApi } from '@/lib/api/client';
import { SITE_URL } from '@/lib/constants/brand';
import { MOCK_UNITS } from '@/data/mock/units';
import type { Review, Unit } from '@/types';

// React's `cache` lives in the server build Next renders with, not in the
// React the tests run on. This stands in for it: one memo per request, and
// every test is a request of its own.
const { memos } = vi.hoisted(() => ({ memos: [] as Map<unknown, unknown>[] }));
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    cache: (fn: (key: unknown) => unknown) => {
      const memo = new Map<unknown, unknown>();
      memos.push(memo);
      return (key: unknown) => {
        if (!memo.has(key)) memo.set(key, fn(key));
        return memo.get(key);
      };
    },
  };
});

// Like the real ones, they throw: nothing after a redirect or a 404 runs.
vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  permanentRedirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

/** Staging's unit 12, a standalone unit, as the adapter hands it over. */
const U12: Unit = {
  ...MOCK_UNITS[0]!,
  id: '12',
  listingId: 'u12',
  title: 'شقة تجريبية — لوحة الشريك',
  district: 'العليا',
  city: 'الرياض',
  type: 'apartment',
  bedrooms: 2,
  capacity: 4,
  description:
    '## عن الوحدة\nشقة عصرية بإطلالة مفتوحة، مناسبة للعائلات وللإقامات الطويلة.\n\n## المرافق\n- واي فاي عالي السرعة\n- تكييف مركزي\n- مصعد\n\n> يُمنع التدخين داخل الوحدة.',
  images: [
    {
      url: 'https://cdn.test/u12.jpg',
      thumb: 'https://cdn.test/u12_thumb.webp',
      card: 'https://cdn.test/u12_card.webp',
      full: 'https://cdn.test/u12_full.webp',
      width: 800,
      height: 534,
    },
  ],
};

/** Staging's building 30: the card and doors 39–42 share one key. */
const BUILDING: Unit = { ...U12, id: '30', listingId: '01M19EZRB4ARP4BDGJ4ET7P03F', title: 'برج تجريبي - مبنى كامل', district: '' };

const page = (id: string) => UnitPage({ params: { id } });
const head = (id: string) => generateMetadata({ params: { id } });

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(permanentRedirect).mockClear();
  vi.mocked(notFound).mockClear();
  for (const memo of memos) memo.clear();
});

describe('unit page — opening it by id', () => {
  it('sends a standalone unit on to its listing key, permanently', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);

    await expect(page('12')).rejects.toThrow('NEXT_REDIRECT');

    expect(permanentRedirect).toHaveBeenCalledOnce();
    expect(permanentRedirect).toHaveBeenCalledWith('/units/u12');
  });

  it("sends a building's door on to the building's key, as the server named it", async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue({ ...BUILDING, id: '30' });

    await expect(page('39')).rejects.toThrow('NEXT_REDIRECT');

    expect(permanentRedirect).toHaveBeenCalledWith('/units/01M19EZRB4ARP4BDGJ4ET7P03F');
  });
});

describe('unit page — opening it by its listing key', () => {
  // The redirect's own destination: if this ever redirected, it would loop.
  it('stays on /units/u12', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);

    await expect(page('u12')).resolves.toBeTruthy();

    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it("stays on a building's key", async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(BUILDING);

    await expect(page('01M19EZRB4ARP4BDGJ4ET7P03F')).resolves.toBeTruthy();

    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  it('stays put when the unit came back without a key', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue({ ...U12, listingId: undefined });

    await expect(page('12')).resolves.toBeTruthy();

    expect(permanentRedirect).not.toHaveBeenCalled();
  });
});

describe('unit page — its <head>', () => {
  it("is titled by the unit's real name, district and city", async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);

    const meta = await head('u12');

    expect(meta.title).toBe('شقة تجريبية — لوحة الشريك — العليا، الرياض | مَمسَى');
  });

  it('leaves the district out when the unit has none', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(BUILDING);

    expect((await head('01M19EZRB4ARP4BDGJ4ET7P03F')).title).toBe('برج تجريبي - مبنى كامل — الرياض | مَمسَى');
  });

  it('cuts a long name, never the city, to keep the title near 60 characters', async () => {
    const name = 'شقة فاخرة واسعة بإطلالة بانورامية على الواجهة البحرية ومسبح خاص';
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue({ ...U12, title: name, district: 'حي الملقا' });

    const title = (await head('u12')).title as string;

    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.endsWith(' — حي الملقا، الرياض | مَمسَى')).toBe(true);
    expect(title.startsWith('شقة فاخرة واسعة')).toBe(true);
    expect(title).toContain('…');
  });

  it("describes the unit from its own description, markup stripped", async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);

    const meta = await head('u12');

    expect(meta.description).toBe(
      'عن الوحدة: شقة عصرية بإطلالة مفتوحة، مناسبة للعائلات وللإقامات الطويلة. المرافق: واي فاي عالي السرعة، تكييف مركزي، مصعد. يُمنع التدخين داخل الوحدة.',
    );
  });

  it('runs list items together without doubling the stop each one ends with', async () => {
    const description = '## وصف مطوّل\n- تفصيل إضافي عن الوحدة.\n- قريب من الخدمات.';
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue({ ...U12, description });

    expect((await head('u12')).description).toBe('وصف مطوّل: تفصيل إضافي عن الوحدة، قريب من الخدمات.');
  });

  it('keeps a long description to about 155 characters, cut between words', async () => {
    const description = 'وصف تجريبي للوحدة. '.repeat(20);
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue({ ...U12, description });

    const text = (await head('u12')).description as string;

    expect(text.length).toBeLessThanOrEqual(156);
    expect(text.endsWith('…')).toBe(true);
    expect(description.startsWith(text.slice(0, -1))).toBe(true);
    expect(description.charAt(text.length - 1)).toBe(' ');
  });

  it('puts a sentence together from the facts when the description is empty', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue({ ...U12, description: '  ' });

    expect((await head('u12')).description).toBe('شقة في الرياض — 2 غرف نوم، حتى 4 ضيوف.');
  });

  it('points canonical at the absolute listing-key URL, whatever the page was opened with', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(BUILDING);

    const canonical = String((await head('39')).alternates?.canonical);

    expect(canonical).toBe(`${SITE_URL}/units/01M19EZRB4ARP4BDGJ4ET7P03F`);
    expect(new URL(canonical).protocol).toBe('https:');
  });

  it('shares the same title, description and cover image on OpenGraph and a large card on X', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);

    const meta = await head('u12');

    expect(meta.openGraph).toEqual({
      title: meta.title,
      description: meta.description,
      // alt: for a screen reader, and for a card whose image didn't load.
      images: [{ url: 'https://cdn.test/u12_full.webp', alt: 'شقة تجريبية — لوحة الشريك' }],
      locale: 'ar_SA',
      type: 'website',
    });
    expect(meta.twitter).toEqual({ card: 'summary_large_image' });
  });

  it('falls back to the site-wide head, without throwing or noindex, when the read fails', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockRejectedValue(new Error('503'));

    const meta: Metadata = await head('u12');

    expect(meta).toEqual({});
    expect(meta.robots).toBeUndefined();
  });

  it('still renders the page, with no redirect, when the read fails', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockRejectedValue(new Error('503'));

    await expect(page('12')).resolves.toBeTruthy();

    expect(permanentRedirect).not.toHaveBeenCalled();
  });
});

describe('unit page — a unit that is not there', () => {
  // A permit that runs out takes the unit off the feed; its page must say so
  // with a real 404, not a 200 that renders "unavailable" in the browser.
  it('answers 404 when the API says the unit is not there', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockRejectedValue(new ApiError(404, 'الوحدة غير متاحة'));

    await expect(page('13')).rejects.toThrow('NEXT_NOT_FOUND');

    expect(notFound).toHaveBeenCalledOnce();
    expect(permanentRedirect).not.toHaveBeenCalled();
  });

  // An outage is not a missing unit: a 404 here would drop live pages from
  // the index over a minute of downtime.
  it.each([
    ['a 503', new ApiError(503, 'Service Unavailable')],
    ['a 500', new ApiError(500, 'Server Error')],
    ['a network failure', new TypeError('fetch failed')],
    ['a timeout', new DOMException('The operation timed out.', 'TimeoutError')],
  ])('renders the page (200) with the site-wide head on %s', async (_, error) => {
    vi.spyOn(unitsApi, 'getForPage').mockRejectedValue(error);

    await expect(page('u12')).resolves.toBeTruthy();
    expect(await head('u12')).toEqual({});

    expect(notFound).not.toHaveBeenCalled();
  });
});

describe('unit page — one read per request', () => {
  it('reads the unit once for the <head> and the page together', async () => {
    const read = vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);

    await head('u12');
    await page('u12');

    expect(read).toHaveBeenCalledOnce();
  });
});

/** A review as the adapter hands it over. */
const review = (n: number): Review => ({
  id: String(n),
  bookingId: '',
  unitId: '12',
  userId: `g${n}`,
  userName: `ضيف ${n}`,
  rating: 5,
  comment: `تعليق ${n}`,
  createdAt: '2026-09-01T10:00:00Z',
});

/** What the page rendered: the view it handed the unit to, and the JSON-LD beside it. */
function partsOf(rendered: ReactNode) {
  const el = rendered as ReactElement;
  const kids = el.type === UnitDetailsPage ? [el] : (Children.toArray(el.props.children) as ReactElement[]);
  const view = kids.find((k) => k.type === UnitDetailsPage) as ReactElement<{
    initialUnit?: Unit;
    serverReviews?: ReactNode;
  }>;
  const script = kids.find((k) => k.type === 'script') as
    | ReactElement<{ type: string; dangerouslySetInnerHTML: { __html: string } }>
    | undefined;
  return { view, script };
}

/** Renders the server's reviews slot the way Next would: the async component inside the Suspense. */
async function renderReviewsSlot(slot: ReactNode) {
  const inner = (slot as ReactElement<{ children: ReactElement }>).props.children;
  const render = inner.type as (props: unknown) => Promise<ReactNode>;
  return render(inner.props);
}

describe('unit page — its content in the first HTML', () => {
  it('hands the view the unit it read, so the view renders it from the start', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);

    const { view } = partsOf(await page('u12'));

    expect(view.props.initialUnit).toMatchObject({ id: '12', listingId: 'u12', title: U12.title });
  });

  // This read may be five minutes old: its price must not reach the browser,
  // not even in the page's source.
  it('hands it over without its price', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);

    const { view } = partsOf(await page('u12'));

    expect(view.props.initialUnit).not.toHaveProperty('pricePerNight');
  });

  it('hands the view nothing when the read failed — it loads in the browser as before', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockRejectedValue(new ApiError(503, 'down'));
    const reviews = vi.spyOn(unitsApi, 'getReviewsForPage');

    const { view, script } = partsOf(await page('u12'));

    expect(view.props.initialUnit).toBeUndefined();
    expect(view.props.serverReviews).toBeUndefined();
    expect(script).toBeUndefined();
    expect(reviews).not.toHaveBeenCalled();
  });
});

describe('unit page — its reviews from the server', () => {
  it("reads the listing's reviews and renders the first ten", async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);
    const read = vi.spyOn(unitsApi, 'getReviewsForPage').mockResolvedValue(Array.from({ length: 12 }, (_, i) => review(i + 1)));

    const { view } = partsOf(await page('u12'));
    const list = (await renderReviewsSlot(view.props.serverReviews)) as ReactElement<{ reviews: Review[] }>;

    expect(read).toHaveBeenCalledWith('u12');
    expect(list.props.reviews.map((r) => r.id)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']);
  });

  // A secondary section must never hold the whole page back.
  it('does not wait for them: a reviews read that never answers leaves the page as fast', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);
    vi.spyOn(unitsApi, 'getReviewsForPage').mockReturnValue(new Promise<Review[]>(() => {}));

    const { view } = partsOf(await page('u12'));

    expect(view.props.initialUnit).toMatchObject({ id: '12', title: U12.title });
  });

  it('renders none when their read fails — the browser fetches them instead', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);
    vi.spyOn(unitsApi, 'getReviewsForPage').mockRejectedValue(new ApiError(500, 'Server Error'));

    const { view } = partsOf(await page('u12'));

    expect(await renderReviewsSlot(view.props.serverReviews)).toBeNull();
  });

  it('renders none when the unit has none yet', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);
    vi.spyOn(unitsApi, 'getReviewsForPage').mockResolvedValue([]);

    const { view } = partsOf(await page('u12'));

    expect(await renderReviewsSlot(view.props.serverReviews)).toBeNull();
  });
});

describe('unit page — BreadcrumbList JSON-LD', () => {
  it('describes the same trail the page shows: home, the listings, this unit at its canonical URL', async () => {
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue(U12);

    const { script } = partsOf(await page('u12'));

    expect(script!.props.type).toBe('application/ld+json');
    expect(JSON.parse(script!.props.dangerouslySetInnerHTML.__html)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'إكتشف وجهتك', item: `${SITE_URL}/units` },
        { '@type': 'ListItem', position: 3, name: 'شقة تجريبية — لوحة الشريك', item: `${SITE_URL}/units/u12` },
      ],
    });
  });

  // The name is the partner's own text, written inside a <script>.
  it("can't be closed early by a unit name that holds markup", async () => {
    const title = '</script><script>alert(1)</script>';
    vi.spyOn(unitsApi, 'getForPage').mockResolvedValue({ ...U12, title });

    const { script } = partsOf(await page('u12'));
    const html = script!.props.dangerouslySetInnerHTML.__html;

    expect(html).not.toContain('<');
    expect(JSON.parse(html).itemListElement[2].name).toBe(title);
  });
});
