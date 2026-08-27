'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/** The stay a guest is shopping for: arrival, departure, party size. */
export interface Stay {
  /** YYYY-MM-DD, or '' when nothing is picked yet. */
  start: string;
  end: string;
  guests: number;
}

const EMPTY_STAY: Stay = { start: '', end: '', guests: 1 };

interface SearchState extends Stay {
  setStay: (patch: Partial<Stay>) => void;
  reset: () => void;
}

/**
 * The dates and party size follow the guest around the site: picked once on the
 * search bar, they arrive prefilled on every listing they open. Without this the
 * hero bar's dates die at the first click and the booking widget asks for them
 * again on each unit.
 */
export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      ...EMPTY_STAY,
      setStay: (patch) => set(patch),
      reset: () => set(EMPTY_STAY),
    }),
    {
      name: 'mamsa.stay',
      // Session-scoped on purpose: this is the trip being planned right now.
      // Dates parked in localStorage for a fortnight come back already expired
      // and silently disable the book button on every listing.
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

/** Local calendar day as YYYY-MM-DD — the floor for any date a guest may pick. */
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Drops anything a booking widget would refuse: malformed dates, a stay that
 * has already started, a departure on or before the arrival. Carrying those
 * over would prefill the widget with a range it immediately rejects — worse
 * than leaving it empty. Both the store and URL params are user-editable, so
 * everything read out of them goes through here.
 */
export function sanitizeStay(raw: Partial<Stay>, today = todayISO()): Stay {
  const guests = Math.max(1, Math.floor(Number(raw.guests)) || 1);
  const rawStart = raw.start ?? '';
  const rawEnd = raw.end ?? '';
  const start = ISO_DATE.test(rawStart) && rawStart >= today ? rawStart : '';
  // A departure without an arrival is meaningless — it goes with the start.
  const end = start && ISO_DATE.test(rawEnd) && rawEnd > start ? rawEnd : '';
  return { start, end, guests };
}

/** `?start=…&end=…&guests=…` for a stay — '' when there is nothing to carry. */
export function stayQuery(stay: Stay): string {
  const q = new URLSearchParams();
  if (stay.start) q.set('start', stay.start);
  if (stay.end) q.set('end', stay.end);
  if (stay.guests > 1) q.set('guests', String(stay.guests));
  const qs = q.toString();
  return qs ? `?${qs}` : '';
}

/**
 * The stay in flight, as link params to hang off a unit href, so a listing
 * opened from a dated search arrives carrying those dates — and the URL stays
 * shareable and survives a reload.
 *
 * Empty on the server and on the first client render: the stay lives in
 * sessionStorage, and reading it before hydration would make every unit href
 * disagree with the server-rendered markup.
 */
export function useStayQuery(): string {
  const [hydrated, setHydrated] = useState(false);
  const start = useSearchStore((s) => s.start);
  const end = useSearchStore((s) => s.end);
  const guests = useSearchStore((s) => s.guests);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) return '';
  return stayQuery(sanitizeStay({ start, end, guests }));
}
