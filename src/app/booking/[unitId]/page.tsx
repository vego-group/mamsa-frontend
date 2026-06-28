import { Suspense } from 'react';
import { CheckoutPageClient } from './checkout-page-client';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-10">جاري التحميل...</div>}>
      <CheckoutPageClient />
    </Suspense>
  );
}
