/**
 * Resending a code when the SMS provider fails.
 *
 * The backend answers 503 SMS_SEND_FAILED, and that attempt costs the guest
 * nothing: no daily quota, no cooldown. So the screen shows the server's own
 * words, keeps the guest on the code step, and offers "إعادة المحاولة" at once —
 * never a countdown. A rate limit is the opposite case and keeps its countdown.
 *
 * Runs on the mock (its SMS provider fails for one number) through the real
 * client, the way a screen does.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import { authApi, ApiError } from '@/lib/api/client';
import { OtpVerificationForm } from './OtpVerificationForm';

const SMS_FAILS_FOR = '0500000503';
const SENDS_FINE_FOR = '0500000504';
const SERVER_MESSAGE = 'تعذّر إرسال رمز التحقق — حاول مرة أخرى بعد قليل';
const RETRY = arMessages.common.retry;

afterEach(cleanup);

function renderForm(onResend: () => Promise<unknown>, variant: 'dialog' | 'onboarding' = 'dialog') {
  render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      <OtpVerificationForm
        displayPhone="+966 50 000 0503"
        onSubmit={async () => {}}
        onResend={onResend as never}
        initialCooldownSeconds={0}
        variant={variant}
      />
    </NextIntlClientProvider>,
  );
}

const resendLabel = (variant: 'dialog' | 'onboarding') =>
  variant === 'dialog' ? arMessages.auth.otp.resend : arMessages.auth.onboardingOtp.resend;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe.each(['dialog', 'onboarding'] as const)('resend fails at the SMS provider (%s)', (variant) => {
  it('shows the server’s words and an immediate retry, with no countdown', async () => {
    renderForm(() => authApi.resendOtp(SMS_FAILS_FOR), variant);
    fireEvent.click(screen.getByRole('button', { name: resendLabel(variant) }));

    expect(await screen.findByText(SERVER_MESSAGE)).toBeTruthy();
    const retry = screen.getByRole('button', { name: RETRY }) as HTMLButtonElement;
    expect(retry.disabled).toBe(false);

    // A second later there is still nothing to wait for.
    await wait(1100);
    expect(retry.disabled).toBe(false);
    expect(screen.queryByText(/\d+\s*(s|ث|\))/)).toBeNull();
  });

  it('keeps the guest on the code step', async () => {
    renderForm(() => authApi.resendOtp(SMS_FAILS_FOR), variant);
    fireEvent.click(screen.getByRole('button', { name: resendLabel(variant) }));
    await screen.findByText(SERVER_MESSAGE);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('retries at once, and a send that then goes through starts the usual countdown', async () => {
    let attempts = 0;
    renderForm(() => authApi.resendOtp(++attempts === 1 ? SMS_FAILS_FOR : SENDS_FINE_FOR), variant);
    fireEvent.click(screen.getByRole('button', { name: resendLabel(variant) }));
    fireEvent.click(await screen.findByRole('button', { name: RETRY }));

    await wait(600);
    expect(attempts).toBe(2);
    expect(screen.queryByText(SERVER_MESSAGE)).toBeNull();
    expect(screen.queryByRole('button', { name: RETRY })).toBeNull();
  });
});

describe('the contrast: other resend outcomes keep their wait', () => {
  it('a code that went out starts the resend countdown', async () => {
    renderForm(() => authApi.resendOtp(SENDS_FINE_FOR));
    const resend = screen.getByRole('button', { name: arMessages.auth.otp.resend }) as HTMLButtonElement;
    fireEvent.click(resend);
    await wait(600);
    expect((screen.getByRole('button', { name: /\d+s/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('a rate limit says so and counts down what the server asked for', async () => {
    renderForm(() => Promise.reject(new ApiError(429, 'Too Many Attempts.', 'RATE_LIMITED', 45)));
    fireEvent.click(screen.getByRole('button', { name: arMessages.auth.otp.resend }));
    expect(await screen.findByText('حاول مرة أخرى بعد 45 ثانية')).toBeTruthy();
    expect((screen.getByRole('button', { name: /45s/ }) as HTMLButtonElement).disabled).toBe(true);
  });
});
