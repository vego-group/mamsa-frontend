import { Shield, Users, MapPin, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { BRAND } from '@/lib/constants/brand';

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(rgba(46,83,57,0.85), rgba(46,83,57,0.95)), url(https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=2000&q=80)',
          }}
        />
        <div className="container mx-auto px-4 py-20 text-center text-white">
          <h1 className="mb-3 text-4xl font-bold">عن {BRAND.nameAr}</h1>
          <p className="mx-auto max-w-2xl opacity-90">{BRAND.tagline}</p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="text-2xl font-bold text-brand-ink">رؤيتنا</h2>
          <p className="leading-relaxed text-brand-muted">
            نسعى لأن نكون المنصة الأولى في المملكة العربية السعودية لحجز الإقامات الفريدة،
            من خلال تقديم تجربة بحث وحجز سلسة، ووحدات سكنية موثّقة وآمنة، تجمع بين الراحة والجودة.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            { icon: <Shield className="h-6 w-6" />, title: 'مرخّصون', body: 'منصة معتمدة من وزارة السياحة السعودية.' },
            { icon: <Users className="h-6 w-6" />, title: 'موثّقون', body: 'جميع الشركاء يخضعون لمراجعة دقيقة قبل النشر.' },
            { icon: <MapPin className="h-6 w-6" />, title: 'تغطية واسعة', body: 'وحدات في جميع مدن المملكة.' },
            { icon: <Award className="h-6 w-6" />, title: 'جودة عالية', body: 'معايير دقيقة لضمان أفضل تجربة إقامة.' },
          ].map((f) => (
            <Card key={f.title} className="space-y-2 p-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-cream text-brand-primary">
                {f.icon}
              </div>
              <h3 className="font-bold text-brand-ink">{f.title}</h3>
              <p className="text-xs text-brand-muted">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
