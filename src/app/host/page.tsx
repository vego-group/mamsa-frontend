import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  ArrowLeft,
  BadgeDollarSign,
  CalendarCheck,
  Check,
  ChevronDown,
  Headphones,
  ImagePlus,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('host');
  const tc = await getTranslations('common');
  return { title: t('metaTitle', { name: tc('brandName') }), description: t('metaDescription') };
}

const SIGNUP = '/partner-onboarding';

const BENEFIT_ICONS: LucideIcon[] = [BadgeDollarSign, ShieldCheck, Users, SlidersHorizontal, TrendingUp, Headphones];
const STEP_ICONS: LucideIcon[] = [UserPlus, ImagePlus, CalendarCheck];

export default async function HostLandingPage() {
  const t = await getTranslations('host');
  const tc = await getTranslations('common');
  const brandName = tc('brandName');

  const HERO_BULLETS = [t('heroBullets.0'), t('heroBullets.1'), t('heroBullets.2')];
  const BENEFITS = BENEFIT_ICONS.map((icon, i) => ({ icon, title: t(`benefits.${i}.title`), body: t(`benefits.${i}.body`) }));
  const STEPS = STEP_ICONS.map((icon, i) => ({ icon, title: t(`steps.${i}.title`), body: t(`steps.${i}.body`) }));
  const TESTIMONIALS = [0, 1, 2].map((i) => ({
    quote: t(`testimonials.${i}.quote`),
    name: t(`testimonials.${i}.name`),
    role: t(`testimonials.${i}.role`),
  }));
  const FAQS = [0, 1, 2, 3, 4, 5].map((i) => ({ q: t(`faqs.${i}.q`), a: t(`faqs.${i}.a`) }));

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(31,42,36,0.78), rgba(31,42,36,0.62)), url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80)',
          }}
        />
        <div className="container mx-auto grid items-center gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          {/* copy */}
          <div className="text-white">
            <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-medium backdrop-blur">
              {t('eyebrow')}
            </span>
            <h1 className="mb-4 text-3xl font-bold leading-tight md:text-5xl">{t('heroTitle')}</h1>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-white/85 md:text-base">{t('heroSubtitle')}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={SIGNUP}>{t('registerFree')} <ArrowLeft className="h-4 w-4 ltr:rotate-180" /></Link>
              </Button>
              <a href="#how" className="text-sm font-medium text-white/90 underline-offset-4 hover:underline">
                {t('howItWorksLink')}
              </a>
            </div>
          </div>

          {/* signup teaser card */}
          <div className="mx-auto w-full max-w-md rounded-2xl border border-white/20 bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-brand-ink">{t('registerFree')}</h2>
            <ul className="space-y-3">
              {HERO_BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-brand-ink">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-6 w-full" size="lg">
              <Link href={SIGNUP}>{t('startNow')} <ArrowLeft className="h-4 w-4 ltr:rotate-180" /></Link>
            </Button>
            <p className="mt-3 text-center text-xs text-brand-muted">
              {t('haveAccount')}{' '}
              <Link href={SIGNUP} className="font-medium text-brand-primary hover:underline">
                {t('continueRegistration')}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto space-y-8 px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">{t('benefitsTitle', { name: brandName })}</h2>
          <p className="mt-2 text-sm text-brand-muted">{t('benefitsSubtitle')}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((f) => (
            <div key={f.title} className="rounded-2xl border border-brand-border bg-white p-6 transition hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cream text-brand-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-bold text-brand-ink">{f.title}</h3>
              <p className="text-sm leading-relaxed text-brand-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-brand-cream/50 py-16">
        <div className="container mx-auto space-y-10 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">{t('stepsTitle')}</h2>
            <p className="mt-2 text-sm text-brand-muted">{t('stepsSubtitle')}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-brand-border bg-white p-6 text-start">
                <span className="absolute end-5 top-5 text-3xl font-bold text-brand-sage/60">{i + 1}</span>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-cream text-brand-primary">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-bold text-brand-ink">{step.title}</h3>
                <p className="text-sm leading-relaxed text-brand-muted">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Button asChild size="lg">
              <Link href={SIGNUP}>{t('registerNow')} <ArrowLeft className="h-4 w-4 ltr:rotate-180" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto space-y-8 px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">{t('testimonialsTitle')}</h2>
          <p className="mt-2 text-sm text-brand-muted">{t('testimonialsSubtitle')}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((tm) => (
            <figure key={tm.name} className="flex flex-col rounded-2xl border border-brand-border bg-white p-6">
              <div className="mb-3 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-brand-ink">“{tm.quote}”</blockquote>
              <figcaption className="mt-4 border-t border-brand-border pt-4">
                <div className="font-bold text-brand-ink">{tm.name}</div>
                <div className="text-xs text-brand-muted">{tm.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-brand-cream/50 py-16">
        <div className="container mx-auto max-w-3xl space-y-8 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">{t('faqTitle')}</h2>
            <p className="mt-2 text-sm text-brand-muted">{t('faqSubtitle')}</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-brand-border bg-white p-5 [&_summary]:cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 font-bold text-brand-ink marker:content-none [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-brand-muted transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-brand-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-primary py-16 text-white">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center">
          <h2 className="max-w-2xl text-2xl font-bold md:text-3xl">{t('finalCtaTitle')}</h2>
          <p className="max-w-xl text-sm text-white/80">{t('finalCtaBody')}</p>
          <Button asChild size="lg" variant="soft">
            <Link href={SIGNUP}>{t('registerFree')} <ArrowLeft className="h-4 w-4 ltr:rotate-180" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
