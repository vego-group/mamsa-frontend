/**
 * Complaint window — pure, no clock of its own.
 *
 * A guest may complain about a stay from the check-in day until 48 hours
 * after the moment of check-out, on Riyadh time, and only once the booking is
 * `completed`. The backend is what actually refuses (`WINDOW_NOT_OPEN`,
 * `WINDOW_CLOSED`, `BOOKING_NOT_COMPLETED`); this module exists so the button
 * is never offered when that refusal is certain. Without it a guest on mobile
 * data writes the whole description, uploads six photos, and is told no at
 * the end.
 *
 * Boundaries are the property's, not the viewer's — Asia/Riyadh, fixed UTC+3,
 * no DST, the same anchor the cancellation engine uses — so the same instant
 * gives every guest worldwide the same answer, and the server's:
 *
 *   opens  = check-in date at 00:00 Riyadh
 *   closes = the check-out INSTANT + 48h, inclusive
 *
 * The check-out instant is the booking's `end_date` at the UNIT's check-out
 * hour — the backend counts from `checkout_time` of the unit on the booking,
 * not from a platform constant and not from midnight of the check-out day
 * (2026-09-07). A 12:00 unit checked out on 2026-09-04 therefore closes at
 * 2026-09-06T12:00+03:00; a 13:00 unit on the same date is still open at
 * 12:30. The hour reaches this module already resolved on the booking
 * (`checkOutTime`, with the adapters' 12:00 fallback for a unit that sets
 * none); nothing here invents one. A full datetime in `checkOutDate`, if the
 * API ever sends one, is honoured as the instant it names and the hour is
 * ignored; a datetime without a zone is read as Riyadh.
 */
import type { Booking } from '@/types';
import { PROPERTY_UTC_OFFSET_HOURS } from '@/lib/cancellation/engine';

export const COMPLAINT_WINDOW_HOURS_AFTER_CHECKOUT = 48;

const MS_PER_HOUR = 60 * 60 * 1000;
const RIYADH_OFFSET = `+${String(PROPERTY_UTC_OFFSET_HOURS).padStart(2, '0')}:00`;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^\d{2}:\d{2}$/;
const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Why the button is or isn't there.
 *   - `not_completed`: the booking isn't `completed` — the dates are irrelevant.
 *   - `not_open`:      completed, but the stay hasn't started (or a date is unreadable).
 *   - `open`:          the guest may submit.
 *   - `closed`:        48 hours after check-out have passed — show the "deadline
 *                      passed" note in a neutral tone; it isn't an error.
 */
export type ComplaintWindow = 'not_completed' | 'not_open' | 'open' | 'closed';

export type ComplaintWindowBooking = Pick<
  Booking,
  'status' | 'checkInDate' | 'checkOutDate' | 'checkOutTime'
>;

/**
 * Epoch ms of a booking date on Riyadh time — a bare date at 00:00, a full
 * datetime as itself. NaN when the string is unreadable.
 */
export function riyadhInstant(value: string): number {
  const s = value.trim();
  if (DATE_ONLY.test(s)) return Date.parse(`${s}T00:00:00${RIYADH_OFFSET}`);
  // "2026-09-06 15:00:00" (Laravel's default cast) → ISO; zone-less means Riyadh.
  const iso = s.replace(' ', 'T');
  return Date.parse(HAS_ZONE.test(iso) ? iso : `${iso}${RIYADH_OFFSET}`);
}

/**
 * The instant the stay ended: the check-out date at the unit's check-out hour
 * ("HH:mm", Riyadh). A `checkOutDate` that is already a full datetime names
 * the moment itself and is taken as is. NaN when either part is unreadable.
 */
export function checkOutInstant(checkOutDate: string, checkOutTime: string): number {
  const date = checkOutDate.trim();
  if (!DATE_ONLY.test(date)) return riyadhInstant(date);
  const time = checkOutTime.trim();
  if (!HHMM.test(time)) return NaN;
  return Date.parse(`${date}T${time}:00${RIYADH_OFFSET}`);
}

export interface ComplaintWindowBounds {
  /** Epoch ms. NaN when the date is unreadable. */
  opensAt: number;
  /** Epoch ms, inclusive: check-out instant + 48h. NaN when the date or hour is unreadable. */
  closesAt: number;
}

export function complaintWindowBounds(
  booking: Pick<ComplaintWindowBooking, 'checkInDate' | 'checkOutDate' | 'checkOutTime'>,
): ComplaintWindowBounds {
  return {
    opensAt: riyadhInstant(booking.checkInDate),
    closesAt:
      checkOutInstant(booking.checkOutDate, booking.checkOutTime) +
      COMPLAINT_WINDOW_HOURS_AFTER_CHECKOUT * MS_PER_HOUR,
  };
}

export function complaintWindowFor(booking: ComplaintWindowBooking, now: Date): ComplaintWindow {
  if (booking.status !== 'completed') return 'not_completed';
  const { opensAt, closesAt } = complaintWindowBounds(booking);
  // An unreadable date or hour hides the button rather than guessing either way.
  if (Number.isNaN(opensAt) || Number.isNaN(closesAt)) return 'not_open';
  const t = now.getTime();
  if (t < opensAt) return 'not_open';
  if (t > closesAt) return 'closed';
  return 'open';
}

/** `now >= check_in && now <= check_out + 48h`, on Riyadh time, on a completed booking. */
export function canSubmitComplaint(booking: ComplaintWindowBooking, now: Date): boolean {
  return complaintWindowFor(booking, now) === 'open';
}
