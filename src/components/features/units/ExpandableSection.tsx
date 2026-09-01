'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * يقصّ محتوى طويلًا عند ارتفاع ثابت مع تلاشٍ في أسفله وزرّ «عرض المزيد».
 *
 * الوصف الذي يكتبه الشريك قد يمتدّ لعشرات الأسطر (مطبخ، حمّام، إطلالة، مرافق)
 * فيدفع بقيّة الصفحة — المرافق والمراجعات — خارج الشاشة. القصّ يبقي الصفحة
 * مقروءة دون إخفاء شيء: الزرّ يظهر فقط حين يكون هناك ما يُخفى فعلًا، والنص
 * كامل في الـ DOM دائمًا فيقرؤه محرّك البحث والقارئ الصوتي كما هو.
 */
export function ExpandableSection({
  children,
  moreLabel,
  lessLabel,
  collapsedHeight = 320,
  fadeClassName = 'from-white via-white/85',
}: {
  children: React.ReactNode;
  moreLabel: string;
  lessLabel: string;
  /** ارتفاع القصّ بالبكسل. */
  collapsedHeight?: number;
  /** ألوان التلاشي — يجب أن تطابق خلفية الحاوية. */
  fadeClassName?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [open, setOpen] = useState(false);

  // يُقاس بعد التركيب لا قبله: ارتفاع النص يتغيّر مع عرض الشاشة وتحميل الخطّ
  // العربي، فالمراقب يعيد الحساب بدل تخمين عدد الأسطر. والمقياس على العنصر
  // الداخلي غير المقصوص، فارتفاعه هو ارتفاع المحتوى كاملًا.
  useEffect(() => {
    const el = content.current;
    if (!el) return;
    // هامش صغير: لا معنى لزرٍّ يكشف سطرًا واحدًا مخفيًّا.
    const measure = () => setOverflows(el.offsetHeight > collapsedHeight + 48);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [collapsedHeight]);

  const toggle = useCallback(() => {
    // عند الطيّ: لو كان أعلى القسم قد خرج فوق الشاشة لبقي القارئ معلّقًا في
    // فراغ بعد أن انكمش ما تحته. نعيده إلى بداية القسم.
    const el = root.current;
    if (open && el && el.getBoundingClientRect().top < 0) {
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
    setOpen(!open);
  }, [open]);

  const clamped = overflows && !open;

  return (
    <div ref={root}>
      <div className="relative">
        <div className="overflow-hidden" style={clamped ? { maxHeight: collapsedHeight } : undefined}>
          <div ref={content}>{children}</div>
        </div>
        {clamped && (
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t to-transparent',
              fadeClassName,
            )}
          />
        )}
      </div>

      {overflows && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-4 py-2 text-sm font-semibold text-brand-ink transition hover:border-brand-primary/50 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
        >
          {open ? lessLabel : moreLabel}
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
      )}
    </div>
  );
}
