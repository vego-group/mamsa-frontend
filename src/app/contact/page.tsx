'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contactSchema, type ContactFormValues } from '@/lib/validation/schemas';

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <Label className="text-sm font-medium text-brand-ink">
      {children} <span className="text-status-danger">*</span>
    </Label>
  );
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', message: '' },
  });

  const onSubmit = async (values: ContactFormValues) => {
    // mock submission
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
              'linear-gradient(rgba(46,83,57,0.85), rgba(46,83,57,0.95)), url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80)',
          }}
        />
        <div className="container mx-auto px-4 py-20 text-center text-white">
          <h1 className="mx-auto max-w-2xl text-2xl font-bold leading-relaxed md:text-3xl">
            نسعد بالتواصل معك والإجابة على استفساراتك
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-2xl font-bold text-brand-ink">اتصل بنا</h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-brand-muted">
            فريقنا مستعد دائمًا لدعمك وتقديم المساعدة في كل ما يتعلق بخدماتنا العقارية، سواء كنت تبحث
            عن عقار أو ترغب في عرض عقارك لتسهيل الإيجار.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Support image */}
            <div className="overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=80"
                alt="فريق خدمة العملاء"
                className="h-full min-h-[420px] w-full object-cover"
              />
            </div>

            {/* Form */}
            <div>
              {sent && (
                <div className="mb-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">
                  ✓ تم استلام رسالتك! سنقوم بالتواصل معك قريبًا.
                </div>
              )}
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <RequiredLabel>اسم المستخدم</RequiredLabel>
                  <Input placeholder="اسم المستخدم" {...form.register('name')} />
                  {form.formState.errors.name && (
                    <p className="text-xs text-status-danger">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <RequiredLabel>رقم الجوال</RequiredLabel>
                  <div className="flex items-stretch overflow-hidden rounded-xl border border-brand-border bg-white focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/20">
                    <span className="flex items-center gap-1 border-e border-brand-border bg-brand-cream px-3 text-sm text-brand-ink">
                      <span aria-hidden>🇸🇦</span>
                      <ChevronDown className="h-4 w-4 text-brand-muted" />
                    </span>
                    <input
                      type="tel"
                      dir="ltr"
                      placeholder="5XXXXXXXX"
                      className="h-11 w-full bg-transparent px-4 text-start text-brand-ink placeholder:text-brand-muted focus:outline-none"
                      {...form.register('phone')}
                    />
                  </div>
                  {form.formState.errors.phone && (
                    <p className="text-xs text-status-danger">{form.formState.errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <RequiredLabel>البريد الإلكتروني</RequiredLabel>
                  <Input
                    type="email"
                    dir="ltr"
                    className="text-start"
                    placeholder="البريد الإلكتروني"
                    {...form.register('email')}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-status-danger">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <RequiredLabel>الرسالة</RequiredLabel>
                  <Textarea rows={5} placeholder="الرسالة" {...form.register('message')} />
                  {form.formState.errors.message && (
                    <p className="text-xs text-status-danger">{form.formState.errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  <Send className="h-4 w-4" />
                  {form.formState.isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
