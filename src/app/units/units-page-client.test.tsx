import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../messages/ar.json';
import { UnitsPageClient } from './units-page-client';
import { unitsApi } from '@/lib/api/client';
import type { Unit } from '@/types';

/** The search URL under test — reassigned per case. */
let searchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ push: vi.fn() }),
}));

function stay(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function unit(i: number): Unit {
  return {
    id: `U-${i}`,
    ownerId: 'O-1',
    ownerName: 'فهد',
    ownerType: 'individual',
    ownerVerified: true,
    ownerAvatarUrl: null,
    title: `وحدة رقم ${i}`,
    description: '',
    type: 'apartment',
    status: 'approved',
    city: 'الرياض',
    district: 'الملقا',
    country: 'السعودية',
    latitude: 24.7,
    longitude: 46.6,
    pricePerNight: 900,
    capacity: 4,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    amenities: [],
    images: [{ url: '/a.jpg', card: '/a.jpg', full: '/a.jpg', thumb: '/a.jpg', width: null, height: null }],
    rating: 4.6,
    reviewCount: 8,
    checkInTime: '15:00',
    checkOutTime: '12:00',
    cancellationPolicy: 'flexible',
    createdAt: '2026-08-01',
  } as Unit;
}

/** A Riyadh host's whole portfolio, the case that broke the page. */
const PORTFOLIO = Array.from({ length: 120 }, (_, i) => unit(i));

let listSpy: MockInstance<typeof unitsApi.listPage>;

/** Serves `PORTFOLIO` the way the API's paginator would. */
function paginate(rows: Unit[] = PORTFOLIO) {
  return async (filter: Parameters<typeof unitsApi.listPage>[0] = {}) => {
    const perPage = filter.perPage ?? 12;
    const lastPage = Math.max(1, Math.ceil(rows.length / perPage));
    const page = Math.min(Math.max(filter.page ?? 1, 1), lastPage);
    return {
      units: rows.slice((page - 1) * perPage, page * perPage),
      page,
      lastPage,
      total: rows.length,
    };
  };
}

async function renderPage() {
  const view = render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <UnitsPageClient />
    </NextIntlClientProvider>,
  );
  await act(async () => {});
  return view;
}

/**
 * The sort dropdown. Found by the value it is showing, not by position: the
 * search bar contributes three comboboxes of its own ahead of it.
 */
function sortTrigger(): HTMLButtonElement {
  return Array.from(document.body.querySelectorAll<HTMLButtonElement>('button[role="combobox"]')).find(
    (b) => b.textContent?.includes(arMessages.unitsPage.sort.recommended),
  )!;
}

/** The filter panel's radios, which only the sidebar renders. */
function radios(container: HTMLElement, name: 'type' | 'rating'): HTMLInputElement[] {
  return Array.from(container.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`));
}

/** Result cards on screen, addressed by the title each fixture carries. */
function cardCount(container: HTMLElement): number {
  return container.querySelectorAll('h3').length;
}

beforeEach(() => {
  searchParams = new URLSearchParams();
  listSpy = vi.spyOn(unitsApi, 'listPage').mockImplementation(paginate());
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('search results — the guest’s dates', () => {
  it('hands the stay to the API, so booked units never reach the list', async () => {
    searchParams = new URLSearchParams({ city: 'الرياض', start: stay(3), end: stay(6) });
    await renderPage();
    expect(listSpy).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: stay(3), endDate: stay(6) }),
    );
  });

  it('says the list is filtered to that stay', async () => {
    searchParams = new URLSearchParams({ start: stay(3), end: stay(6) });
    const { container } = await renderPage();
    expect(container.textContent).toContain('متاحة لإقامتك');
  });

  it('ignores a half-picked range rather than querying a nonsense stay', async () => {
    searchParams = new URLSearchParams({ start: stay(3) });
    await renderPage();
    expect(listSpy).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: undefined, endDate: undefined }),
    );
  });

  it('ignores a backwards range', async () => {
    searchParams = new URLSearchParams({ start: stay(6), end: stay(3) });
    await renderPage();
    expect(listSpy).toHaveBeenCalledWith(
      expect.objectContaining({ startDate: undefined, endDate: undefined }),
    );
  });

  it('nudges a dateless search towards picking dates', async () => {
    const { container } = await renderPage();
    expect(container.textContent).toContain(arMessages.unitsPage.pickDatesHint);
  });
});

describe('search results — a large portfolio', () => {
  it('asks the API for one page, not the whole catalogue', async () => {
    const { container } = await renderPage();
    expect(listSpy).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1, perPage: 24 }));
    expect(cardCount(container)).toBe(24);
  });

  it('fetches the next page and appends it', async () => {
    const { container } = await renderPage();
    fireEvent.click(screen.getByText(/عرض المزيد/));
    await act(async () => {});
    expect(listSpy).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    // Appended, not replaced — the guest keeps what they were already reading.
    expect(cardCount(container)).toBe(48);
  });

  it('stops offering more on the last page', async () => {
    listSpy.mockImplementation(paginate(PORTFOLIO.slice(0, 10)));
    const { container } = await renderPage();
    expect(cardCount(container)).toBe(10);
    expect(screen.queryByText(/عرض المزيد/)).toBeNull();
  });

  it('counts the paginator’s total, not the rows currently loaded', async () => {
    const { container } = await renderPage();
    expect(cardCount(container)).toBe(24);
    expect(container.textContent).toContain(
      arMessages.unitsPage.available.replace('{count}', '120'),
    );
  });

  it('starts again at page one when the query changes', async () => {
    const { container } = await renderPage();
    fireEvent.click(screen.getByText(/عرض المزيد/));
    await act(async () => {});
    expect(cardCount(container)).toBe(48);

    fireEvent.click(radios(container, 'type')[1]!);
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
    // A new filter is a new result set — page two of the old one must not survive.
    expect(cardCount(container)).toBe(24);
    expect(listSpy).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }));
  });
});

describe('search results — filters the API is asked to do', () => {
  /** The debounce between the panel moving and the request going out. */
  async function settle() {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 300));
    });
  }

  it('asks the API for the type and rating, rather than only trimming locally', async () => {
    const { container } = await renderPage();
    fireEvent.click(radios(container, 'type')[1]!); // 'all' → 'apartment'
    fireEvent.click(radios(container, 'rating')[1]!); // 4 stars and up
    await settle();
    expect(listSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'apartment', minRating: 4 }),
    );
  });

  it('leaves untouched filters out of the query instead of sending defaults', async () => {
    await renderPage();
    expect(listSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        minPrice: undefined,
        maxPrice: undefined,
        minRating: undefined,
        amenities: undefined,
        type: undefined,
      }),
    );
  });

  it('sends a sort the API knows, and keeps "recommended" to itself', async () => {
    await renderPage();
    // The default ranking is ours — featured first, then review count.
    expect(listSpy).toHaveBeenLastCalledWith(expect.objectContaining({ sort: undefined }));

    fireEvent.click(sortTrigger());
    fireEvent.click(
      screen.getAllByText(arMessages.unitsPage.sort.price_asc).at(-1)!.closest('button')!,
    );
    await settle();
    expect(listSpy).toHaveBeenLastCalledWith(expect.objectContaining({ sort: 'price_asc' }));
  });

  it('does not fire a request per pixel of the price slider', async () => {
    const { container } = await renderPage();
    const calls = listSpy.mock.calls.length;
    // Three moves inside one debounce window are one request, not three.
    const stars = radios(container, 'rating');
    fireEvent.click(stars[0]!);
    fireEvent.click(stars[1]!);
    fireEvent.click(stars[2]!);
    await settle();
    expect(listSpy.mock.calls.length).toBe(calls + 1);
  });
});

describe('search results — the filters panel', () => {
  it('can reach every amenity, not just the first six', async () => {
    await renderPage();
    const all = screen.getAllByText(
      arMessages.unitsPage.filters.showAllAmenities.replace('{count}', '15'),
    );
    expect(all.length).toBeGreaterThan(0);
    expect(screen.queryByText(arMessages.amenities.elevator)).toBeNull();

    fireEvent.click(all[0]!.closest('button')!);
    expect(screen.getAllByText(arMessages.amenities.elevator).length).toBeGreaterThan(0);
  });
});
