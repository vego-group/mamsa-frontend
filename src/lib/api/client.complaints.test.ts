/**
 * The real transport for the three complaint routes: multipart out, the
 * `{ success, message, data }` envelope in, and the one 404 that is an
 * answer rather than a fault.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type Client = typeof import('./client');
let complaintsApi: Client['complaintsApi'];
let ApiError: Client['ApiError'];
let fetchMock: ReturnType<typeof vi.fn>;

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const lastCall = () => fetchMock.mock.calls[0] as [string, RequestInit];

const input = (over: Partial<Parameters<Client['complaintsApi']['submit']>[1]> = {}) => ({
  description: 'وصف المشكلة بالتفصيل الكامل هنا',
  contactedPartner: true,
  images: [] as File[],
  ...over,
});

// The mock/real switch is read at module load, so the client is imported once
// with it flipped. Once, not per test: the import pulls in the whole mock
// layer and its fixtures, which on a busy worker can outlast a hook timeout.
beforeAll(async () => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false');
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.test/api/v1');
  ({ complaintsApi, ApiError } = await import('./client'));
}, 60_000);

afterAll(() => {
  vi.unstubAllEnvs();
});

// `fetch` is looked up at call time, so a fresh stub per test is enough.
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('complaintsApi.submit', () => {
  it('posts multipart to /bookings/{id}/complaint and lets the browser set the boundary', async () => {
    fetchMock.mockResolvedValue(
      json({ id: 12, status: 'submitted', created_at: '2026-09-06T14:22:00+00:00' }, 201),
    );
    const a = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    const b = new File(['y'], 'b.png', { type: 'image/png' });

    const result = await complaintsApi.submit('101', input({ images: [a, b] }));

    const [url, init] = lastCall();
    expect(url).toBe('https://api.test/api/v1/bookings/101/complaint');
    expect(init.method).toBe('POST');
    const body = init.body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('description')).toBe('وصف المشكلة بالتفصيل الكامل هنا');
    expect(body.get('contacted_partner')).toBe('1');
    expect(body.getAll('images[]')).toEqual([a, b]);
    // A manual Content-Type would strip the multipart boundary and the API would read zero fields.
    expect((init.headers as Record<string, string>)['Content-Type']).toBeUndefined();
    expect(result).toEqual({
      id: '12',
      status: 'submitted',
      createdAt: '2026-09-06T14:22:00+00:00',
    });
  });

  it('sends "0" when the host was not contacted, and no images[] entries when there are none', async () => {
    fetchMock.mockResolvedValue(json({ id: 13, status: 'submitted', created_at: null }, 201));

    await complaintsApi.submit('101', input({ contactedPartner: false }));

    const body = lastCall()[1].body as FormData;
    expect(body.get('contacted_partner')).toBe('0');
    expect(body.getAll('images[]')).toEqual([]);
  });

  it('surfaces a refusal by its code, with the server message beside it', async () => {
    fetchMock.mockResolvedValue(
      json({ success: false, code: 'COMPLAINT_ALREADY_EXISTS', message: 'توجد شكوى بالفعل.' }, 409),
    );

    await expect(complaintsApi.submit('101', input())).rejects.toMatchObject({
      status: 409,
      code: 'COMPLAINT_ALREADY_EXISTS',
      message: 'توجد شكوى بالفعل.',
    });
  });

  it('keeps the per-field errors of a plain 422', async () => {
    fetchMock.mockResolvedValue(
      json({ message: 'The given data was invalid.', errors: { description: ['قصير'] } }, 422),
    );

    await expect(complaintsApi.submit('101', input())).rejects.toMatchObject({
      status: 422,
      fields: { description: ['قصير'] },
    });
  });
});

describe('complaintsApi.getForBooking', () => {
  it('unwraps the envelope and reads the riyal amount as it came', async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          success: true,
          message: '',
          data: {
            id: 12,
            status: 'resolved_refunded',
            description: 'd',
            contacted_partner: true,
            guest_message: 'تم.',
            refunded_amount: 391.3,
            created_at: '2026-09-06T14:22:00+00:00',
            images: [{ url: 'https://s3/1', mime: 'image/jpeg' }],
          },
        },
        200,
      ),
    );

    const c = await complaintsApi.getForBooking('101');

    expect(lastCall()[0]).toBe('https://api.test/api/v1/bookings/101/complaint');
    expect(c).toMatchObject({
      id: '12',
      status: 'resolved_refunded',
      refundedAmount: 391.3,
      guestMessage: 'تم.',
      images: [{ url: 'https://s3/1', mime: 'image/jpeg' }],
    });
  });

  it('answers null — not an error — to the NO_COMPLAINT 404', async () => {
    fetchMock.mockResolvedValue(
      json({ success: false, code: 'NO_COMPLAINT', message: 'لا توجد شكوى.' }, 404),
    );

    await expect(complaintsApi.getForBooking('101')).resolves.toBeNull();
  });

  it('still rejects a 404 that is not NO_COMPLAINT — no such booking', async () => {
    fetchMock.mockResolvedValue(json({ message: 'Not Found' }, 404));

    await expect(complaintsApi.getForBooking('999')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('complaintsApi.list', () => {
  it('reads /user/complaints — not /me/complaints, which is the partner session', async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          success: true,
          data: [
            {
              id: 7,
              status: 'under_review',
              booking_id: 101,
              booking_code: 'NXTZ3K8L5Q',
              created_at: '2026-09-01T10:00:00+03:00',
            },
          ],
        },
        200,
      ),
    );

    const rows = await complaintsApi.list();

    expect(lastCall()[0]).toBe('https://api.test/api/v1/user/complaints');
    expect(rows).toEqual([
      {
        id: '7',
        status: 'under_review',
        bookingId: '101',
        bookingCode: 'NXTZ3K8L5Q',
        createdAt: '2026-09-01T10:00:00+03:00',
      },
    ]);
  });

  it('treats an empty body as no rows', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 200 }));

    await expect(complaintsApi.list()).resolves.toEqual([]);
  });
});
