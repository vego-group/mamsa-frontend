/**
 * The window is the part of this feature most likely to be wrong by an hour
 * or a day, so every boundary below is pinned as an instant on the wire
 * (UTC), which is the only thing a viewer's machine timezone cannot move.
 */
import { describe, expect, it } from 'vitest';
import {
  COMPLAINT_WINDOW_HOURS_AFTER_CHECKOUT,
  canSubmitComplaint,
  checkOutInstant,
  complaintWindowBounds,
  complaintWindowFor,
  riyadhInstant,
} from './window';

// Check-in 2026-09-01, check-out 2026-09-04 (three nights) from a unit whose
// check-out hour is 12:00. Riyadh is UTC+3, so on the wire:
//   opens       2026-09-01T00:00+03:00   = 2026-08-31T21:00:00Z
//   checks out  2026-09-04T12:00+03:00   = 2026-09-04T09:00:00Z
//   closes      check-out + 48h          = 2026-09-06T12:00+03:00 = 2026-09-06T09:00:00Z
const stay = {
  status: 'completed' as const,
  checkInDate: '2026-09-01',
  checkOutDate: '2026-09-04',
  checkOutTime: '12:00',
};
const OPENS = Date.parse('2026-08-31T21:00:00Z');
const CHECKS_OUT = Date.parse('2026-09-04T09:00:00Z');
const CLOSES = Date.parse('2026-09-06T09:00:00Z');
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

describe('complaint window — the booking must be completed', () => {
  it.each(['pending_payment', 'confirmed', 'cancelled'] as const)(
    'is never open on a %s booking, even mid-stay',
    (status) => {
      expect(complaintWindowFor({ ...stay, status }, new Date('2026-09-02T12:00:00Z'))).toBe(
        'not_completed',
      );
    },
  );

  it('a completed booking inside its dates is open', () => {
    expect(complaintWindowFor(stay, new Date('2026-09-02T12:00:00Z'))).toBe('open');
  });
});

describe('complaint window — opens at Riyadh midnight on the check-in day', () => {
  it('one minute before is not open', () => {
    expect(complaintWindowFor(stay, new Date(OPENS - MINUTE))).toBe('not_open');
  });

  it('opens at exactly that instant', () => {
    expect(complaintWindowFor(stay, new Date(OPENS))).toBe('open');
  });

  it('is still open half an hour later — which is Aug 31 in UTC and in every timezone west of it', () => {
    expect(complaintWindowFor(stay, new Date('2026-08-31T21:30:00Z'))).toBe('open');
  });
});

describe('complaint window — closes 48h after the check-out INSTANT, inclusive', () => {
  it('the check-out instant is the check-out date at the unit’s check-out hour', () => {
    expect(checkOutInstant(stay.checkOutDate, stay.checkOutTime)).toBe(CHECKS_OUT);
  });

  it('a 12:00 unit closes its window at 12:00 two days later — not at midnight', () => {
    // 11:59 Riyadh on the 6th → open; 12:00 sharp → still open (now <= check_out + 48h); 12:01 → closed.
    expect(complaintWindowFor(stay, new Date('2026-09-06T08:59:00Z'))).toBe('open');
    expect(complaintWindowFor(stay, new Date('2026-09-06T09:00:00Z'))).toBe('open');
    expect(complaintWindowFor(stay, new Date('2026-09-06T09:01:00Z'))).toBe('closed');
  });

  it('is still open all through the night before — midnight-anchored maths would have shut it at 00:00', () => {
    // 2026-09-06T00:00+03:00 is 2026-09-05T21:00Z: twelve hours of window left, not zero.
    expect(complaintWindowFor(stay, new Date('2026-09-05T21:00:00Z'))).toBe('open');
    // 08:00 Riyadh on the 6th — the guest's last morning to file.
    expect(complaintWindowFor(stay, new Date('2026-09-06T05:00:00Z'))).toBe('open');
  });

  it('is exactly 48 hours from the check-out instant, no more', () => {
    expect(CLOSES - CHECKS_OUT).toBe(COMPLAINT_WINDOW_HOURS_AFTER_CHECKOUT * HOUR);
    expect(complaintWindowFor(stay, new Date(CLOSES - MINUTE))).toBe('open');
    expect(complaintWindowFor(stay, new Date(CLOSES + MINUTE))).toBe('closed');
  });
});

describe('complaint window — the unit’s own check-out hour drives the close, not a platform constant', () => {
  const unit13 = { ...stay, checkOutTime: '13:00' }; // closes 2026-09-06T13:00+03:00 = 10:00Z
  const unit10 = { ...stay, checkOutTime: '10:00' }; // closes 2026-09-06T10:00+03:00 = 07:00Z

  it('at 12:30 on the second day a 13:00 unit is still open while the 12:00 unit has closed', () => {
    const halfPastTwelve = new Date('2026-09-06T09:30:00Z'); // 12:30 Riyadh
    expect(complaintWindowFor(stay, halfPastTwelve)).toBe('closed');
    expect(complaintWindowFor(unit13, halfPastTwelve)).toBe('open');
  });

  it('the 13:00 unit closes at 13:00, inclusive', () => {
    expect(checkOutInstant(unit13.checkOutDate, unit13.checkOutTime)).toBe(
      Date.parse('2026-09-04T10:00:00Z'),
    );
    expect(complaintWindowFor(unit13, new Date('2026-09-06T10:00:00Z'))).toBe('open');
    expect(complaintWindowFor(unit13, new Date('2026-09-06T10:01:00Z'))).toBe('closed');
  });

  it('an earlier check-out closes earlier: a 10:00 unit is shut by 10:01', () => {
    expect(complaintWindowFor(unit10, new Date('2026-09-06T06:59:00Z'))).toBe('open');
    expect(complaintWindowFor(unit10, new Date('2026-09-06T07:01:00Z'))).toBe('closed');
    // …while the 12:00 and 13:00 units are both still open at that moment.
    expect(complaintWindowFor(stay, new Date('2026-09-06T07:01:00Z'))).toBe('open');
    expect(complaintWindowFor(unit13, new Date('2026-09-06T07:01:00Z'))).toBe('open');
  });

  it('the bounds move with the hour', () => {
    expect(complaintWindowBounds(unit13).closesAt - complaintWindowBounds(stay).closesAt).toBe(
      HOUR,
    );
  });
});

describe('complaint window — dates are read on Riyadh time, never the machine clock', () => {
  it('anchors a bare check-in date at 00:00 +03:00', () => {
    expect(riyadhInstant('2026-09-01')).toBe(OPENS);
  });

  it('reads a zone-less Laravel timestamp as Riyadh', () => {
    expect(riyadhInstant('2026-09-04 12:00:00')).toBe(CHECKS_OUT);
  });

  it('a full check-out timestamp names the moment itself — the unit hour is then ignored', () => {
    // A 14:00 timestamp closes at 14:00 two days on even though the unit says 12:00.
    const timed = { ...stay, checkOutDate: '2026-09-04T14:00:00+03:00' };
    expect(checkOutInstant(timed.checkOutDate, timed.checkOutTime)).toBe(
      Date.parse('2026-09-04T11:00:00Z'),
    );
    expect(complaintWindowFor(timed, new Date('2026-09-06T11:00:00Z'))).toBe('open');
    expect(complaintWindowFor(timed, new Date('2026-09-06T11:01:00Z'))).toBe('closed');
  });

  it('honours a full check-in datetime too', () => {
    const timed = { ...stay, checkInDate: '2026-09-01T15:00:00+03:00' };
    // Opens 12:00Z on the 1st (15:00 Riyadh).
    expect(complaintWindowFor(timed, new Date('2026-09-01T11:59:00Z'))).toBe('not_open');
    expect(complaintWindowFor(timed, new Date('2026-09-01T12:00:00Z'))).toBe('open');
  });

  it('hides the button on an unreadable date or hour rather than guessing either way', () => {
    expect(riyadhInstant('soon')).toBeNaN();
    expect(checkOutInstant('soon', '12:00')).toBeNaN();
    expect(checkOutInstant('2026-09-04', 'noon')).toBeNaN();
    expect(complaintWindowFor({ ...stay, checkOutDate: 'soon' }, new Date(OPENS + MINUTE))).toBe(
      'not_open',
    );
    expect(complaintWindowFor({ ...stay, checkOutTime: '' }, new Date(OPENS + MINUTE))).toBe(
      'not_open',
    );
    expect(complaintWindowFor({ ...stay, checkInDate: '' }, new Date(OPENS + MINUTE))).toBe(
      'not_open',
    );
  });
});

describe('complaintWindowBounds / canSubmitComplaint', () => {
  it('exposes the two instants the UI can schedule against', () => {
    expect(complaintWindowBounds(stay)).toEqual({ opensAt: OPENS, closesAt: CLOSES });
  });

  it('canSubmitComplaint is true only while open', () => {
    expect(canSubmitComplaint(stay, new Date(OPENS - MINUTE))).toBe(false);
    expect(canSubmitComplaint(stay, new Date(OPENS))).toBe(true);
    expect(canSubmitComplaint(stay, new Date(CLOSES))).toBe(true);
    expect(canSubmitComplaint(stay, new Date(CLOSES + MINUTE))).toBe(false);
    expect(canSubmitComplaint({ ...stay, status: 'confirmed' }, new Date(OPENS + MINUTE))).toBe(
      false,
    );
  });
});
