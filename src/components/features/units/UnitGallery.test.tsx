import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import { UnitGallery } from './UnitGallery';
import type { UnitImage } from '@/types';

function images(n: number): UnitImage[] {
  return Array.from({ length: n }, (_, i) => ({
    url: `/p${i}.jpg`,
    thumb: `/p${i}-t.jpg`,
    card: `/p${i}-c.jpg`,
    full: `/p${i}-f.jpg`,
    width: null,
    height: null,
  }));
}

function renderGallery(n = 6) {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <UnitGallery images={images(n)} title="شقة في الملقا" />
    </NextIntlClientProvider>,
  );
}

/** The horizontal strip the phone swipes through. */
function strip(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('.snap-x')!;
}

/** The lightbox's own root, absent until a photo is opened. */
function lightbox(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>('.fixed.z-\\[80\\]');
}

function openLightbox(container: HTMLElement) {
  fireEvent.click(strip(container).querySelectorAll('button')[0]!);
}

/** The lightbox stage, which owns the swipe. */
function stage(container: HTMLElement): HTMLElement {
  return container.querySelector<HTMLElement>('.touch-pan-y')!;
}

function swipe(el: HTMLElement, from: number, to: number) {
  fireEvent.touchStart(el, { changedTouches: [{ clientX: from }] });
  fireEvent.touchEnd(el, { changedTouches: [{ clientX: to }] });
}

/** How the lightbox counts where it is, e.g. "3 / 6". */
function counter(container: HTMLElement): string {
  return lightbox(container)!.querySelector('.tabular-nums')!.textContent!.trim();
}

afterEach(cleanup);

describe('gallery on a phone', () => {
  it('puts every photo in the strip, not just a hero', () => {
    const { container } = renderGallery(6);
    expect(strip(container).querySelectorAll('button')).toHaveLength(6);
  });

  it('loads only the first photo up front', () => {
    const { container } = renderGallery(6);
    const imgs = strip(container).querySelectorAll('img');
    expect(imgs[0]!.getAttribute('loading')).toBe('eager');
    expect(imgs[1]!.getAttribute('loading')).toBe('lazy');
    expect(imgs[5]!.getAttribute('loading')).toBe('lazy');
  });

  it('offers "show all photos" — the button used to be desktop-only', () => {
    const { container } = renderGallery(6);
    const button = screen.getByText(arMessages.gallery.showAll.replace('{count}', '6'));
    expect(button.closest('button')!.className).not.toContain('md:inline-flex');
    expect(container).toBeTruthy();
  });

  it('caps the dots so a big listing does not draw one per photo', () => {
    const { container } = renderGallery(30);
    const dots = container.querySelectorAll('.pointer-events-none .rounded-full.bg-white');
    expect(dots.length).toBeLessThanOrEqual(8);
  });

  it('draws no counter or dots for a single-photo listing', () => {
    const { container } = renderGallery(1);
    expect(container.textContent).not.toContain('/');
    expect(container.querySelector('.pointer-events-none')).toBeNull();
  });
});

describe('gallery lightbox — swiping between photos', () => {
  it('advances when the guest drags towards the left', () => {
    const { container } = renderGallery(6);
    openLightbox(container);
    expect(counter(container)).toBe('1 / 6');
    swipe(stage(container), 300, 100);
    expect(counter(container)).toBe('2 / 6');
  });

  it('goes back when the drag is the other way, wrapping around the ends', () => {
    const { container } = renderGallery(6);
    openLightbox(container);
    swipe(stage(container), 100, 300);
    expect(counter(container)).toBe('6 / 6');
  });

  it('ignores a drag too short to be a swipe', () => {
    const { container } = renderGallery(6);
    openLightbox(container);
    swipe(stage(container), 300, 280);
    expect(counter(container)).toBe('1 / 6');
  });

  it('does not close the lightbox on the tap that ends a swipe', () => {
    const { container } = renderGallery(6);
    openLightbox(container);
    swipe(stage(container), 300, 100);
    fireEvent.click(stage(container));
    expect(lightbox(container)).toBeTruthy();
  });

  it('still closes on a plain tap of the backdrop', () => {
    const { container } = renderGallery(6);
    openLightbox(container);
    fireEvent.click(stage(container));
    expect(lightbox(container)).toBeNull();
  });
});
