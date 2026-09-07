'use client';

/**
 * Everything about a complaint on one booking, in one card: the button while
 * the window is open, the neutral "deadline passed" note once it isn't, and
 * the status view once a complaint exists. Mount it for completed bookings
 * only — a complaint can be filed on nothing else.
 *
 * The local window check is a courtesy to the guest; the backend is the
 * authority. When the two disagree the API's answer wins: `WINDOW_CLOSED`
 * turns the card into the deadline note, `COMPLAINT_ALREADY_EXISTS` shows
 * the existing complaint, and the two "shouldn't have been offered" codes
 * ask the page to refetch the booking they were computed from.
 */
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/separator';
import { ComplaintDialog } from './ComplaintDialog';
import { ComplaintStatusCard } from './ComplaintStatusCard';
import {
  complaintsApi,
  type SubmitComplaintInput,
  type SubmitComplaintResult,
} from '@/lib/api/client';
import {
  complaintWindowBounds,
  complaintWindowFor,
  type ComplaintWindow,
} from '@/lib/complaints/window';
import { showToast } from '@/stores/toast';
import type { Booking, GuestComplaint } from '@/types';

interface BookingComplaintSectionProps {
  booking: Booking;
  /** The booking on screen is stale — the API says it isn't completed, or the stay hasn't started. Refetch it. */
  onBookingStale: () => void;
}

interface LoadState {
  load: 'loading' | 'ready' | 'error';
  /** A re-read with data already on screen — the card stays, the reload button spins. */
  refreshing: boolean;
}

// setTimeout overflows past ~24.8 days; nothing needs re-checking that far out anyway.
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

export function BookingComplaintSection({ booking, onBookingStale }: BookingComplaintSectionProps) {
  const t = useTranslations('complaints');
  const tc = useTranslations('common');
  const [complaint, setComplaint] = useState<GuestComplaint | null>(null);
  const [state, setState] = useState<LoadState>({ load: 'loading', refreshing: false });
  const [attempt, setAttempt] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  // The clock the window is judged against; re-read once the closing instant passes.
  const [now, setNow] = useState(() => new Date());
  // A `WINDOW_CLOSED` from the API overrides whatever this device's clock says.
  const [closedByServer, setClosedByServer] = useState(false);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState((s) =>
      s.load === 'ready'
        ? { load: 'ready', refreshing: true }
        : { load: 'loading', refreshing: false },
    );
    complaintsApi
      .getForBooking(booking.id)
      .then((c) => {
        if (cancelled) return;
        setComplaint(c);
        setState({ load: 'ready', refreshing: false });
      })
      .catch(() => {
        if (cancelled) return;
        setState((s) => {
          // A failed refresh keeps what is on screen; a failed first read gets the retry line.
          if (s.load === 'ready') {
            showToast(t('loadFailed'));
            return { load: 'ready', refreshing: false };
          }
          return { load: 'error', refreshing: false };
        });
      });
    return () => {
      cancelled = true;
    };
    // `t` is stable for the mounted locale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id, attempt]);

  // The button must not outlive the window on a screen left open: wake up at the closing instant.
  useEffect(() => {
    const { closesAt } = complaintWindowBounds(booking);
    const delay = closesAt - Date.now();
    if (!Number.isFinite(delay) || delay <= 0) return;
    const id = setTimeout(() => setNow(new Date()), Math.min(delay + 1000, MAX_TIMEOUT_MS));
    return () => clearTimeout(id);
  }, [booking]);

  const phase: ComplaintWindow = closedByServer ? 'closed' : complaintWindowFor(booking, now);

  const handleSubmitted = (result: SubmitComplaintResult, input: SubmitComplaintInput) => {
    setDialogOpen(false);
    // Show the submission at once from what was typed; the read that follows
    // brings the server's copy, signed image links included.
    setComplaint({
      id: result.id,
      status: result.status,
      description: input.description,
      contactedPartner: input.contactedPartner,
      guestMessage: null,
      refundedAmount: null,
      createdAt: result.createdAt,
      images: [],
    });
    setState({ load: 'ready', refreshing: false });
    reload();
  };

  const handleAlreadyExists = () => {
    setDialogOpen(false);
    reload();
  };

  const handleWindowClosed = () => {
    setDialogOpen(false);
    setClosedByServer(true);
  };

  const handleBookingStale = () => {
    setDialogOpen(false);
    onBookingStale();
  };

  // Completed but before the stay began is a data oddity, not a state with anything to say.
  if (state.load === 'ready' && !complaint && phase !== 'open' && phase !== 'closed') return null;

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Flag className="h-5 w-5 text-brand-primary" />
        <h2 className="font-semibold text-brand-ink">{t('sectionTitle')}</h2>
      </div>

      {state.load === 'loading' && <Skeleton className="h-16 rounded-xl" />}

      {state.load === 'error' && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-red-50 p-3 text-sm text-status-danger">
          <span>{t('loadFailed')}</span>
          <Button size="sm" variant="outline" onClick={reload}>
            {tc('retry')}
          </Button>
        </div>
      )}

      {state.load === 'ready' && complaint && (
        <ComplaintStatusCard
          complaint={complaint}
          onRefresh={reload}
          refreshing={state.refreshing}
        />
      )}

      {state.load === 'ready' && !complaint && phase === 'open' && (
        <>
          <p className="text-sm text-brand-muted">{t('sectionIntro')}</p>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setDialogOpen(true)}
          >
            <Flag className="h-4 w-4" /> {t('submitButton')}
          </Button>
          <p className="text-xs text-brand-muted">{t('windowHint')}</p>
        </>
      )}

      {/* Neutral, not an error: the deadline simply passed. */}
      {state.load === 'ready' && !complaint && phase === 'closed' && (
        <div className="rounded-xl bg-brand-surface p-3 text-sm">
          <div className="font-medium text-brand-ink">{t('windowClosed')}</div>
          <div className="mt-0.5 text-xs text-brand-muted">{t('windowHint')}</div>
        </div>
      )}

      <ComplaintDialog
        bookingId={booking.id}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmitted={handleSubmitted}
        onAlreadyExists={handleAlreadyExists}
        onWindowClosed={handleWindowClosed}
        onBookingStale={handleBookingStale}
      />
    </Card>
  );
}
