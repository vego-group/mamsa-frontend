import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/format';
import type { Review } from '@/types';

/**
 * A unit's reviews as cards. No hooks and no client state, so the unit page
 * renders the same list on the server (its first HTML) and in the browser.
 */
export function ReviewList({ reviews }: { reviews: Review[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {reviews.map((r) => (
        <Card key={r.id} className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            {r.userAvatarUrl ? (
              <img src={r.userAvatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cream font-bold text-brand-primary">
                {r.userName.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-brand-ink">{r.userName}</div>
              <div className="text-xs text-brand-muted">{formatDate(r.createdAt)}</div>
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
          </div>
          <p className="text-sm leading-relaxed text-brand-muted">{r.comment}</p>
        </Card>
      ))}
    </div>
  );
}
