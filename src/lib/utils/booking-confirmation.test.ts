/**
 * The printable confirmation is the paper a guest may hand over at arrival,
 * so in a building it has to name the door they were given.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadBookingConfirmation } from './booking-confirmation';
import { getPolicyByTemplate } from '@/lib/constants/cancellation-policies';
import type { Booking } from '@/types';

function booking(apartmentNo?: string): Booking {
  return {
    id: '101',
    code: 'TESTCODE',
    unitId: 'U-005-2',
    unitSnapshot: {
      title: 'منتجع العائلة السعيدة',
      city: 'الرياض',
      country: 'السعودية',
      imageUrl: '',
      ownerName: 'مالك',
      ...(apartmentNo === undefined ? {} : { apartmentNo }),
    },
    userId: 'CURRENT_USER',
    status: 'confirmed',
    checkInDate: '2026-10-10',
    checkOutDate: '2026-10-13',
    checkOutTime: '12:00',
    nights: 3,
    guests: { adults: 2, children: 0 },
    price: { pricePerNight: 1000, nights: 3, gross: 3000, netBase: 2608.7, vat: 391.3 },
    policySnapshot: getPolicyByTemplate('flexible'),
    isReviewed: false,
    createdAt: '2026-09-01T00:00:00Z',
  };
}

/** Captures the document the function writes into the new window. */
function printed(b: Booking): string {
  let html = '';
  vi.spyOn(window, 'open').mockReturnValue({
    document: { write: (s: string) => (html += s), close: () => {} },
  } as unknown as Window);
  downloadBookingConfirmation(b);
  return html;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('printable booking confirmation', () => {
  it('names the door under the unit', () => {
    expect(printed(booking('2'))).toContain('شقة رقم 2');
  });

  it('has no door line for a standalone unit', () => {
    expect(printed(booking())).not.toContain('شقة رقم');
  });

  it('escapes the door number — it is partner-entered text written into HTML', () => {
    const html = printed(booking('<img src=x onerror=alert(1)>'));
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escapes every server-supplied field, not just the door number', () => {
    const b = booking();
    const html = printed({
      ...b,
      id: '<i>id</i>',
      code: '</title><script>alert(1)</script>',
      unitSnapshot: {
        ...b.unitSnapshot,
        title: '<img src=x onerror=alert(2)>',
        city: '<b>city</b>',
        country: '<u>country</u>',
        ownerName: '"><svg onload=alert(3)>',
      },
    });

    // (The document's own `<script>` that calls print() is expected; the
    // injected one is not.)
    for (const raw of ['<i>id</i>', '<script>alert', '<img src=x', '<b>city</b>', '<u>country</u>', '<svg']) {
      expect(html).not.toContain(raw);
    }
    expect(html).toContain('&lt;img src=x onerror=alert(2)&gt;');
    expect(html).toContain('&lt;b&gt;city&lt;/b&gt;');
    expect(html).toContain('&quot;&gt;&lt;svg onload=alert(3)&gt;');
    expect(html).toContain('&lt;/title&gt;&lt;script&gt;');
  });
});
