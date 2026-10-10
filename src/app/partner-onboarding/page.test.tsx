/**
 * Partner sign-up — the identity scan is part of the application.
 *
 * The registration request is multipart (not JSON) because the scan travels
 * with it: there is no session yet, so the authenticated presign upload is
 * unavailable. These tests pin the two halves that break silently — the file
 * actually reaching the wire under a browser-generated Content-Type, and a
 * server complaint about it landing back on the input the user can fix.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import PartnerOnboardingPage from './page';

// The language toggle in the page header reaches for the app router.
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/partner-onboarding',
  useSearchParams: () => new URLSearchParams(),
}));

const messages = {
  common: { retry: 'إعادة المحاولة', loadFailed: 'تعذّر تحميل البيانات' },
  partnerOnboarding: {
    agreeTo: 'بالمتابعة، فإنك توافق على',
    terms: 'الشروط',
    and: 'و',
    privacyPolicy: 'سياسة الخصوصية',
    steps: { details: 'البيانات', verify: 'التحقق', done: 'تم' },
    successTitle: 'تم استلام طلبك بنجاح!',
    successBody: 'طلب انضمامك قيد المراجعة.',
    form: {
      nameTooShort: 'الاسم قصير',
      phoneInvalid: 'رقم غير صحيح',
      emailInvalid: 'بريد غير صالح',
      crInvalid: 'سجل تجاري غير صحيح',
      nationalIdInvalid: 'هوية غير صحيحة',
      sendError: 'تعذّر الإرسال',
      title: 'إنشاء حساب شريك جديد',
      subtitle: 'أنشئ حسابك',
      partnerType: 'نوع الشريك',
      individual: 'فرد',
      company: 'شركة',
      name: 'الاسم',
      namePlaceholder: 'مثال : فهد',
      phone: 'رقم الجوال',
      email: 'البريد الالكتروني',
      emailPlaceholder: 'مثال : user@gmail.com',
      crNumber: 'رقم السجل التجاري',
      nationalId: 'رقم الهوية الوطنية',
      required: 'مطلوبة',
      optional: 'اختيارية',
      docCta: 'اختر ملفًا أو اسحبه هنا',
      docFormats: 'JPG أو PNG أو PDF · بحد أقصى 5 ميجابايت',
      docReplace: 'تغيير',
      docRemove: 'إزالة الملف',
      docWrongType: 'صيغة غير مدعومة، أرفق ملف JPG أو PNG أو PDF',
      docTooLarge: 'حجم الملف يتجاوز 5 ميجابايت',
      idFile: 'صورة الهوية الوطنية',
      idFileRequired: 'يرجى إرفاق صورة واضحة من الهوية الوطنية',
      crFile: 'صورة السجل التجاري',
      crFileNote: 'تصوير السجل بكاميرا جوالك يكفي — لا حاجة لتحويله إلى PDF.',
      sendCode: 'ارسال رمز التحقق',
    },
  },
  auth: {
    onboardingOtp: {
      title: 'تحقق من جوالك',
      body: 'أرسلنا رمزًا إلى',
      bodyContinued: 'أدخله بالأسفل.',
      wrongCode: 'رمز خاطئ',
      verifyNow: 'تحقق الآن',
      didNotReceive: 'لم يصلك الرمز؟',
      resend: 'إعادة الإرسال',
      resendWithCooldown: 'إعادة الإرسال خلال {seconds} ث',
    },
  },
};

function renderPage() {
  return render(
    <NextIntlClientProvider locale="ar" messages={messages}>
      <PartnerOnboardingPage />
    </NextIntlClientProvider>,
  );
}

/** Builds a File of an arbitrary size without allocating the bytes twice over. */
function fakeFile(name: string, type: string, sizeBytes: number): File {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

function attach(file: File, inputId = 'national-id-file') {
  const input = document.getElementById(inputId) as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

/** Fills every non-file field of the individual branch with values that pass client validation. */
function fillIdentityFields() {
  fireEvent.change(screen.getByPlaceholderText('مثال : فهد'), { target: { value: 'فهد يحيى' } });
  fireEvent.change(screen.getByPlaceholderText('5XXXXXXXX'), { target: { value: '512345678' } });
  fireEvent.change(screen.getByPlaceholderText('مثال : user@gmail.com'), {
    target: { value: 'fahad@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('1XXXXXXXXX'), { target: { value: '1012345678' } });
}

/** Switches to the company branch and fills its non-file fields. */
function fillCompanyFields() {
  fireEvent.click(screen.getByRole('button', { name: 'شركة' }));
  fireEvent.change(screen.getByPlaceholderText('مثال : فهد'), { target: { value: 'شركة ممسي' } });
  fireEvent.change(screen.getByPlaceholderText('5XXXXXXXX'), { target: { value: '512345678' } });
  fireEvent.change(screen.getByPlaceholderText('مثال : user@gmail.com'), {
    target: { value: 'co@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('7XXXXXXXXX'), { target: { value: '7012345678' } });
}

const submitButton = () =>
  screen.getByRole('button', { name: 'ارسال رمز التحقق' }) as HTMLButtonElement;

/** Waits for the OTP step, then fills it — completing the code fires the register call. */
async function enterOtp(code = '123456') {
  await screen.findByText('تحقق من جوالك');
  const boxes = screen.getAllByRole('textbox');
  code.split('').forEach((digit, i) => {
    fireEvent.change(boxes[i]!, { target: { value: digit } });
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        data: {
          access_token: 'a',
          refresh_token: 'r',
          user: { id: '1', name: 'فهد', phone: '0512345678' },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    ),
  );
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe('Partner sign-up — identity document', () => {
  it('keeps an individual from submitting until a scan is attached', async () => {
    renderPage();
    fillIdentityFields();

    expect(submitButton().disabled).toBe(true);

    attach(fakeFile('id.jpg', 'image/jpeg', 400_000));

    await waitFor(() => expect(submitButton().disabled).toBe(false));
  });

  it('rejects a wrong-type or oversized file on the input, without uploading it', () => {
    renderPage();
    fillIdentityFields();

    attach(fakeFile('id.docx', 'application/msword', 1000));
    expect(screen.getByText('صيغة غير مدعومة، أرفق ملف JPG أو PNG أو PDF')).toBeTruthy();

    attach(fakeFile('id.png', 'image/png', 6 * 1024 * 1024));
    expect(screen.getByText('حجم الملف يتجاوز 5 ميجابايت')).toBeTruthy();

    expect(submitButton().disabled).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the scan as multipart, letting the browser set Content-Type', async () => {
    renderPage();
    fillIdentityFields();
    const scan = fakeFile('id.jpg', 'image/jpeg', 400_000);
    attach(scan);

    await waitFor(() => expect(submitButton().disabled).toBe(false));
    fireEvent.click(submitButton());

    await enterOtp();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/auth/partner/register');
    expect(init.body).toBeInstanceOf(FormData);

    const body = init.body as FormData;
    expect(body.get('type')).toBe('individual');
    expect(body.get('national_id')).toBe('1012345678');
    expect(body.get('national_id_file')).toBe(scan);

    // A manual Content-Type would strip the multipart boundary and the API
    // would read zero fields.
    const headers = init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();

    expect(await screen.findByText('تم استلام طلبك بنجاح!')).toBeTruthy();
  });

  it('returns to the form with a 422 on the document shown under the file input', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'The given data was invalid.',
          errors: { national_id_file: ['The national id file field is required.'] },
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    renderPage();
    fillIdentityFields();
    attach(fakeFile('id.jpg', 'image/jpeg', 400_000));
    await waitFor(() => expect(submitButton().disabled).toBe(false));
    fireEvent.click(submitButton());

    await enterOtp();

    expect(
      await screen.findByText('The national id file field is required.'),
    ).toBeTruthy();
    // Back on the form, not stuck on the OTP step.
    expect(screen.getByText('إنشاء حساب شريك جديد')).toBeTruthy();
  });

  it('never asks a company for an identity scan', () => {
    renderPage();
    fillCompanyFields();

    expect(document.getElementById('national-id-file')).toBeNull();
    expect(document.getElementById('cr-file')).not.toBeNull();
  });
});

describe('Company sign-up — commercial registration scan', () => {
  it('submits without a scan while the backend still treats cr_file as optional', async () => {
    renderPage();
    fillCompanyFields();

    // Optional today: leaving it empty must not block the button (§5 of the hand-off).
    expect(submitButton().disabled).toBe(false);

    fireEvent.click(submitButton());
    await enterOtp();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = (fetchMock.mock.calls[0] as [string, RequestInit])[1].body as FormData;
    expect(body.get('type')).toBe('company');
    expect(body.get('cr_number')).toBe('7012345678');
    // Omitted, not blanked — an empty value would overwrite a CR already on file.
    expect(body.get('cr_file')).toBeNull();
  });

  it('sends an attached scan as cr_file on the same multipart request', async () => {
    renderPage();
    fillCompanyFields();
    const scan = fakeFile('cr.png', 'image/png', 900_000);
    attach(scan, 'cr-file');

    await waitFor(() => expect(submitButton().disabled).toBe(false));
    fireEvent.click(submitButton());
    await enterOtp();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = init.body as FormData;
    expect(body.get('cr_file')).toBe(scan);
    expect(body.get('national_id_file')).toBeNull();
    expect((init.headers as Record<string, string>)['Content-Type']).toBeUndefined();

    expect(await screen.findByText('تم استلام طلبك بنجاح!')).toBeTruthy();
  });

  it('rejects an oversized CR scan without blocking the (still optional) submit', () => {
    renderPage();
    fillCompanyFields();

    attach(fakeFile('cr.pdf', 'application/pdf', 6 * 1024 * 1024), 'cr-file');

    expect(screen.getByText('حجم الملف يتجاوز 5 ميجابايت')).toBeTruthy();
    expect(submitButton().disabled).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns to the form with a 422 on cr_file shown under the field', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'The given data was invalid.',
          errors: { cr_file: ['صيغة الملف غير مدعومة (jpg, png, pdf).'] },
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    renderPage();
    fillCompanyFields();
    attach(fakeFile('cr.png', 'image/png', 900_000), 'cr-file');
    fireEvent.click(submitButton());
    await enterOtp();

    expect(await screen.findByText('صيغة الملف غير مدعومة (jpg, png, pdf).')).toBeTruthy();
    expect(screen.getByText('إنشاء حساب شريك جديد')).toBeTruthy();
  });
});

/**
 * The SMS provider failing on the first code: 503 SMS_SEND_FAILED costs the
 * partner no quota and no cooldown, so the form shows the server's words, keeps
 * everything typed, and its button becomes a live "إعادة المحاولة".
 * (On the mock, whose SMS provider fails for one number.)
 */
describe('Partner sign-up — the SMS provider fails', () => {
  it('shows the server’s words and an immediate retry on the form', async () => {
    renderPage();
    fillIdentityFields();
    fireEvent.change(screen.getByPlaceholderText('5XXXXXXXX'), { target: { value: '500000503' } });
    attach(fakeFile('id.jpg', 'image/jpeg', 400_000));
    await waitFor(() => expect(submitButton().disabled).toBe(false));
    fireEvent.click(submitButton());

    expect(await screen.findByText('تعذّر إرسال رمز التحقق — حاول مرة أخرى بعد قليل')).toBeTruthy();
    const retry = screen.getByRole('button', { name: 'إعادة المحاولة' }) as HTMLButtonElement;
    expect(retry.disabled).toBe(false);
    expect((screen.getByPlaceholderText('مثال : فهد') as HTMLInputElement).value).toBe('فهد يحيى');
    expect(screen.queryByText('تحقق من جوالك')).toBeNull();
  });
});

/**
 * The code step must not blame the code for what is not the code. Measured on
 * staging: a wrong code answers 422 with the error on the `code` field; a
 * missing scan answers 422 on `national_id_file`. A scan goes back to the form
 * (above); a wrong code keeps the generic copy; anything else shows the
 * server's own words, and the partner stays on the code step with what they
 * typed. Both error shapes count — the backend is moving from `errors` to
 * `fields`.
 */
describe('Partner sign-up — what the code step says when registration fails', () => {
  const refuse = (body: unknown, status = 422) =>
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
    );

  async function reachCodeStepAndEnter() {
    renderPage();
    fillIdentityFields();
    attach(fakeFile('id.jpg', 'image/jpeg', 400_000));
    await waitFor(() => expect(submitButton().disabled).toBe(false));
    fireEvent.click(submitButton());
    await enterOtp('482913');
  }

  const codeBoxes = () => screen.getAllByRole('textbox') as HTMLInputElement[];

  it('returns to the form for a scan error in the new shape too', async () => {
    refuse({
      success: false,
      message: 'صورة الهوية الوطنية مطلوبة.',
      code: 'VALIDATION',
      fields: { national_id_file: ['صورة الهوية الوطنية مطلوبة.'] },
    });
    await reachCodeStepAndEnter();
    expect(await screen.findByText('صورة الهوية الوطنية مطلوبة.')).toBeTruthy();
    expect(screen.getByText('إنشاء حساب شريك جديد')).toBeTruthy();
  });

  it.each([
    ['old', { message: 'رمز غير صحيح. المحاولات المتبقية: 2', errors: { code: ['رمز غير صحيح. المحاولات المتبقية: 2'] } }],
    ['new', { success: false, message: 'رمز غير صحيح. المحاولات المتبقية: 2', code: 'VALIDATION', fields: { code: ['رمز غير صحيح. المحاولات المتبقية: 2'] } }],
  ])('keeps the generic copy for a wrong code (%s shape)', async (_shape, body) => {
    refuse(body);
    await reachCodeStepAndEnter();
    expect(await screen.findByText('رمز خاطئ')).toBeTruthy();
    expect(codeBoxes().every((box) => box.value === '')).toBe(true);
    expect(codeBoxes()[0]!.getAttribute('aria-invalid')).toBe('true');
  });

  it.each([
    ['old', { message: 'The email has already been taken.', errors: { email: ['The email has already been taken.'] } }],
    ['new', { success: false, message: 'البريد الإلكتروني مستخدم بالفعل.', code: 'VALIDATION', fields: { email: ['البريد الإلكتروني مستخدم بالفعل.'] } }],
  ])('shows the server’s words for any other error, and keeps the partner on the code step (%s shape)', async (_shape, body) => {
    refuse(body);
    await reachCodeStepAndEnter();
    const words = (body as { message: string }).message;
    expect(await screen.findByText(words)).toBeTruthy();
    expect(screen.queryByText('رمز خاطئ')).toBeNull();
    expect(screen.getByText('تحقق من جوالك')).toBeTruthy();
    // The code itself was never the problem: kept, and not marked wrong.
    expect(codeBoxes().map((box) => box.value).join('')).toBe('482913');
    expect(codeBoxes()[0]!.getAttribute('aria-invalid')).toBeNull();
  });

  it('says the connection failed when there is no answer at all, not that the code is wrong', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await reachCodeStepAndEnter();
    expect(await screen.findByText('تعذّر تحميل البيانات')).toBeTruthy();
    expect(screen.queryByText('رمز خاطئ')).toBeNull();
  });
});
