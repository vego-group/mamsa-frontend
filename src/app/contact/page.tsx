'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Send, Phone, Mail, MapPin, Clock, CheckCircle2,
  Instagram, Twitter, Linkedin, Facebook, type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { makeContactSchema, type ContactFormValues } from '@/lib/validation/schemas';
import { miscApi } from '@/lib/api/client';
import { toSaudiLocal } from '@/lib/utils/phone';
import { BRAND, SOCIAL_LINKS } from '@/lib/constants/brand';

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-sm font-medium text-brand-ink">
      {children} <span className="text-status-danger">*</span>
    </Label>
  );
}

const SOCIALS: { icon: LucideIcon; href: string; label: string }[] = [
  { icon: Instagram, href: SOCIAL_LINKS.instagram, label: 'Instagram' },
  { icon: Twitter, href: SOCIAL_LINKS.twitter, label: 'Twitter' },
  { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: 'LinkedIn' },
  { icon: Facebook, href: SOCIAL_LINKS.facebook, label: 'Facebook' },
];

export default function ContactPage() {
  const t = useTranslations('contact');
  const tv = useTranslations('validation');
  const [sent, setSent] = useState(false);
  const contactSchema = useMemo(() => makeContactSchema(tv), [tv]);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', message: '' },
  });

  const [error, setError] = useState<string | null>(null);

  const CONTACT_CARDS: { icon: LucideIcon; label: string; value: string; href?: string }[] = [
    { icon: Phone, label: t('cards.phone'), value: BRAND.phone, href: `tel:${BRAND.phone.replace(/\s/g, '')}` },
    { icon: Mail, label: t('cards.email'), value: BRAND.email, href: `mailto:${BRAND.email}` },
    { icon: MapPin, label: t('cards.location'), value: t('locationValue') },
    { icon: Clock, label: t('cards.hours'), value: t('hoursValue') },
  ];

  const onSubmit = async (values: ContactFormValues) => {
    setError(null);
    try {
      // Backend expects the local 05XXXXXXXX form.
      await miscApi.contact({ ...values, phone: toSaudiLocal(values.phone) ?? values.phone });
      setSent(true);
      form.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : t('sendError'));
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(31,42,36,0.82), rgba(46,83,57,0.9)), url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80)',
          }}
        />
        <div className="container mx-auto px-4 py-20 text-center text-white">
          <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-medium backdrop-blur">
            {t('eyebrow')}
          </span>
          <h1 className="mx-auto max-w-2xl text-2xl font-bold leading-relaxed md:text-4xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Contact info cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_CARDS.map((c) => {
            const inner = (
              <Card className="flex h-full flex-col items-center gap-2 p-6 text-center transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
                  <c.icon className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-brand-ink">{c.label}</div>
                <div className="text-xs text-brand-muted" dir={c.href ? 'ltr' : undefined}>{c.value}</div>
              </Card>
            );
            return c.href ? (
              <a key={c.label} href={c.href}>{inner}</a>
            ) : (
              <div key={c.label}>{inner}</div>
            );
          })}
        </div>
      </section>

      {/* Form + side */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <Card className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-brand-ink">{t('formTitle')}</h2>
            <p className="mt-1 text-sm text-brand-muted">{t('formSubtitle')}</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <RequiredLabel>{t('fields.name')}</RequiredLabel>
                    <Input placeholder={t('placeholders.name')} {...form.register('name')} />
                    {form.formState.errors.name && (
                      <p className="text-xs text-status-danger">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>{t('fields.phone')}</RequiredLabel>
                    <PhoneInput placeholder="5XXXXXXXX" dir="ltr" className="text-start" {...form.register('phone')} />
                    {form.formState.errors.phone && (
                      <p className="text-xs text-status-danger">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <RequiredLabel>{t('fields.email')}</RequiredLabel>
                  <Input
                    type="email"
                    dir="ltr"
                    className="text-start"
                    placeholder="example@email.com"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-status-danger">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <RequiredLabel>{t('fields.message')}</RequiredLabel>
                  <Textarea rows={5} placeholder={t('placeholders.message')} {...form.register('message')} />
                  {form.formState.errors.message && (
                    <p className="text-xs text-status-danger">{form.formState.errors.message.message}</p>
                  )}
                </div>

                {error && <p className="text-sm text-status-danger">{error}</p>}

                <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                  <Send className="h-4 w-4" />
                  {form.formState.isSubmitting ? t('sending') : t('send')}
                </Button>
            </form>
          </Card>

          {/* Side panel */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80"
                alt={t('teamImageAlt')}
                className="h-56 w-full object-cover"
              />
            </div>

            <Card className="space-y-5 bg-brand-primary p-6 text-white">
              <div>
                <h3 className="text-lg font-bold">{t('sideTitle')}</h3>
                <p className="mt-1 text-sm text-white/80">{t('sideSubtitle')}</p>
              </div>
              <div className="space-y-3 text-sm">
                <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 transition hover:text-brand-sage">
                  <Phone className="h-4 w-4 shrink-0" /> <span dir="ltr">{BRAND.phone}</span>
                </a>
                <a href={`mailto:${BRAND.email}`} className="flex items-center gap-3 transition hover:text-brand-sage">
                  <Mail className="h-4 w-4 shrink-0" /> <span dir="ltr">{BRAND.email}</span>
                </a>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0" /> {t('locationValue')}
                </div>
              </div>

              <div className="border-t border-white/15 pt-4">
                <div className="mb-3 text-sm font-medium">{t('followUs')}</div>
                <div className="flex gap-2">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
                    >
                      <s.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Success popup */}
      {sent && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSent(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-9 w-9 text-status-success" />
            </div>
            <h3 className="text-xl font-bold text-brand-ink">{t('successTitle')}</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">
              {t('successBody')}
            </p>
            <Button className="mt-6 w-full" size="lg" onClick={() => setSent(false)}>
              {t('done')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
