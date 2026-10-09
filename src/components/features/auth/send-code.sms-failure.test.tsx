/**
 * Asking for the first code when the SMS provider fails, on every screen that
 * sends one. The backend answers 503 SMS_SEND_FAILED and the attempt costs
 * nothing — no quota, no cooldown — so each screen shows the server's own
 * words, stays where the guest is, and turns its button into "إعادة المحاولة",
 * live at once. Never a countdown, never "wait".
 *
 * Runs on the mock (its SMS provider fails for one number) through the real
 * client, the way the screens do.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import arMessages from '../../../../messages/ar.json';
import { useUiStore } from '@/stores/ui';
import { useAuthStore } from '@/stores/auth';
import { LoginDialog } from './LoginDialog';
import { RegisterDialog } from './RegisterDialog';
import ChangePhonePage from '@/app/account/phone/page';

// The local nine digits a guest types for the number the mock cannot text.
const SMS_FAILS_FOR_LOCAL = '500000503';
const SERVER_MESSAGE = 'تعذّر إرسال رمز التحقق — حاول مرة أخرى بعد قليل';
const RETRY = arMessages.common.retry;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function renderWithMessages(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="ar" messages={arMessages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

const typePhone = () =>
  fireEvent.change(screen.getByPlaceholderText('5XXXXXXXX'), { target: { value: SMS_FAILS_FOR_LOCAL } });

/** The server's words on screen, a live retry, and nothing that counts down — a second later too. */
async function expectImmediateRetry() {
  expect(await screen.findByText(SERVER_MESSAGE)).toBeTruthy();
  const retry = screen.getByRole('button', { name: RETRY }) as HTMLButtonElement;
  expect(retry.disabled).toBe(false);
  await wait(1100);
  expect(retry.disabled).toBe(false);
  expect(screen.queryByText(/\d+\s*(ثانية|s\b)/)).toBeNull();
  return retry;
}

beforeEach(() => {
  useUiStore.setState({ authDialog: null, prefillPhone: '' });
});

afterEach(() => {
  cleanup();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe('login', () => {
  it('shows the server’s words and an immediate retry, and stays on the phone step', async () => {
    useUiStore.setState({ authDialog: 'login' });
    renderWithMessages(<LoginDialog />);
    typePhone();
    fireEvent.click(screen.getByRole('button', { name: arMessages.auth.login.sendCode }));

    const retry = await expectImmediateRetry();
    expect(screen.getByPlaceholderText('5XXXXXXXX')).toBeTruthy();

    // The retry asks again straight away (and the mock fails again, the same way).
    fireEvent.click(retry);
    expect(await screen.findByText(SERVER_MESSAGE)).toBeTruthy();
  });
});

describe('sign-up', () => {
  it('shows the server’s words and an immediate retry, and keeps what the guest typed', async () => {
    useUiStore.setState({ authDialog: 'register' });
    renderWithMessages(<RegisterDialog />);
    fireEvent.change(screen.getByLabelText(arMessages.auth.register.firstName), { target: { value: 'فهد' } });
    fireEvent.change(screen.getByLabelText(arMessages.auth.register.lastName), { target: { value: 'يحيى' } });
    fireEvent.change(screen.getByLabelText(arMessages.auth.register.email), { target: { value: 'fahad@example.com' } });
    typePhone();
    fireEvent.click(screen.getByRole('button', { name: arMessages.auth.register.sendCode }));

    await expectImmediateRetry();
    expect((screen.getByLabelText(arMessages.auth.register.firstName) as HTMLInputElement).value).toBe('فهد');
  });
});

describe('changing the account’s phone', () => {
  it('shows the server’s words and an immediate retry, and stays on the form', async () => {
    useAuthStore.setState({
      user: {
        id: 'u1',
        firstName: 'فهد',
        lastName: 'يحيى',
        email: 'fahad@example.com',
        phone: '+966512345678',
      } as never,
      isAuthenticated: true,
    });
    renderWithMessages(<ChangePhonePage />);
    typePhone();
    fireEvent.click(screen.getByRole('button', { name: arMessages.account.phone.sendCode }));

    await expectImmediateRetry();
    expect(screen.getByPlaceholderText('5XXXXXXXX')).toBeTruthy();
  });
});
