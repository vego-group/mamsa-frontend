/**
 * Signed complaint-image links — pure, no clock of its own.
 *
 * The API mints the links the way it mints every temporary URL: Laravel
 * signed routes, `?expires=<unix seconds>&signature=…`. That stamp is the
 * only honest way to tell WHY an image stopped loading. A link past its
 * `expires` has simply died (by design, 15 minutes after the read) and a
 * re-read is the fix; a link that is still within its window has hit a real
 * fault — a 500 from the file host, a network drop — and telling the guest
 * the link "expired" points them at a remedy that will not work and hides
 * the fault.
 *
 * For robustness the S3 presigned shapes are read too (`Expires` for v2,
 * `X-Amz-Date` + `X-Amz-Expires` for v4), should storage ever move. A link
 * that carries no expiry at all (the mock's blob: URLs, a plain CDN URL)
 * cannot be called expired — `null` here, and never `true` from
 * `isImageLinkExpired`.
 */

const AMZ_DATE = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/;

function unixSeconds(raw: string | null): number | null {
  if (raw == null || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** The instant (ms since epoch) a signed link stops working, or `null` when the URL does not say. */
export function imageLinkExpiresAt(url: string): number | null {
  let params: URLSearchParams;
  try {
    params = new URL(url).searchParams;
  } catch {
    return null;
  }

  // Laravel signed route (`expires`) and S3 presigned v2 (`Expires`) — both unix seconds.
  const stamp = unixSeconds(params.get('expires')) ?? unixSeconds(params.get('Expires'));
  if (stamp != null) return stamp * 1000;

  // S3 presigned v4: signed at X-Amz-Date, valid for X-Amz-Expires seconds.
  const signedAt = params.get('X-Amz-Date');
  const ttl = unixSeconds(params.get('X-Amz-Expires'));
  const m = signedAt ? AMZ_DATE.exec(signedAt) : null;
  if (m && ttl != null) {
    const [y, mo, d, h, mi, s] = m.slice(1).map(Number);
    const at = Date.UTC(y ?? 0, (mo ?? 1) - 1, d ?? 1, h ?? 0, mi ?? 0, s ?? 0);
    return Number.isFinite(at) ? at + ttl * 1000 : null;
  }

  return null;
}

/**
 * True only when the link carries an expiry AND that instant has passed.
 * "Unknown" is not "expired": a failure on a link that is still valid, or
 * whose validity cannot be read, is a load fault to retry, not a dead link.
 */
export function isImageLinkExpired(url: string, now: number = Date.now()): boolean {
  const at = imageLinkExpiresAt(url);
  return at != null && at <= now;
}
