import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import { LocationExplorer, type LocationUnit } from './LocationExplorer';

/** Leaflet needs a real browser; the map itself is not what these assert on. */
const dragging = vi.fn();
vi.mock('next/dynamic', () => ({
  default: () => {
    const Stub = (props: { dragging?: boolean }) => {
      dragging(props.dragging);
      return <div data-map="" />;
    };
    return Stub;
  },
}));

function pointer(coarse: boolean) {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: coarse }));
}

const UNITS: LocationUnit[] = [
  { id: 'U-1', title: 'شقة', price: 900, lat: 24.7, lng: 46.6, city: 'الرياض', district: 'الملقا', image: '/a.jpg', rating: 4.6, reviewCount: 8 },
  { id: 'U-2', title: 'استوديو', price: 500, lat: 24.8, lng: 46.7, city: 'الرياض', district: 'العليا', image: '/b.jpg', rating: 0, reviewCount: 0 },
];

function renderExplorer(fullBleed = false) {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <LocationExplorer units={UNITS} fullBleed={fullBleed} />
    </NextIntlClientProvider>,
  );
}

/** The map's own box — the element that carries the ordering classes. */
function mapBox(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('[data-map]')!.parentElement!;
}

/** The listings, which share the grid with the map. */
function listBox(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('a')!.parentElement!;
}

beforeEach(() => {
  dragging.mockClear();
  pointer(false);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('map explorer layout', () => {
  it('puts the map before the listings on a phone', () => {
    const { container } = renderExplorer();
    // "Map view" used to open on a 460px scrolling list, with the map below it.
    expect(mapBox(container).className).toContain('order-1');
    expect(listBox(container).className).toContain('order-2');
  });

  it('turns the listings into a swipeable strip below the map', () => {
    const { container } = renderExplorer();
    const list = listBox(container).className;
    expect(list).toContain('overflow-x-auto');
    // …and back into a column beside the map on a wide screen.
    expect(list).toContain('lg:flex-col');
    expect(list).toContain('lg:order-1');
  });

  it('gives the results page’s map view the taller frame', () => {
    const { container } = renderExplorer(true);
    expect(mapBox(container).className).toContain('min-h-[70dvh]');
  });
});

describe('map explorer — competing with the page for a swipe', () => {
  it('leaves the map draggable where there is a mouse', () => {
    renderExplorer();
    expect(dragging).toHaveBeenLastCalledWith(true);
    expect(screen.queryByText(arMessages.map.tapToMove)).toBeNull();
  });

  it('holds the drag back on a touch screen until it is asked for', () => {
    pointer(true);
    renderExplorer();
    expect(dragging).toHaveBeenLastCalledWith(false);
    expect(screen.getByText(arMessages.map.tapToMove)).toBeTruthy();
  });

  it('hands the map its drag once the guest taps it', () => {
    pointer(true);
    renderExplorer();
    fireEvent.click(screen.getByText(arMessages.map.tapToMove));
    expect(dragging).toHaveBeenLastCalledWith(true);
    expect(screen.queryByText(arMessages.map.tapToMove)).toBeNull();
  });

  it('never gates the results page’s map view — the map is the page there', () => {
    pointer(true);
    renderExplorer(true);
    expect(dragging).toHaveBeenLastCalledWith(true);
    expect(screen.queryByText(arMessages.map.tapToMove)).toBeNull();
  });
});
