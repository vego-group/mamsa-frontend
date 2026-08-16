# Task — CORS: إضافة `localhost` لقائمة الأصول المسموحة

**Date:** 2026-08-17 · From: Next.js (www) · **Status:** طلب — بند واحد، تعديل إعداد فقط

كل نداء من المتصفح إلى `https://api.mamsaa.com/api/v1` أثناء التطوير المحلي يفشل بـ `Failed to fetch`.
السبب **مو** في كود الواجهة: الـ API ما يرجّع `Access-Control-Allow-Origin` للأصل `http://localhost:3000`، فالمتصفح يحجب الطلب قبل ما يُرسل أصلاً (لذلك DevTools يعرض "Provisional headers are shown" وما فيه Response).

الأثر: صفحة `/partner-onboarding` وكل النداءات العميلة (OTP، التسجيل، الحجز، المدفوعات) ما تشتغل محلياً. النداءات من الـ Server Components تشتغل عادي لأنها ما تمرّ على CORS — وهذا اللي يخلّي المشكلة تبان في الفورمات فقط.

---

## الدليل

الأصول الإنتاجية مسموحة، والـ localhost لا:

```bash
$ curl -i -X OPTIONS https://api.mamsaa.com/api/v1/auth/request-otp \
    -H "Origin: https://mamsaa.com" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type"

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://mamsaa.com     ← موجود
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: content-type
Access-Control-Max-Age: 86400
```

```bash
$ curl -i -X OPTIONS https://api.mamsaa.com/api/v1/auth/request-otp \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type"

HTTP/1.1 204 No Content
(ولا هيدر Access-Control-* واحد)                     ← هنا الحجب
```

والـ endpoint نفسه سليم تماماً — نفس الطلب بدون متصفح ينجح:

```bash
$ curl -X POST https://api.mamsaa.com/api/v1/auth/request-otp \
    -H "Content-Type: application/json" -d '{"phone":"0512345678"}'

{"success":true,"message":"تم إرسال رمز التحقق","data":{"phone":"0512345678"}}
```

**ملاحظة:** قائمة الهيدرات (`Access-Control-Allow-Headers`) سليمة — الـ API يرجّع أي هيدر يُطلب (`authorization`, `ngrok-skip-browser-warning`) طالما الأصل مسموح. المشكلة في **الأصل فقط**.

---

## المطلوب

في `config/cors.php` على الـ API:

```php
'paths' => ['api/*'],

'allowed_origins' => [
    'https://mamsaa.com',
    'https://www.mamsaa.com',
    'http://localhost:3000',    // ← جديد: تطوير محلي
    'http://127.0.0.1:3000',    // ← جديد: نفس الشي بصيغة IP
],

'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

ثم:

```bash
php artisan config:clear && php artisan cache:clear
```

### تحفّظات

- **لا تستخدموا `'allowed_origins' => ['*']`** — `supports_credentials: true` مع wildcard مرفوض من المتصفح أصلاً، وكمان يفتح الـ API لأي موقع.
- الأفضل تكون القائمة من `.env` عشان الإنتاج ما يحمل أصول التطوير:
  ```php
  'allowed_origins' => array_filter(explode(',', env('CORS_ALLOWED_ORIGINS', 'https://mamsaa.com,https://www.mamsaa.com'))),
  ```
  ويُضاف `localhost` في `.env` بيئة الـ staging/dev فقط.
- لو فيه أصل معاينة على Vercel (`https://*.vercel.app`) يُضاف هو كمان، وإلا نفس العطل يتكرر على كل deploy preview.

### التحقّق بعد التنفيذ

```bash
curl -i -X OPTIONS https://api.mamsaa.com/api/v1/auth/request-otp \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"
```

المتوقّع: `Access-Control-Allow-Origin: http://localhost:3000` في الرد.
