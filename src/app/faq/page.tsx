import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { HelpCircle, ChevronDown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('faq');
  const tc = await getTranslations('common');
  return { title: t('metaTitle', { name: tc('brandName') }), description: t('metaDescription') };
}

const GROUP_KEYS = ['booking', 'payment', 'cancellation', 'account', 'hosts'] as const;
const GROUP_ITEM_COUNT: Record<(typeof GROUP_KEYS)[number], number> = {
  booking: 4,
  payment: 3,
  cancellation: 3,
  account: 2,
  hosts: 1,
};

export default async function FaqPage() {
  const t = await getTranslations('faq');

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-primary py-14 text-white">
        <div className="container mx-auto flex flex-col items-center gap-3 px-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <HelpCircle className="h-7 w-7" />
          </span>
          <h1 className="text-3xl font-bold md:text-4xl">{t('title')}</h1>
          <p className="max-w-2xl text-sm text-white/85 md:text-base">{t('subtitle')}</p>
        </div>
      </section>

      {/* Groups */}
      <div className="container mx-auto max-w-3xl space-y-10 px-4 py-12">
        {GROUP_KEYS.map((group) => (
          <section key={group} className="space-y-3">
            <h2 className="border-e-4 border-brand-primary pe-3 text-xl font-bold text-brand-ink">
              {t(`groups.${group}.title`)}
            </h2>
            {Array.from({ length: GROUP_ITEM_COUNT[group] }).map((_, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-brand-border bg-white p-5 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 font-bold text-brand-ink marker:content-none [&::-webkit-details-marker]:hidden">
                  {t(`groups.${group}.items.${i}.q`)}
                  <ChevronDown className="h-5 w-5 shrink-0 text-brand-muted transition group-open:rotate-180" />
                </summary>
                <div className="mt-3 text-sm leading-relaxed text-brand-muted">
                  {t.rich(`groups.${group}.items.${i}.a`, {
                    cancellationLink: (chunks) => (
                      <Link href="/policies/cancellation" className="font-medium text-brand-primary hover:underline">
                        {chunks}
                      </Link>
                    ),
                    hostLink: (chunks) => (
                      <Link href="/host" className="font-medium text-brand-primary hover:underline">
                        {chunks}
                      </Link>
                    ),
                  })}
                </div>
              </details>
            ))}
          </section>
        ))}

        {/* Still need help */}
        <section className="flex flex-col items-center gap-3 rounded-2xl bg-brand-cream/50 p-8 text-center">
          <h2 className="text-lg font-bold text-brand-ink">{t('stillNeedHelp')}</h2>
          <p className="text-sm text-brand-muted">{t('stillNeedHelpBody')}</p>
          <Button asChild>
            <Link href="/contact">
              {t('contactUs')} <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
