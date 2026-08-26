import { Fragment } from 'react';
import { Check, Info } from 'lucide-react';
import { parseRichText, type InlineNode, type RichBlock } from '@/lib/utils/rich-text';
import { cn } from '@/lib/utils/cn';

/**
 * يعرض نصًّا يكتبه الشريك (وصف الوحدة مثلًا) بعلاماته البسيطة — انظر مفردات
 * الكتابة في `@/lib/utils/rich-text`.
 *
 * لا يُمرَّر أي HTML: المحلّل يُخرج عُقدًا نصّية فقط ونحن نبني منها عناصر React،
 * فلا مجال لـ dangerouslySetInnerHTML ولا لحقن سكربت من محتوى الشريك.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = parseRichText(text ?? '');
  if (!blocks.length) return null;

  return (
    <div className={cn('space-y-4', className)}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: RichBlock }) {
  switch (block.type) {
    case 'heading':
      return (
        // نفس لغة العناوين في صفحات السياسات: شريط أخضر ملاصق لبداية النص
        // (يمينًا في العربية) — ps/border-s تتقلب مع اتجاه الصفحة تلقائيًا.
        <h3 className="border-s-[3px] border-brand-primary ps-3 pt-1 text-base font-bold text-brand-ink">
          <Inline nodes={block.content} />
        </h3>
      );

    case 'paragraph':
      // whitespace-pre-line: أسطر الشريط اليدوية داخل الفقرة تُحترم كما كتبها.
      return (
        <p className="whitespace-pre-line leading-[1.95] text-brand-muted">
          <Inline nodes={block.content} />
        </p>
      );

    case 'note':
      return (
        <div className="flex items-start gap-3 rounded-xl border border-brand-sage/40 bg-brand-cream/50 p-4 text-sm leading-relaxed text-brand-ink">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
          <span className="whitespace-pre-line">
            <Inline nodes={block.content} />
          </span>
        </div>
      );

    case 'bullets':
      return (
        <ul className="space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 leading-[1.95] text-brand-muted">
              {/* نقطة داخل هالة كريمية — علامة القائمة الافتراضية أضعف من أن
                  تُرى على نص عربي بهذا الحجم. mt يوازيها مع أول سطر. */}
              <span className="mt-[7px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-brand-cream">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
              </span>
              <span className="min-w-0">
                <Inline nodes={item} />
              </span>
            </li>
          ))}
        </ul>
      );

    case 'steps':
      return (
        <ol className="space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 leading-[1.95] text-brand-muted">
              {/* أرقام لاتينية عمدًا — نفس قرار العرض في formatSAR/formatDate. */}
              <span className="mt-[3px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-xs font-bold text-brand-primary">
                {i + 1}
              </span>
              <span className="min-w-0">
                <Inline nodes={item} />
              </span>
            </li>
          ))}
        </ol>
      );

    case 'features':
      return (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 rounded-xl border border-brand-sage/40 bg-brand-cream/50 px-3.5 py-2.5 text-sm font-semibold text-brand-ink"
            >
              <Check className="h-4 w-4 shrink-0 text-brand-primary" />
              <span className="min-w-0">
                <Inline nodes={item} />
              </span>
            </li>
          ))}
        </ul>
      );
  }
}

function Inline({ nodes }: { nodes: InlineNode[] }) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === 'strong') {
          return (
            <strong key={i} className="font-bold text-brand-ink">
              {node.value}
            </strong>
          );
        }
        if (node.type === 'mark') {
          return (
            // box-decoration-break: يبقي الخلفية الكريمية متّسقة لو انكسر
            // التمييز على سطرين بدل حوافّ مقصوصة.
            <mark
              key={i}
              className="rounded-md bg-brand-cream px-1.5 py-0.5 font-semibold text-brand-ink [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
            >
              {node.value}
            </mark>
          );
        }
        return <Fragment key={i}>{node.value}</Fragment>;
      })}
    </>
  );
}
