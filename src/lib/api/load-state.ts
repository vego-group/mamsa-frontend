/**
 * How a protected page's first fetch ended.
 *
 * A page that only tracks "data or no data" has no way out of its loading
 * state when the request rejects: a logged-out visitor opening a booking link
 * from their inbox gets a 401, nothing sets any data, and the spinner runs
 * forever. Mapping the failure to one of these states is what gives every
 * outcome a visible destination.
 */
import { ApiError } from './errors';

/** A terminal failure — everything except the two happy states. */
export type LoadFailure = 'unauthenticated' | 'forbidden' | 'notfound' | 'error';

export type LoadState = 'loading' | 'ready' | LoadFailure;

/**
 * Classifies a rejected API call.
 *
 * The three statuses below are ordinary answers about *this* visitor, not
 * faults: no session (401), someone else's booking (403), no such booking
 * (404). Anything else — network, 5xx, a parse failure — is a real error and
 * gets the retry card.
 */
export function loadFailureFor(e: unknown): LoadFailure {
  if (e instanceof ApiError) {
    if (e.status === 401) return 'unauthenticated';
    if (e.status === 403) return 'forbidden';
    if (e.status === 404) return 'notfound';
  }
  return 'error';
}
