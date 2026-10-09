// @vitest-environment node
/**
 * The real transport for every request that sends an SMS code.
 *
 * - A screen learns only that the code went out. Whatever else a response
 *   carries — staging adds a test-only field for numbers in its synthetic
 *   block — is dropped here, so no screen can come to rely on it. Production
 *   never sends that field; both shapes must give the same answer.
 * - When the SMS provider fails, the API answers 503 SMS_SEND_FAILED with its
 *   own Arabic copy. That must reach the screen as itself — not as a generic
 *   network failure — so the screen can show the server's words and offer an
 *   immediate retry.
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

type Client = typeof import('./client');
let authApi: Client['authApi'];
let accountApi: Client['accountApi'];
let ApiError: Client['ApiError'];
let fetchMock: ReturnType<typeof vi.fn>;

const SMS_SEND_FAILED_MESSAGE = 'تعذّر إرسال رمز التحقق — حاول مرة أخرى بعد قليل';

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// What staging sends for a number in its synthetic block: the code rides along.
// (A placeholder stands in for it — no code is ever written into this repo.)
const stagingSent = () =>
  json({ success: true, message: 'تم إرسال رمز التحقق', data: { debug_otp: '<code>', expires_in: 300 } }, 200);
// What production sends: no such field, ever.
const productionSent = () => json({ success: true, message: 'تم إرسال رمز التحقق', data: { expires_in: 300 } }, 200);
const smsSendFailed = () => json({ success: false, message: SMS_SEND_FAILED_MESSAGE, code: 'SMS_SEND_FAILED' }, 503);

beforeAll(async () => {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'false');
  vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.test/api/v1');
  ({ authApi, accountApi, ApiError } = await import('./client'));
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

const SENDERS: Array<[string, () => Promise<unknown>]> = [
  ['authApi.requestOtp', () => authApi.requestOtp('0512345678', 'login')],
  ['authApi.resendOtp', () => authApi.resendOtp('0512345678', 'login')],
  ['authApi.register', () => authApi.register({ firstName: 'فهد', lastName: 'يحيى', email: 'f@example.com', phone: '0512345678' })],
  ['accountApi.changePhone', () => accountApi.changePhone('0512345678')],
];

describe.each(SENDERS)('%s', (_name, send) => {
  it('tells the screen only that the code went out, on staging', async () => {
    fetchMock.mockResolvedValue(stagingSent());
    expect(await send()).toStrictEqual({ sent: true });
  });

  it('gives the same answer on production, where nothing extra comes back', async () => {
    fetchMock.mockResolvedValue(productionSent());
    expect(await send()).toStrictEqual({ sent: true });
  });

  it('hands a failed SMS to the screen as SMS_SEND_FAILED with the server’s own words', async () => {
    fetchMock.mockResolvedValue(smsSendFailed());
    const error = await send().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 503, code: 'SMS_SEND_FAILED', message: SMS_SEND_FAILED_MESSAGE });
  });
});
