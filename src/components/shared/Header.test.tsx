import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../messages/ar.json';
import { Header } from './Header';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  // The language toggle in the actions row reaches for the router.
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <Header />
    </NextIntlClientProvider>,
  );
}

/** Anything Tailwind would take off the screen below a breakpoint. */
function isHiddenOnMobile(el: HTMLElement): boolean {
  return el.className.split(' ').includes('hidden');
}

afterEach(cleanup);

describe('Header — the way in for a property owner', () => {
  it('shows "سجّل عقارك" at phone width', () => {
    renderHeader();
    const cta = screen.getByText(arMessages.nav.listProperty).closest('a')!;
    // It used to be `hidden sm:inline-flex`: invisible to the very visitor it
    // is aimed at, unless they thought to open the drawer.
    expect(isHiddenOnMobile(cta)).toBe(false);
    expect(isHiddenOnMobile(cta.parentElement!)).toBe(false);
  });

  it('points that button at the partner sign-up flow', () => {
    renderHeader();
    expect(screen.getByText(arMessages.nav.listProperty).closest('a')!.getAttribute('href'))
      .toBe('/host');
  });

  it('keeps the hamburger a full-sized touch target', () => {
    renderHeader();
    const burger = screen.getByLabelText(arMessages.nav.menu);
    expect(burger.className).toContain('h-11');
    expect(burger.className).toContain('w-11');
  });
});
