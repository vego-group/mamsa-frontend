// @vitest-environment node
/**
 * Per-field errors while the backend moves /api/v1 to one error shape.
 *
 * Old: `{ message, errors: { field: [...] } }`
 * New: `{ success: false, message, code: "VALIDATION", fields: { field: [...] } }` — no `errors` at all.
 *
 * Both reach the screens as `ApiError.fields`, the new key first, so the
 * frontend and the backend can each ship on their own. Status stays 422.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type Client = typeof import('./client');
let unitsApi: Client['unitsApi'];
let ApiError: Client['ApiError'];
let fetchMock: ReturnType<typeof vi.fn>;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const ask = () => unitsApi.checkAvailability('u2', '', '').catch((e: unknown) => e);

beforeAll(async () => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false');
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.test/api/v1');
  ({ unitsApi, ApiError } = await import('./client'));
}, 180_000);

afterAll(() => {
  vi.unstubAllEnvs();
});

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('per-field errors reach the screen in either shape', () => {
  it('reads the new shape: `fields`, with `code` and the first field’s words as `message`', async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          success: false,
          message: 'تاريخ الوصول مطلوب.',
          code: 'VALIDATION',
          fields: { start_date: ['تاريخ الوصول مطلوب.'], end_date: ['تاريخ المغادرة مطلوب.'] },
        },
        422,
      ),
    );
    const error = await ask();
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 422,
      code: 'VALIDATION',
      message: 'تاريخ الوصول مطلوب.',
      fields: { start_date: ['تاريخ الوصول مطلوب.'], end_date: ['تاريخ المغادرة مطلوب.'] },
    });
  });

  it('still reads the old shape: `errors`, as staging and production send today', async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          message: 'The start date field is required. (and 1 more error)',
          errors: { start_date: ['The start date field is required.'], end_date: ['The end date field is required.'] },
        },
        422,
      ),
    );
    expect(await ask()).toMatchObject({
      status: 422,
      message: 'The start date field is required. (and 1 more error)',
      fields: { start_date: ['The start date field is required.'], end_date: ['The end date field is required.'] },
    });
  });

  it('prefers `fields` when a response carries both', async () => {
    fetchMock.mockResolvedValue(
      json({ message: 'جديد', fields: { a: ['جديد'] }, errors: { a: ['قديم'] } }, 422),
    );
    expect(await ask()).toMatchObject({ fields: { a: ['جديد'] } });
  });

  it.each([
    ['new', { fields: { start_date: ['تاريخ الوصول مطلوب.'] } }],
    ['old', { errors: { start_date: ['تاريخ الوصول مطلوب.'] } }],
  ])('falls back to the first field’s words when the %s shape has no message', async (_shape, body) => {
    fetchMock.mockResolvedValue(json(body, 422));
    expect(await ask()).toMatchObject({ message: 'تاريخ الوصول مطلوب.' });
  });

  it('leaves `fields` empty for an error that is not about a field', async () => {
    fetchMock.mockResolvedValue(json({ success: false, message: 'المورد غير موجود', code: 'NOT_FOUND' }, 404));
    const error = await ask();
    expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND' });
    expect((error as InstanceType<typeof ApiError>).fields).toBeUndefined();
  });
});
