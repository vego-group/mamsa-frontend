'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { contactSchema, type ContactFormValues } from '@/lib/validation/schemas';
import { BRAND, SOCIAL_LINKS } from '@/lib/constants/brand';

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-sm font-medium text-brand-ink">
      {children} <span className="text-status-danger">*</span>
    </Label>
  );
}

const CONTACT_CARDS: { icon: LucideIcon; label: string; value: string; href?: string }[] = [
  { icon: Phone, label: 'اتصل بنا', value: BRAND.phone, href: `tel:${BRAND.phone.replace(/\s/g, '')}` },
  { icon: Mail, label: 'راسلنا', value: BRAND.email, href: `mailto:${BRAND.email}` },
  { icon: MapPin, label: 'موقعنا', value: 'الرياض، المملكة العربية السعودية' },
  { icon: Clock, label: 'ساعات العمل', value: 'الأحد - الخميس · 9ص - 6م' },
];

const SOCIALS: { icon: LucideIcon; href: string; label: string }[] = [
  { icon: Instagram, href: SOCIAL_LINKS.instagram, label: 'Instagram' },
  { icon: Twitter, href: SOCIAL_LINKS.twitter, label: 'Twitter' },
  { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: 'LinkedIn' },
  { icon: Facebook, href: SOCIAL_LINKS.facebook, label: 'Facebook' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', message: '' },
  });

  const onSubmit = async (values: ContactFormValues) => {
    console.log('contact form submitted', values);
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    form.reset();
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
            تواصل معنا
          </span>
          <h1 className="mx-auto max-w-2xl text-2xl font-bold leading-relaxed md:text-4xl">
            نسعد بالتواصل معك والإجابة على استفساراتك
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
            فريق مَمسَى جاهز لمساعدتك في كل ما يخص الحجز أو عرض عقارك.
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
            <h2 className="text-2xl font-bold text-brand-ink">أرسل لنا رسالة</h2>
            <p className="mt-1 text-sm text-brand-muted">املأ النموذج وسيتواصل معك فريقنا في أقرب وقت.</p>

            {sent ? (
              <div className="flex flex-col items-center gap-3 py-14 text-center">
                <CheckCircle2 className="h-14 w-14 text-status-success" />
                <h3 className="text-lg font-bold text-brand-ink">تم استلام رسالتك!</h3>
                <p className="max-w-sm text-sm text-brand-muted">شكراً لتواصلك مع مَمسَى، سيقوم فريقنا بالرد عليك قريباً.</p>
                <Button variant="outline" size="sm" onClick={() => setSent(false)}>إرسال رسالة أخرى</Button>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <RequiredLabel>الاسم</RequiredLabel>
                    <Input placeholder="اسمك الكامل" {...form.register('name')} />
                    {form.formState.errors.name && (
                      <p className="text-xs text-status-danger">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <RequiredLabel>رقم الجوال</RequiredLabel>
                    <PhoneInput placeholder="5XXXXXXXX" dir="ltr" className="text-start" {...form.register('phone')} />
                    {form.formState.errors.phone && (
                      <p className="text-xs text-status-danger">{form.formState.errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <RequiredLabel>البريد الإلكتروني</RequiredLabel>
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
                  <RequiredLabel>الرسالة</RequiredLabel>
                  <Textarea rows={5} placeholder="كيف يمكننا مساعدتك؟" {...form.register('message')} />
                  {form.formState.errors.message && (
                    <p className="text-xs text-status-danger">{form.formState.errors.message.message}</p>
                  )}
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                  <Send className="h-4 w-4" />
                  {form.formState.isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </Button>
              </form>
            )}
          </Card>

          {/* Side panel */}
          <div className="space-y-6">
            <div className="overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80"
                alt="فريق خدمة العملاء"
                className="h-56 w-full object-cover"
              />
            </div>

            <Card className="space-y-5 bg-brand-primary p-6 text-white">
              <div>
                <h3 className="text-lg font-bold">معلومات التواصل</h3>
                <p className="mt-1 text-sm text-white/80">نحن هنا لخدمتك في أي وقت.</p>
              </div>
              <div className="space-y-3 text-sm">
                <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="flex items-center gap-3 transition hover:text-brand-sage">
                  <Phone className="h-4 w-4 shrink-0" /> <span dir="ltr">{BRAND.phone}</span>
                </a>
                <a href={`mailto:${BRAND.email}`} className="flex items-center gap-3 transition hover:text-brand-sage">
                  <Mail className="h-4 w-4 shrink-0" /> <span dir="ltr">{BRAND.email}</span>
                </a>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0" /> الرياض، المملكة العربية السعودية
                </div>
              </div>

              <div className="border-t border-white/15 pt-4">
                <div className="mb-3 text-sm font-medium">تابعنا على</div>
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
    </div>
  );
}
