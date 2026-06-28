# مَمسَى — User Website (Next.js 14)

موقع المستخدم لمنصة **مَمسَى (Mamsa)** لحجز الوحدات السكنية في السعودية.
مبني بـ **Next.js 14 + TypeScript + TailwindCSS + shadcn/ui**.

> هذا المشروع يغطي **موقع المستخدم فقط**. لوحات الشركاء والمشرف العام جزء من ورقة عمل منفصلة.

---

## التشغيل السريع

### المتطلبات

- Node.js 18.18+ (يُنصح بـ 20+)
- npm 9+ أو pnpm 8+ أو yarn 4+

### التثبيت والتشغيل

```bash
# 1) تثبيت الاعتماديات
npm install

# 2) إعداد متغيرات البيئة
cp .env.example .env.local

# 3) تشغيل سيرفر التطوير
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

### الأوامر المتاحة

| الأمر | الوصف |
|------|------|
| `npm run dev` | تشغيل سيرفر التطوير |
| `npm run build` | بناء نسخة الإنتاج |
| `npm start` | تشغيل نسخة الإنتاج |
| `npm run lint` | فحص جودة الكود |
| `npm run type-check` | فحص أنواع TypeScript |
| `npm test` | تشغيل اختبارات الـ engine |

---

## التركيبة

```
src/
  app/                          # Next.js App Router
    layout.tsx                  # RTL، خطوط عربية، Providers، Header، Footer
    page.tsx                    # الصفحة الرئيسية
    units/
      page.tsx                  # نتائج البحث + فلاتر جانبية
      [id]/page.tsx             # تفاصيل الوحدة
    booking/
      [unitId]/page.tsx         # صفحة الدفع (Checkout)
      confirmation/[bookingId]/page.tsx  # تأكيد الحجز
    my-reservations/
      page.tsx                  # الحجوزات بـ 4 تبويبات
      [bookingId]/page.tsx      # تفاصيل الحجز
    favorites/page.tsx          # المختارات المفضلة
    account/
      page.tsx                  # الإعدادات (بدون كلمة مرور)
      phone/page.tsx            # تغيير رقم الجوال
      payment-methods/page.tsx  # البطاقات + المعاملات
    about/page.tsx              # عن المنصة
    contact/page.tsx            # تواصل معنا

  components/
    ui/                         # shadcn/ui primitives
    shared/                     # Header، Footer، QueryProvider
    features/
      auth/                     # LoginDialog، RegisterDialog، OtpStep
      units/                    # UnitCard، FilterBar، SidebarFilters
      booking/                  # CancellationPolicyDisplay، CancelBookingDialog، BookingCard
      reviews/                  # ReviewDialog

  lib/
    cancellation/               # ⭐ محرك سياسة الإلغاء (نقي + مُختبَر)
      engine.ts
      engine.test.ts
    api/
      client.ts                 # طبقة API الموحدة (mock ↔ real)
      mock/index.ts             # تنفيذ mock يحاكي الباك إند
    constants/                  # سياسات الإلغاء، الـ brand، المرافق
    utils/                      # cn، format، phone
    validation/                 # Zod schemas

  data/mock/                    # بيانات وهمية: وحدات، حجوزات، مستخدمين، تقييمات
  stores/                       # Zustand: auth، favorites، ui
  types/                        # كل أنواع الـ domain (مطابقة لـ Backend Work Package)
```

---

## المفاهيم الأساسية

### 1) التحقق عبر OTP فقط (لا توجد كلمات مرور)

كل عمليات الدخول والتسجيل تتم عبر **رمز تحقق OTP** يُرسل لرقم الجوال السعودي.

- في وضع الـ Mock، الرمز الافتراضي للاختبار: `123456` (قابل للتغيير من `.env.local`).
- لا توجد صفحة "نسيت كلمة المرور" أو "تغيير كلمة المرور" في أي مكان من النظام.

### 2) سياسة الإلغاء (Snapshot عند الحجز)

محرك الإلغاء في `src/lib/cancellation/engine.ts` هو دوال نقية قابلة للاختبار.

- 3 قوالب: **مرنة / متوسطة / صارمة** (SRS v1.1).
- عند إنشاء الحجز، يتم **تجميد نسخة من السياسة** (`policySnapshot`)؛ تعديل الشريك لسياسة الوحدة لاحقًا **لا يؤثر** على الحجوزات القائمة.
- في صفحة "الحجوزات → إلغاء"، يظهر **معاينة الاسترداد** قبل التأكيد.
- الاسترداد يتم تلقائيًا (مهيّأ للتكامل مع Moyasar في الإنتاج).

شغّل الاختبارات للتحقق من المنطق:

```bash
npm test
```

### 3) من Mock إلى Backend حقيقي

طبقة `lib/api/client.ts` تستخدم متغير بيئة واحد للتحويل:

```env
NEXT_PUBLIC_USE_MOCK=true    # يقرأ من mock/
# أو
NEXT_PUBLIC_USE_MOCK=false   # يستخدم fetch إلى NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_API_BASE_URL=https://api.mamsa.sa
```

عند الربط مع الـ Backend، **لا حاجة لتعديل أي مكوّن**: فقط أنشئ الـ endpoints المُحددة في `client.ts` بنفس الشكل.

---

## القرارات المثبتة

- **التحقق:** OTP فقط (رقم جوال). لا كلمات مرور في أي مكان.
- **العملة:** الريال السعودي (SAR) فقط.
- **التاريخ:** ميلادي بصيغة `DD/MM/YYYY`.
- **بريد الدعم:** `info@mamsa.sa`.
- **اللغة:** عربية RTL أساسية.

---

## للنشر (Production)

```bash
npm run build
npm start
```

موصى به: Vercel أو أي منصة تدعم Next.js 14.

تأكد من ضبط متغيرات البيئة في الإنتاج:
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_USE_MOCK=false`
- `NEXT_PUBLIC_MOYASAR_PUBLIC_KEY` (عند تفعيل الدفع)

---

## المرجعية

- **SRS v1.1** (المسلّم في وثيقة منفصلة) — متطلبات النظام الكاملة
- **Backend Work Package v1.0** — تنفيذ الباك إند (DB schema، Auth، State Machines، Moyasar، APIs)
- **Storyboard Screen Inventory v1.0** — قائمة الشاشات الـ 32
