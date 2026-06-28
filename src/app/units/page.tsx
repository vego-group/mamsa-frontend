import { Suspense } from 'react';
import { UnitsPageClient } from './units-page-client';

export default function UnitsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="h-12 rounded-full border border-brand-border bg-white shadow-sm" />
          <div className="mt-8 space-y-4">
            <div className="h-8 w-48 rounded bg-brand-cream/80" />
            <div className="space-y-4">
              <div className="h-48 rounded-2xl bg-brand-cream/60" />
              <div className="h-48 rounded-2xl bg-brand-cream/60" />
              <div className="h-48 rounded-2xl bg-brand-cream/60" />
            </div>
          </div>
        </div>
      }
    >
      <UnitsPageClient />
    </Suspense>
  );
}
