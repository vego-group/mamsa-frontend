'use client';

/**
 * ZATCA tax invoice — the most formal artefact this platform produces.
 *
 * A guest may forward it to an employer or attach it to an expense claim, so it
 * is built as a document, not a data dump: A4 portrait, restrained, typographic
 * hierarchy, tabular numerals so the money column aligns on the decimal.
 *
 * Three rules it must not break:
 *  - Mamsa is the SELLER OF RECORD. The host's name never appears as supplier.
 *  - Money is rendered EXACTLY as the server sent it — nothing here recomputes a
 *    VAT split. The server supplies one for every booking including
 *    pre-conversion ones, so this page has a single layout and no special case.
 *  - The QR payload is signed server-side. This file renders the string it is
 *    given and contains no TLV encoder.
 *
 * On language: a Saudi tax invoice is a legal document and leads in Arabic
 * whatever the UI locale, which is why the `invoice.*` Arabic labels are
 * identical in both message files and the `*En` keys are the secondary line.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRight, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { bookingsApi, type TaxInvoice } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { loadFailureFor, type LoadState } from '@/lib/api/load-state';
import { LoadStateView } from '@/components/shared/LoadStateView';
import { useAuthStore } from '@/stores/auth';
import { formatSAR, formatDate } from '@/lib/utils/format';
import type { Booking } from '@/types';

/** Only a paid booking has a tax invoice — nothing was charged otherwise. */
const INVOICEABLE: Booking['status'][] = ['confirmed', 'completed'];

export default function InvoicePage() {
  const t = useTranslations('invoice');
  const { bookingId } = useParams<{ bookingId: string }>();

  // Re-running the fetch on this flag IS the return path after signing in: the
  // login dialog leaves the person on this URL, the flag flips, the page loads.
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [invoice, setInvoice] = useState<TaxInvoice | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  // Bumping this re-runs the fetch effect — the retry path after a failure.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;
    setState('loading');

    // The booking is fetched first: its status decides whether an invoice may
    // exist at all, so an unpaid booking never even requests one.
    bookingsApi
      .getById(bookingId)
      .then(async (b) => {
        if (cancelled) return;
        setBooking(b);
        if (!INVOICEABLE.includes(b.status)) return;
        try {
          const inv = await bookingsApi.getInvoice(bookingId);
          if (!cancelled) setInvoice(inv);
        } catch (e) {
          // 409 INVOICE_NOT_AVAILABLE is an EXPECTED state, not a failure: the
          // booking simply has no invoice yet. Falling through leaves `invoice`
          // null, which renders the same calm "not available" card an unpaid
          // booking gets — never an error card or a toast. Any other status is
          // a real fault and still surfaces as one.
          const notAvailable =
            e instanceof ApiError && (e.status === 409 || e.code === 'INVOICE_NOT_AVAILABLE');
          if (!notAvailable) throw e;
        }
      })
      .then(() => !cancelled && setState('ready'))
      // 401/403/404 are answers about this visitor, not faults: no session,
      // someone else's booking, no such booking. Each gets its own card.
      .catch((e) => !cancelled && setState(loadFailureFor(e)));

    return () => {
      cancelled = true;
    };
  }, [bookingId, isAuthenticated, attempt]);

  if (state === 'loading') {
    return (
      <div className="container mx-auto flex justify-center px-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (state !== 'ready' || !booking) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16">
        <LoadStateView
          state={state === 'ready' ? 'error' : state}
          onRetry={() => setAttempt((n) => n + 1)}
          errorMessage={t('loadFailed')}
          forbiddenMessage={t('notYours')}
          notFoundMessage={t('notFound')}
        />
      </div>
    );
  }

  // pending_payment / cancelled: no charge was made, so no invoice exists.
  if (!INVOICEABLE.includes(booking.status) || !invoice) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="space-y-4 p-10 text-center">
          <h1 className="text-lg font-bold text-brand-ink">{t('title')}</h1>
          <p className="text-sm leading-relaxed text-brand-muted">{t('unavailable')}</p>
          <Button asChild variant="outline">
            <Link href={`/my-reservations/${booking.id}`}>{t('backToBooking')}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Screen-only controls */}
        <div className="no-print mb-6 flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/my-reservations/${booking.id}`}>
              <ArrowRight className="h-4 w-4" /> {t('backToBooking')}
            </Link>
          </Button>
          {/* Browser print pipeline, deliberately: it shapes Arabic correctly
              and produces far smaller files than any canvas-based generator. */}
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> {t('print')}
          </Button>
        </div>

        <article className="invoice-sheet mx-auto bg-white p-10 text-brand-ink shadow-sm print:p-0 print:shadow-none">
          {/* Header — brand colour appears here and on the totals band only */}
          <header className="flex items-start justify-between gap-6 border-b-2 border-brand-primary pb-5">
            <div>
              <div className="text-xl font-bold tracking-tight text-brand-primary">مَمسَى</div>
              <div className="text-xs text-brand-muted">Mamsa</div>
            </div>
            <div className="text-end">
              <h1 className="text-lg font-bold">{t('title')}</h1>
              <div className="text-xs text-brand-muted">{t('titleEn')}</div>
            </div>
          </header>

          {/* Parties */}
          <section className="grid grid-cols-2 gap-8 border-b border-brand-border py-6">
            <div className="space-y-2">
              <FieldLabel ar={t('seller')} en={t('sellerEn')} />
              <div className="text-sm font-semibold">{invoice.seller.name}</div>
              {/* The server sends "" for registration fields it does not hold
                  yet. A labelled blank on a tax document reads as a defect, so
                  MetaLine omits the row entirely for an empty value. */}
              <MetaLine ar={t('vatNumber')} en={t('vatNumberEn')} value={invoice.seller.vatNumber} />
              <MetaLine ar={t('crNumber')} en={t('crNumberEn')} value={invoice.seller.crNumber} />
              <MetaLine ar={t('address')} en={t('addressEn')} value={invoice.seller.address} />
            </div>
            <div className="space-y-2">
              <FieldLabel ar={t('buyer')} en={t('buyerEn')} />
              <div className="text-sm font-semibold">{invoice.buyerName}</div>
              <MetaLine ar={t('number')} en={t('numberEn')} value={invoice.invoiceNumber} mono />
              <MetaLine
                ar={t('issuedAt')}
                en={t('issuedAtEn')}
                value={invoice.issuedAt ? formatDate(invoice.issuedAt) : '—'}
              />
            </div>
          </section>

          {/* Lines */}
          <section className="py-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-xs text-brand-muted">
                  <Th ar={t('colDescription')} en={t('colDescriptionEn')} align="start" />
                  <Th ar={t('colNights')} en={t('colNightsEn')} />
                  <Th ar={t('colNetBase')} en={t('colNetBaseEn')} />
                  <Th ar={t('colVat')} en={t('colVatEn')} />
                  <Th ar={t('colGross')} en={t('colGrossEn')} />
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line, i) => (
                  <tr key={i} className="border-b border-brand-border/60">
                    <td className="py-3 pe-3">
                      <div className="font-medium">{line.description}</div>
                      <div className="text-xs text-brand-muted">
                        {formatDate(line.checkIn)} — {formatDate(line.checkOut)}
                      </div>
                    </td>
                    <td className="num py-3 text-center">{line.nights}</td>
                    <td className="num py-3 text-end">{formatSAR(line.netBase)}</td>
                    <td className="num py-3 text-end">{formatSAR(line.vat)}</td>
                    <td className="num py-3 text-end font-medium">{formatSAR(line.gross)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Totals — الإجمالي المستحق is the largest figure on the page */}
          <section className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <TotalRow ar={t('totalNetBase')} en={t('totalNetBaseEn')} value={formatSAR(invoice.totalNetBase)} />
              <TotalRow ar={t('totalVat')} en={t('totalVatEn')} value={formatSAR(invoice.totalVat)} />
              <div className="flex items-end justify-between gap-4 rounded-lg bg-brand-primary/10 px-4 py-3">
                <div>
                  <div className="text-sm font-bold text-brand-primary">{t('totalGross')}</div>
                  <div className="text-[10px] text-brand-muted">{t('totalGrossEn')}</div>
                </div>
                <div className="num text-xl font-bold text-brand-primary">{formatSAR(invoice.totalGross)}</div>
              </div>
            </div>
          </section>

          {/* QR — the image appears the moment the backend sends a payload,
              with no code change here. Until then, an honest placeholder. */}
          <footer className="mt-8 border-t border-brand-border pt-6">
            {invoice.qrCode ? (
              <QRCodeSVG value={invoice.qrCode} size={104} level="M" marginSize={0} />
            ) : (
              <div className="flex h-[104px] w-[104px] items-center justify-center rounded-lg border border-dashed border-brand-border p-2 text-center text-[10px] leading-snug text-brand-muted">
                {t('qrPending')}
              </div>
            )}
          </footer>
        </article>
      </div>
    </>
  );
}

function FieldLabel({ ar, en }: { ar: string; en: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-brand-muted">{ar}</div>
      <div className="text-[10px] text-brand-border">{en}</div>
    </div>
  );
}

/**
 * Renders nothing for an empty value. The server returns "" (not null) for
 * seller registration fields it does not hold yet, and a label with nothing
 * after it looks like a rendering bug on a document a guest may forward to an
 * employer. Both "" and null are treated the same way.
 */
function MetaLine({ ar, en, value, mono }: { ar: string; en: string; value?: string | null; mono?: boolean }) {
  if (!value?.trim()) return null;
  return (
    <div className="text-xs">
      <span className="text-brand-muted">
        {ar} <span className="text-brand-border">/ {en}</span>:{' '}
      </span>
      <span className={mono ? 'num font-mono' : 'num'}>{value}</span>
    </div>
  );
}

function Th({ ar, en, align = 'center' }: { ar: string; en: string; align?: 'start' | 'center' }) {
  return (
    <th className={`pb-2 font-medium ${align === 'start' ? 'text-start' : 'text-center'}`}>
      <div>{ar}</div>
      <div className="text-[10px] font-normal text-brand-border">{en}</div>
    </th>
  );
}

function TotalRow({ ar, en, value }: { ar: string; en: string; value: string }) {
  return (
    <div className="flex items-end justify-between gap-4 px-4 text-sm">
      <div>
        <div className="text-brand-muted">{ar}</div>
        <div className="text-[10px] text-brand-border">{en}</div>
      </div>
      <div className="num">{value}</div>
    </div>
  );
}

