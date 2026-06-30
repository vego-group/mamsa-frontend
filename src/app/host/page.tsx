import Link from 'next/link';
import type { Metadata } from 'next';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BRAND } from '@/lib/constants/brand';

export const metadata: Metadata = {
  title: `سجّل عقارك — ${BRAND.nameAr}`,
  description: 'اعرض عقارك على منصة مَمسَى واستقبل الحجوزات بثقة، مع دفعات مضمونة وحماية وتحكّم كامل.',
};

const SIGNUP = '/partner-onboarding';

const HERO_BULLETS = [
  'دفعات مضمونة وسريعة بعد كل إقامة',
  'حماية ضد الأضرار حتى تستضيف باطمئنان',
  'تحكّم كامل في الأسعار والتقويم والقواعد',
];

const BENEFITS = [
  { icon: BadgeDollarSign, title: 'دفعات مضمونة', body: 'استلم أرباحك بشكل آمن وسريع بعد مغادرة كل ضيف، عبر وسائل دفع موثوقة.' },
  { icon: ShieldCheck, title: 'حماية للمضيف', body: 'تغطية ضد الأضرار التي قد يسبّبها الضيوف، حتى تستضيف بثقة وراحة بال.' },
  { icon: Users, title: 'جمهور واسع', body: 'اعرض عقارك أمام آلاف الباحثين عن إقامة داخل المملكة كل شهر.' },
  { icon: SlidersHorizontal, title: 'تحكّم كامل', body: 'أنت صاحب القرار — حدّد الأسعار والتوافر وقواعد الإقامة كما يناسبك.' },
  { icon: TrendingUp, title: 'تسعير ذكي', body: 'اقتراحات أسعار مبنية على الطلب والموسم لزيادة دخلك وإشغال عقارك.' },
  { icon: Headphones, title: 'دعم على مدار الساعة', body: 'فريق مَمسَى جاهز لمساعدتك في أي وقت، قبل وأثناء وبعد الحجز.' },
];

const STEPS = [
  { icon: UserPlus, title: 'سجّل عقارك', body: 'أنشئ حسابك كمضيف خلال دقائق ببيانات بسيطة ورقم جوالك.' },
  { icon: ImagePlus, title: 'أضف التفاصيل والصور', body: 'اكتب وصف عقارك، أضف صوره ومرافقه، وحدّد سعره وقواعده.' },
  { icon: CalendarCheck, title: 'استقبل الحجوزات واربح', body: 'انشر عقارك واستقبل طلبات الحجز وابدأ بتحقيق دخل إضافي.' },
];

const TESTIMONIALS = [
  { quote: 'سجّلت استراحتي في أقل من ربع ساعة، وأول حجز جاني خلال يومين. المنصة سهلة جداً.', name: 'فهد العتيبي', role: 'مضيف في الرياض' },
  { quote: 'أكثر ما أعجبني الدفعات السريعة والحماية. أصبحت أستضيف وأنا مطمئن على عقاري.', name: 'نورة الشهري', role: 'مضيفة في أبها' },
  { quote: 'إشغال شاليهي ارتفع بشكل واضح بعد ما عرضته على مَمسَى، والدعم متعاون في أي وقت.', name: 'سلطان القحطاني', role: 'مضيف في جدة' },
];

const FAQS = [
  { q: 'هل التسجيل مجاني؟', a: 'نعم، إنشاء حساب المضيف وعرض عقارك على مَمسَى مجاني تماماً. لا توجد رسوم اشتراك مقدمة.' },
  { q: 'متى سيظهر عقاري للنزلاء؟', a: 'بمجرد إكمال بيانات عقاره وصوره، يخضع لمراجعة سريعة من فريقنا ثم يُنشر ويصبح متاحاً للحجز.' },
  { q: 'متى أستلم أرباحي؟', a: 'تُحوّل مدفوعاتك بشكل آمن بعد تسجيل مغادرة الضيف، عبر وسيلة الدفع التي تختارها.' },
  { q: 'هل أتحكم في الأسعار والتوافر؟', a: 'بالكامل. أنت من يحدّد السعر والتقويم وقواعد الإقامة، ويمكنك تعديلها في أي وقت من لوحة التحكم.' },
  { q: 'ماذا لو تسبّب ضيف بأضرار؟', a: 'نوفّر حماية للمضيف ضد الأضرار، ويمكنك الإبلاغ عن أي مشكلة وسيتابعها فريقنا معك.' },
];

export default function HostLandingPage() {
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
              كن مضيفاً في مَمسَى
            </span>
            <h1 className="mb-4 text-3xl font-bold leading-tight md:text-5xl">
              اعرض عقارك واربح مع مَمسَى
            </h1>
            <p className="mb-6 max-w-md text-sm leading-relaxed text-white/85 md:text-base">
              حوّل عقارك إلى مصدر دخل. سجّله على منصة مَمسَى واستقبل الحجوزات بثقة، مع دفعات مضمونة وحماية ودعم في كل خطوة.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={SIGNUP}>سجّل عقارك مجاناً <ArrowLeft className="h-4 w-4" /></Link>
              </Button>
              <a href="#how" className="text-sm font-medium text-white/90 underline-offset-4 hover:underline">
                كيف يعمل؟
              </a>
            </div>
          </div>

          {/* signup teaser card */}
          <div className="mx-auto w-full max-w-md rounded-2xl border border-white/20 bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-brand-ink">سجّل عقارك مجاناً</h2>
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
              <Link href={SIGNUP}>ابدأ الآن <ArrowLeft className="h-4 w-4" /></Link>
            </Button>
            <p className="mt-3 text-center text-xs text-brand-muted">
              لديك حساب مضيف؟{' '}
              <Link href={SIGNUP} className="font-medium text-brand-primary hover:underline">
                تابع تسجيلك
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto space-y-8 px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">ليه تسجّل عقارك في مَمسَى؟</h2>
          <p className="mt-2 text-sm text-brand-muted">كل ما تحتاجه لإدارة عقارك وتحقيق دخل إضافي بثقة</p>
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
            <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">انضم في 3 خطوات بسيطة</h2>
            <p className="mt-2 text-sm text-brand-muted">من التسجيل إلى أول حجز بأسرع وقت</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-brand-border bg-white p-6 text-right">
                <span className="absolute left-5 top-5 text-3xl font-bold text-brand-sage/60">{i + 1}</span>
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
              <Link href={SIGNUP}>سجّل عقارك الآن <ArrowLeft className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto space-y-8 px-4 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">ماذا يقول مضيفونا</h2>
          <p className="mt-2 text-sm text-brand-muted">قصص نجاح حقيقية من ملّاك عقارات على مَمسَى</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl border border-brand-border bg-white p-6">
              <div className="mb-3 flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-brand-ink">“{t.quote}”</blockquote>
              <figcaption className="mt-4 border-t border-brand-border pt-4">
                <div className="font-bold text-brand-ink">{t.name}</div>
                <div className="text-xs text-brand-muted">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-brand-cream/50 py-16">
        <div className="container mx-auto max-w-3xl space-y-8 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-ink md:text-3xl">أسئلة شائعة</h2>
            <p className="mt-2 text-sm text-brand-muted">إجابات على أكثر ما يسأل عنه المضيفون</p>
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
          <h2 className="max-w-2xl text-2xl font-bold md:text-3xl">
            جاهز تبدأ؟ سجّل عقارك اليوم وابدأ باستقبال الضيوف
          </h2>
          <p className="max-w-xl text-sm text-white/80">
            انضم لمئات المضيفين على منصة مَمسَى وحوّل عقارك إلى مصدر دخل موثوق.
          </p>
          <Button asChild size="lg" variant="soft">
            <Link href={SIGNUP}>سجّل عقارك مجاناً <ArrowLeft className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
