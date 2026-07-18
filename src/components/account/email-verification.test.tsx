import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { EmailVerificationCard } from './email-verification';
import { useAuthStore } from '@/stores/auth';
import type { User } from '@/types';

const messages = {
  emailVerification: {
    title: 'البريد الإلكتروني',
    emailLabel: 'البريد الإلكتروني',
    helper: 'سنرسل تأكيد الحجز والتذكيرات على بريدك',
    sendCode: 'أرسل رمز التحقق',
    sendCodeIdle: 'إرسال رمز التحقق',
    saveAndSend: 'حفظ وإرسال الرمز',
    sending: 'جاري الإرسال...',
    otpTitle: 'تحقق من بريدك',
    otpSubtitlePrefix: 'تم إرسال رمز التحقق إلى',
    resendIn: 'إعادة الإرسال خلال {seconds} ث',
    changeEmail: 'تغيير البريد',
    verifiedBadge: 'موثّق',
    unverifiedBadge: 'غير موثّق',
    edit: 'تعديل',
    genericError: 'حدث خطأ',
    verifyToPay: 'وثّق بريدك الإلكتروني لإتمام الحجز',
  },
  auth: {
    otp: {
      wrongCode: 'رمز خاطئ',
      title: 'أدخل رمز التحقق',
      sentTo: 'تم إرسال رمز التحقق إلى جوالك',
      verifying: 'جاري التحقق...',
      verify: 'تحقق',
      changeNumber: 'تغيير الرقم',
      resendIn: 'إعادة الإرسال خلال {seconds}s',
      resend: 'إعادة إرسال الرمز',
    },
  },
};

function baseUser(overrides: Partial<User> = {}): User {
  return {
    id: 'CURRENT_USER',
    role: 'user',
    firstName: 'محمد',
    lastName: 'أحمد',
    email: null,
    emailVerified: false,
    phone: '+966501234567',
    createdAt: '2025-12-01T08:00:00Z',
    ...overrides,
  };
}

function renderCard(context: 'checkout' | 'settings') {
  return render(
    <NextIntlClientProvider locale="ar" messages={messages}>
      <EmailVerificationCard context={context} />
    </NextIntlClientProvider>,
  );
}

/** Flushes the mock API's 300ms simulated latency under fake timers, inside act(). */
async function flushMockLatency() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(350);
  });
}

/** Advances fake time in 1s steps so React re-runs the cooldown effect between each tick. */
async function advanceSeconds(seconds: number) {
  for (let i = 0; i < seconds; i++) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
  }
}

// Keeps the mock API's resend cooldown (60s) from bleeding across tests —
// each test starts far enough ahead in fake time that any leftover cooldown
// from a previous test has long expired.
let timeOffsetMs = 0;

beforeEach(() => {
  vi.useFakeTimers();
  timeOffsetMs += 10 * 60 * 1000;
  vi.setSystemTime(new Date(2026, 0, 1).getTime() + timeOffsetMs);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('EmailVerificationCard — shared component across contexts', () => {
  it('settings, null email: saves + sends a code, then verifying updates the store', async () => {
    useAuthStore.setState({ user: baseUser(), isAuthenticated: true });
    renderCard('settings');

    expect(screen.getByText('حفظ وإرسال الرمز')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('name@mamsaa.com'), {
      target: { value: 'new@mamsaa.com' },
    });
    fireEvent.click(screen.getByText('حفظ وإرسال الرمز'));
    await flushMockLatency();

    expect(screen.getByText('تحقق من بريدك')).toBeTruthy();

    const digitInputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(digitInputs).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      fireEvent.change(digitInputs[i]!, { target: { value: '654321'[i] } });
    }
    await flushMockLatency();

    expect(useAuthStore.getState().user?.emailVerified).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('new@mamsaa.com');
  });

  it('checkout, unverified: renders the email-entry step directly (State 1)', () => {
    useAuthStore.setState({ user: baseUser({ email: 'existing@mamsaa.com' }), isAuthenticated: true });
    renderCard('checkout');

    // Checkout skips the settings-only collapsed "idle" row and starts at the form.
    expect(screen.getByText('أرسل رمز التحقق')).toBeTruthy();
    expect(screen.queryByText('إرسال رمز التحقق')).toBeNull();
  });

  it('checkout, already verified on mount: renders nothing (zero email UI)', () => {
    useAuthStore.setState({
      user: baseUser({ email: 'verified@mamsaa.com', emailVerified: true }),
      isAuthenticated: true,
    });
    const { container } = renderCard('checkout');
    expect(container.textContent).toBe('');
  });

  it('settings, unverified with an email: shows the amber badge + idle-row send button', () => {
    useAuthStore.setState({ user: baseUser({ email: 'existing@mamsaa.com' }), isAuthenticated: true });
    renderCard('settings');

    expect(screen.getByText('غير موثّق')).toBeTruthy();
    expect(screen.getByText('إرسال رمز التحقق')).toBeTruthy();
  });

  it('settings, verified: shows the green badge + edit action', () => {
    useAuthStore.setState({
      user: baseUser({ email: 'verified@mamsaa.com', emailVerified: true }),
      isAuthenticated: true,
    });
    renderCard('settings');

    expect(screen.getByText('موثّق')).toBeTruthy();
    expect(screen.getByText('تعديل')).toBeTruthy();
  });
});

describe('EmailVerificationCard — resend cooldown countdown', () => {
  it('counts down from 60s and re-enables the resend action', async () => {
    useAuthStore.setState({ user: baseUser(), isAuthenticated: true });
    renderCard('settings');

    fireEvent.change(screen.getByPlaceholderText('name@mamsaa.com'), {
      target: { value: 'new@mamsaa.com' },
    });
    fireEvent.click(screen.getByText('حفظ وإرسال الرمز'));
    await flushMockLatency();

    expect(screen.getByText('إعادة الإرسال خلال 60 ث')).toBeTruthy();

    await advanceSeconds(30);
    expect(screen.getByText('إعادة الإرسال خلال 30 ث')).toBeTruthy();

    await advanceSeconds(30);
    expect(screen.getByText('إعادة إرسال الرمز')).toBeTruthy();
  });
});
