/**
 * Submission rules, mirrored from the backend's validator so a guest on
 * mobile data is stopped BEFORE an upload, not after it:
 *
 *   description        required · 20–2000 characters
 *   contacted_partner  required · boolean
 *   images[]           optional · 0–6 · ≤ 5 MB each · image/jpeg | image/png | image/webp
 *
 * Everything here is pure so the limits can be tested without a form. The
 * backend still validates; these only decide what never leaves the phone.
 */

export const COMPLAINT_DESCRIPTION_MIN = 20;
export const COMPLAINT_DESCRIPTION_MAX = 2000;
export const COMPLAINT_MAX_IMAGES = 6;
export const COMPLAINT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const COMPLAINT_IMAGE_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];
/** What the file picker is told to offer — the MIME list plus extensions, for pickers that only understand those. */
export const COMPLAINT_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

// `image/jpg` is not a registered type, but some Windows builds still label
// JPEGs with it; the backend checks the bytes, so it would pass there.
const ACCEPTED_MIME = new Set([...COMPLAINT_IMAGE_TYPES, 'image/jpg']);
const IMAGE_EXT_RE = /\.(jpe?g|png|webp)$/i;

export type DescriptionProblem = 'short' | 'long' | null;

export interface DescriptionCheck {
  /** Characters as the backend counts them (`mb_strlen` of the trimmed text): code points, not UTF-16 units. */
  length: number;
  problem: DescriptionProblem;
  valid: boolean;
}

export function checkComplaintDescription(value: string): DescriptionCheck {
  // Laravel trims string input before validating, so surrounding whitespace never counts.
  const length = Array.from(value.trim()).length;
  const problem: DescriptionProblem =
    length < COMPLAINT_DESCRIPTION_MIN
      ? 'short'
      : length > COMPLAINT_DESCRIPTION_MAX
        ? 'long'
        : null;
  return { length, problem, valid: problem === null };
}

export type ImageRejection = 'type' | 'size' | 'count';

export interface ImageScreening {
  accepted: File[];
  rejected: Array<{ file: File; reason: ImageRejection }>;
}

/** Some browsers hand over an empty `type` (notably for files off a camera roll), so the extension is trusted then. */
export function isAllowedComplaintImage(file: File): boolean {
  if (file.type) return ACCEPTED_MIME.has(file.type);
  return IMAGE_EXT_RE.test(file.name);
}

/**
 * Screens a pick against the three limits, in the order a guest can act on
 * them: a wrong format and an oversize file are each named; once the slots
 * are used up the rest are refused for count. `alreadyAttached` is how many
 * images the form is already holding.
 */
export function screenComplaintImages(
  alreadyAttached: number,
  picked: readonly File[],
): ImageScreening {
  const accepted: File[] = [];
  const rejected: ImageScreening['rejected'] = [];
  let slots = Math.max(0, COMPLAINT_MAX_IMAGES - alreadyAttached);
  for (const file of picked) {
    if (!isAllowedComplaintImage(file)) rejected.push({ file, reason: 'type' });
    else if (file.size > COMPLAINT_IMAGE_MAX_BYTES) rejected.push({ file, reason: 'size' });
    else if (slots === 0) rejected.push({ file, reason: 'count' });
    else {
      accepted.push(file);
      slots -= 1;
    }
  }
  return { accepted, rejected };
}
