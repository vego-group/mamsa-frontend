import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Shield, Users, MapPin, Award, Target, Eye, Heart, Sparkles,
  ArrowLeft, BadgeCheck, Headphones, Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: `عن ${BRAND.nameAr} — منصة الإقامات العقارية`,
  description: BRAND.tagline,
};

const STATS = [
  { value: '2026', label: 'انطلقنا في' },
  { value: '%100', label: 'وحدات موثّقة' },
  { value: '24/7', label: 'دعم العملاء' },
  { value: 'مرخّصة', label: 'من وزارة السياحة' },
];

const VALUES = [
  { icon: Shield, title: 'مرخّصون', body: `منصة معتمدة من ${BRAND.licenseAuthority} السعودية، نعمل ضمن الأطر النظامية.` },
  { icon: BadgeCheck, title: 'موثّقون', body: 'كل عقار يخضع لمراجعة ميدانية وتدقيق قبل نشره على المنصة.' },
  { icon: MapPin, title: 'تغطية واسعة', body: 'إقامات متنوّعة في مختلف مدن المملكة، من المدن الكبرى إلى الوجهات الهادئة.' },
  { icon: Award, title: 'جودة عالية', body: 'معايير دقيقة للصور والمرافق والخدمة لضمان أفضل تجربة إقامة.' },
];

const WHY = [
  { icon: Sparkles, title: 'تجربة سلسة', body: 'بحث وحجز بخطوات بسيطة وواجهة عربية واضحة مصمّمة لراحتك.' },
  { icon: Wallet, title: 'دفع آمن', body: 'مدفوعات محمية ووسائل دفع موثوقة، مع شفافية كاملة في الأسعار.' },
  { icon: Headphones, title: 'دعم متواصل', body: 'فريق خدمة عملاء جاهز لمساعدتك قبل وأثناء وبعد إقامتك.' },
  { icon: Heart, title: 'إقامات مميّزة', body: 'وحدات مختارة بعناية تجمع بين الراحة والخصوصية والذوق الرفيع.' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(31,42,36,0.82), rgba(46,83,57,0.9)), url(https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=2000&q=80)',
          }}
        />
        <div className="container mx-auto px-4 py-24 text-center text-white">
          <span className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1 text-sm font-medium backdrop-blur">
            تعرّف علينا
          </span>
          <h1 className="mb-4 text-3xl font-bold md:text-5xl">عن منصة {BRAND.nameAr}</h1>
          <p className="mx-auto max-w-2xl leading-relaxed text-white/85">{BRAND.tagline}</p>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-brand-border bg-white">
        <div className="container mx-auto grid grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-brand-primary md:text-4xl">{s.value}</div>
              <div className="mt-1 text-sm text-brand-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="container mx-auto grid items-stretch gap-6 px-4 py-16 md:grid-cols-2">
        <Card className="space-y-3 p-7">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cream text-brand-primary">
            <Eye className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-brand-ink">رؤيتنا</h2>
          <p className="leading-relaxed text-brand-muted">
            أن نكون المنصة الأولى في المملكة العربية السعودية لحجز الإقامات الفريدة، ونُسهم في
            ازدهار قطاع السياحة والضيافة دعماً لمستهدفات رؤية 2030.
          </p>
        </Card>
        <Card className="space-y-3 p-7">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cream text-brand-primary">
            <Target className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-brand-ink">رسالتنا</h2>
          <p className="leading-relaxed text-brand-muted">
            تقديم تجربة بحث وحجز سلسة وآمنة، تربط النزلاء بإقامات موثّقة عالية الجودة، وتمنح
            أصحاب العقارات أدوات بسيطة لعرض وحداتهم وتحقيق دخل موثوق.
          </p>
        </Card>
      </section>

      {/* Values */}
      <section className="bg-brand-cream/40 py-16">
        <div className="container mx-auto space-y-10 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">قيمنا</h2>
            <p className="mt-2 text-sm text-brand-muted">المبادئ التي نبني عليها كل تفصيلة في المنصة</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <Card key={v.title} className="space-y-3 p-6 text-center transition hover:shadow-md">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-brand-ink">{v.title}</h3>
                <p className="text-sm leading-relaxed text-brand-muted">{v.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Mamsa */}
      <section className="container mx-auto space-y-10 px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">لماذا {BRAND.nameAr}؟</h2>
          <p className="mt-2 text-sm text-brand-muted">ما الذي يجعل تجربتك معنا مختلفة</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {WHY.map((w) => (
            <div key={w.title} className="flex flex-col items-start gap-3">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-cream text-brand-primary">
                <w.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-brand-ink">{w.title}</h3>
              <p className="text-sm leading-relaxed text-brand-muted">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-primary py-16 text-white">
        <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center">
          <Users className="h-10 w-10 text-brand-sage" />
          <h2 className="max-w-2xl text-2xl font-bold md:text-3xl">ابدأ رحلتك مع {BRAND.nameAr} اليوم</h2>
          <p className="max-w-xl text-sm text-white/80">
            سواء كنت تبحث عن إقامتك القادمة أو تريد عرض عقارك — مَمسَى هي وجهتك.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="soft">
              <Link href="/units">تصفّح الإقامات <ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="sage">
              <Link href="/host">سجّل عقارك <ArrowLeft className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
