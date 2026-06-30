import type { Booking } from '@/types';
import { formatDate, formatSAR } from './format';

/**
 * Generates a branded, RTL booking-confirmation document in a new window and
 * triggers the print dialog — the user saves it as a PDF. This renders Arabic
 * natively (no font embedding) and needs no PDF dependency.
 */
export function downloadBookingConfirmation(booking: Booking) {
  const guests = booking.guests.adults + booking.guests.children;
  const row = (label: string, value: string) =>
    `<tr><td class="lbl">${label}</td><td class="val">${value}</td></tr>`;

  const html = `<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<title>تأكيد الحجز ${booking.code}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color: #1F2A24; margin: 0; padding: 32px; }
  .wrap { max-width: 640px; margin: 0 auto; }
  .head { display: flex; align-items: center; justify-content: space-between;
          background: #2E5339; color: #fff; padding: 20px 24px; border-radius: 16px; }
  .brand { font-size: 24px; font-weight: 800; }
  .doc { font-size: 13px; opacity: .9; }
  .status { display:inline-block; margin-top: 16px; background:#E7F0E9; color:#2E5339;
            padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; }
  h2 { font-size: 15px; margin: 24px 0 8px; color:#2E5339; }
  .unit { font-size: 18px; font-weight: 800; margin: 4px 0; }
  .muted { color: #6B7A70; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #ECE7DB; }
  td.lbl { color: #6B7A70; }
  td.val { text-align: left; font-weight: 600; }
  .total td { border-bottom: none; border-top: 2px solid #2E5339; padding-top: 12px;
              font-size: 16px; font-weight: 800; }
  .note { margin-top: 24px; background: #F5F1E8; border-radius: 12px; padding: 14px 16px;
          font-size: 12px; color: #6B7A70; line-height: 1.7; }
  .code { font-family: monospace; letter-spacing: 1px; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="head">
      <div>
        <div class="brand">مَمسَى</div>
        <div class="doc">تأكيد الحجز</div>
      </div>
      <div style="text-align:left">
        <div class="doc">رمز التأكيد</div>
        <div class="code" style="font-size:18px;font-weight:700">${booking.code}</div>
      </div>
    </div>

    <span class="status">حجز مؤكد</span>

    <h2>الإقامة</h2>
    <div class="unit">${booking.unitSnapshot.title}</div>
    <div class="muted">${booking.unitSnapshot.city}، ${booking.unitSnapshot.country}</div>
    <div class="muted">المضيف: ${booking.unitSnapshot.ownerName}</div>

    <h2>تفاصيل الحجز</h2>
    <table>
      ${row('تاريخ الوصول', formatDate(booking.checkInDate))}
      ${row('تاريخ المغادرة', formatDate(booking.checkOutDate))}
      ${row('مدة الإقامة', `${booking.nights} ليالٍ`)}
      ${row('عدد الضيوف', `${guests} ضيوف`)}
      ${row('رقم الحجز', booking.id)}
    </table>

    <h2>ملخص السعر</h2>
    <table>
      ${row(`${booking.price.pricePerNight} ر.س × ${booking.price.nights} ليالي`, formatSAR(booking.price.subtotal))}
      ${row('رسوم الخدمة', formatSAR(booking.price.serviceFee))}
      ${row('رسوم التنظيف', formatSAR(booking.price.cleaningFee))}
      ${row('الضرائب', formatSAR(booking.price.tax))}
      <tr class="total"><td>المجموع الكلي</td><td class="val">${formatSAR(booking.price.total)}</td></tr>
    </table>

    <div class="note">
      هذا المستند تأكيد رسمي لحجزك عبر منصة مَمسَى. يُرجى الاحتفاظ برمز التأكيد وإبرازه عند تسجيل الوصول.
      للاستفسارات، تواصل مع المضيف من صفحة الحجز.
    </div>
  </div>
  <script>window.onload = function () { window.print(); };</script>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=820,height=920');
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
