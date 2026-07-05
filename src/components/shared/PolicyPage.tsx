import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Shared shell for legal/policy pages (سياسة الإلغاء، قواعد الأمان، قواعد البيت).
 * Keeps the three pages visually identical: brand hero + narrow reading column.
 */

interface PolicyPageProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Pre-translated e.g. "Last updated: July 2026" / "آخر تحديث: يوليو 2026". */
  lastUpdatedLabel: string;
  children: ReactNode;
}

export function PolicyPage({ icon: Icon, title, subtitle, lastUpdatedLabel, children }: PolicyPageProps) {
  return (
    <div>
      <section className="bg-brand-primary py-14 text-white">
        <div className="container mx-auto flex flex-col items-center gap-3 px-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Icon className="h-7 w-7" />
          </span>
          <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/85 md:text-base">{subtitle}</p>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{lastUpdatedLabel}</span>
        </div>
      </section>

      <div className="container mx-auto max-w-3xl space-y-10 px-4 py-12">{children}</div>
    </div>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="border-e-4 border-brand-primary pe-3 text-xl font-bold text-brand-ink">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-brand-muted [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pe-5 [&_strong]:text-brand-ink">
        {children}
      </div>
    </section>
  );
}

/** Highlighted note (e.g. the frozen-policy rule) — draws the eye without shouting. */
export function PolicyNote({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-sage/40 bg-brand-cream/50 p-4 text-sm leading-relaxed text-brand-ink">
      {children}
    </div>
  );
}
