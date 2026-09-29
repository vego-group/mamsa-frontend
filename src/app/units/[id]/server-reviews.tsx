import { ReviewList } from '@/components/features/units/ReviewList';
import type { Review } from '@/types';

/**
 * The unit's first reviews, rendered on the server. The page doesn't wait
 * for them: they stream into its HTML when they arrive. Nothing when the read
 * failed or found none — the browser's own fetch fills the section in.
 */
export async function ServerReviews({ reviews }: { reviews: Promise<Review[] | null> }) {
  const list = await reviews;
  return list?.length ? <ReviewList reviews={list} /> : null;
}
