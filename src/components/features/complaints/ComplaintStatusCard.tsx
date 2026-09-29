'use client';

/**
 * The guest's view of their complaint, in its five states.
 *
 * What is NOT shown is as deliberate as what is. At `approved` the refund is
 * still at the gateway — it can take an hour or more, and it can fail — so
 * no amount and no time is promised until `resolved_refunded`, where
 * `refundedAmount` is money that has actually moved. That figure is rendered
 * exactly as it came (two decimals, in riyals); nothing here computes.
 *
 * Image links are signed and die 15 minutes after the read that produced
 * them. When one stops loading the card looks at the link's own `expires`
 * stamp before deciding what to say: past it, the link has simply expired
 * and a re-read of the complaint brings fresh ones — expected behaviour, not
 * a fault. Still within it (or carrying no stamp at all), the failure is a
 * real one — a 500 from the file host, a dropped connection — and the guest
 * reads "couldn't load" with a retry, never "expired": that would send them
 * after a remedy that cannot work and bury the fault.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComplaintStatusBadge } from './ComplaintStatusBadge';
import { isImageLinkExpired } from '@/lib/complaints/imageLinks';
import { formatDateRiyadh, formatSARExact } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { GuestComplaint } from '@/types';

interface ComplaintStatusCardProps {
  complaint: GuestComplaint;
  /** Re-reads the complaint — the only way to get fresh signed image links. */
  onRefresh: () => void;
  refreshing?: boolean;
}

export function ComplaintStatusCard({
  complaint,
  onRefresh,
  refreshing,
}: ComplaintStatusCardProps) {
  const t = useTranslations('complaints');
  const tc = useTranslations('common');
  // Images that failed to load, judged at the moment of failure against
  // their own `expires`: a dead link and a faulty one are different messages.
  const [broken, setBroken] = useState({ expired: 0, failed: 0 });
  // Bumped on every new read so each <img> remounts and retries, even when a
  // link happens to come back byte-for-byte the same.
  const [generation, setGeneration] = useState(0);

  // A new read means new links: forget which of the old ones had died.
  useEffect(() => {
    setBroken({ expired: 0, failed: 0 });
    setGeneration((g) => g + 1);
  }, [complaint]);

  const markBroken = (url: string) => {
    const expired = isImageLinkExpired(url);
    setBroken((b) => (expired ? { ...b, expired: b.expired + 1 } : { ...b, failed: b.failed + 1 }));
  };

  // One expired link is enough to say so: the re-read fixes it and retries the rest.
  const anyExpired = broken.expired > 0;
  const anyBroken = anyExpired || broken.failed > 0;

  const headline =
    complaint.status === 'resolved_refunded'
      ? complaint.refundedAmount != null
        ? t('status.resolved_refunded', { amount: formatSARExact(complaint.refundedAmount) })
        : t('status.resolved_refundedNoAmount')
      : t(`status.${complaint.status}`);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-brand-ink">{headline}</div>
          <p className="mt-1 text-sm text-brand-muted">{t(`statusBody.${complaint.status}`)}</p>
        </div>
        <ComplaintStatusBadge status={complaint.status} />
      </div>

      {/* Mamsa's decision — the only text written for the guest; null until there is one. */}
      {complaint.guestMessage && (
        <div className="rounded-xl bg-brand-cream/50 p-4 text-sm">
          <div className="mb-1 text-xs font-semibold text-brand-muted">{t('decision')}</div>
          <p className="whitespace-pre-line text-brand-ink">{complaint.guestMessage}</p>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-3 text-sm">
        {complaint.createdAt && (
          <div>
            <dt className="text-xs text-brand-muted">{t('submittedOn')}</dt>
            <dd className="font-medium">{formatDateRiyadh(complaint.createdAt)}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs text-brand-muted">{t('contactedPartner')}</dt>
          <dd className="font-medium">
            {complaint.contactedPartner ? t('contactedYes') : t('contactedNo')}
          </dd>
        </div>
      </dl>

      <div>
        <div className="mb-1 text-xs text-brand-muted">{t('descriptionTitle')}</div>
        <p className="whitespace-pre-line text-sm text-brand-ink">{complaint.description}</p>
      </div>

      {complaint.images.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-brand-muted">{t('attachments')}</div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {complaint.images.map((img, i) => (
              // Keyed on the read and the url so a refreshed link remounts the <img> and retries.
              <a
                key={`${generation}-${i}-${img.url}`}
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('openImage', { index: i + 1 })}
                className="block aspect-square overflow-hidden rounded-xl border border-brand-border bg-brand-cream/40"
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => markBroken(img.url)}
                />
              </a>
            ))}
          </div>
          {anyBroken && (
            <div
              className={cn(
                'flex flex-wrap items-center justify-between gap-2 rounded-xl p-3 text-xs',
                anyExpired
                  ? 'bg-brand-surface text-brand-muted'
                  : 'bg-red-50 text-status-danger',
              )}
            >
              <span>{anyExpired ? t('imagesExpired') : t('imagesFailed')}</span>
              <Button size="sm" variant="outline" onClick={onRefresh} disabled={refreshing}>
                <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />{' '}
                {anyExpired ? t('reloadImages') : tc('retry')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No edit, no withdrawal: the only path after filing is support. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-border pt-3 text-xs text-brand-muted">
        <span>{t('supportNote')}</span>
        <Link
          href="/contact"
          className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:underline"
        >
          <MessageCircle className="h-3.5 w-3.5" /> {t('contactSupport')}
        </Link>
      </div>
    </div>
  );
}
