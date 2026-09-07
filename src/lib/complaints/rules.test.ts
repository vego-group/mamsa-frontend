import { describe, expect, it } from 'vitest';
import {
  COMPLAINT_DESCRIPTION_MAX,
  COMPLAINT_DESCRIPTION_MIN,
  COMPLAINT_IMAGE_MAX_BYTES,
  COMPLAINT_MAX_IMAGES,
  checkComplaintDescription,
  isAllowedComplaintImage,
  screenComplaintImages,
} from './rules';

/** Builds a File of an arbitrary size without allocating the bytes. */
function fakeFile(name: string, type: string, sizeBytes = 1000): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

describe('description — 20 to 2000 characters, counted the way the backend counts', () => {
  it('is short below 20 and valid from 20', () => {
    expect(checkComplaintDescription('م'.repeat(COMPLAINT_DESCRIPTION_MIN - 1))).toMatchObject({
      length: 19,
      problem: 'short',
      valid: false,
    });
    expect(checkComplaintDescription('م'.repeat(COMPLAINT_DESCRIPTION_MIN))).toMatchObject({
      length: 20,
      problem: null,
      valid: true,
    });
  });

  it('is valid at 2000 and long at 2001', () => {
    expect(checkComplaintDescription('a'.repeat(COMPLAINT_DESCRIPTION_MAX)).valid).toBe(true);
    expect(checkComplaintDescription('a'.repeat(COMPLAINT_DESCRIPTION_MAX + 1))).toMatchObject({
      problem: 'long',
      valid: false,
    });
  });

  it('ignores surrounding whitespace, as Laravel trims before validating', () => {
    expect(checkComplaintDescription(`   ${'x'.repeat(19)}   `)).toMatchObject({
      length: 19,
      valid: false,
    });
  });

  it('counts code points, so an emoji is one character, not two', () => {
    expect(checkComplaintDescription('😀'.repeat(20)).length).toBe(20);
  });
});

describe('images — type', () => {
  it('accepts exactly jpeg, png and webp by MIME', () => {
    expect(isAllowedComplaintImage(fakeFile('a.jpg', 'image/jpeg'))).toBe(true);
    expect(isAllowedComplaintImage(fakeFile('a.png', 'image/png'))).toBe(true);
    expect(isAllowedComplaintImage(fakeFile('a.webp', 'image/webp'))).toBe(true);
    expect(isAllowedComplaintImage(fakeFile('a.gif', 'image/gif'))).toBe(false);
    expect(isAllowedComplaintImage(fakeFile('a.pdf', 'application/pdf'))).toBe(false);
    expect(isAllowedComplaintImage(fakeFile('a.heic', 'image/heic'))).toBe(false);
  });

  it('falls back to the extension only when the browser gives no type', () => {
    expect(isAllowedComplaintImage(fakeFile('IMG_0001.JPG', ''))).toBe(true);
    expect(isAllowedComplaintImage(fakeFile('scan.pdf', ''))).toBe(false);
    // A declared type wins over a friendly extension.
    expect(isAllowedComplaintImage(fakeFile('a.jpg', 'application/pdf'))).toBe(false);
  });
});

describe('images — screening a pick before anything is uploaded', () => {
  it('names a wrong format and an oversize file, and keeps the rest', () => {
    const ok = fakeFile('ok.jpg', 'image/jpeg', 400_000);
    const gif = fakeFile('anim.gif', 'image/gif');
    const big = fakeFile('big.png', 'image/png', COMPLAINT_IMAGE_MAX_BYTES + 1);
    const atCap = fakeFile('cap.webp', 'image/webp', COMPLAINT_IMAGE_MAX_BYTES);

    const { accepted, rejected } = screenComplaintImages(0, [ok, gif, big, atCap]);

    expect(accepted).toEqual([ok, atCap]);
    expect(rejected).toEqual([
      { file: gif, reason: 'type' },
      { file: big, reason: 'size' },
    ]);
  });

  it('caps the total at 6, counting what is already attached', () => {
    const files = Array.from({ length: 4 }, (_, i) => fakeFile(`p${i}.jpg`, 'image/jpeg'));
    const { accepted, rejected } = screenComplaintImages(COMPLAINT_MAX_IMAGES - 2, files);

    expect(accepted).toEqual(files.slice(0, 2));
    expect(rejected.map((r) => r.reason)).toEqual(['count', 'count']);
  });

  it('refuses everything once the form is full', () => {
    const { accepted, rejected } = screenComplaintImages(COMPLAINT_MAX_IMAGES, [
      fakeFile('x.jpg', 'image/jpeg'),
    ]);
    expect(accepted).toEqual([]);
    expect(rejected[0]?.reason).toBe('count');
  });

  it('does not let a rejected file consume a slot', () => {
    const files = [
      fakeFile('bad.gif', 'image/gif'),
      ...Array.from({ length: COMPLAINT_MAX_IMAGES }, (_, i) =>
        fakeFile(`p${i}.jpg`, 'image/jpeg'),
      ),
    ];
    const { accepted } = screenComplaintImages(0, files);
    expect(accepted).toHaveLength(COMPLAINT_MAX_IMAGES);
  });
});
