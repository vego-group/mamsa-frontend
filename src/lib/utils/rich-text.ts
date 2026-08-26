/**
 * محلّل نصّي خفيف لوصف الوحدة (وأي نص يكتبه الشريك من لوحة التحكّم).
 *
 * الفكرة: الشريك يكتب نصًا عاديًا بعلامات بسيطة يسهل تذكّرها، فيخرج على الموقع
 * بتنسيق أنيق — بلا HTML قادم من الباك-إند وبلا مكتبة ماركداون كاملة.
 *
 * المفردات المدعومة (تُقرأ سطرًا سطرًا):
 *   ## عنوان فرعي        →  عنوان صغير بشريط أخضر
 *   - نقطة  /  • نقطة    →  قائمة نقطية بنقاط مميّزة
 *   1. خطوة              →  قائمة مرقّمة بأرقام داخل دوائر
 *   *ميزة*  (سطر كامل)   →  بطاقة ميزة مختصرة داخل شبكة
 *   > ملاحظة             →  صندوق ملاحظة
 * وداخل أي سطر:
 *   **نص**               →  عريض بلون داكن
 *   *نص*                 →  تمييز لطيف بخلفية كريمية
 *
 * أي نص بلا علامات يبقى كما هو — الأوصاف القديمة تُعرض تمامًا كما كانت.
 */

export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; value: string }
  | { type: 'mark'; value: string };

export type RichBlock =
  | { type: 'paragraph'; content: InlineNode[] }
  | { type: 'heading'; content: InlineNode[] }
  | { type: 'note'; content: InlineNode[] }
  | { type: 'bullets'; items: InlineNode[][] }
  | { type: 'steps'; items: InlineNode[][] }
  | { type: 'features'; items: InlineNode[][] };

type ListType = Extract<RichBlock, { items: InlineNode[][] }>['type'];
type TextType = Extract<RichBlock, { content: InlineNode[] }>['type'];

/** `**عريض**` قبل `*مميّز*` — والنجمة الوحيدة غير المُغلقة تبقى نجمة عادية. */
const INLINE = /\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;

const HEADING = /^#{1,3}\s+(.+)$/;
const NOTE = /^[>»]\s*(.+)$/;
/** سطر كامل بين نجمتين — يُعرض كبطاقة ميزة، لا كنص داخل فقرة. */
const FEATURE = /^\*\s*([^*]+?)\s*\*$/;
const BULLET = /^[-–—•●○*]\s+(.+)$/;
/** يقبل الأرقام اللاتينية والعربية-الهندية: `1.` و `2)` و `٣-`. */
const STEP = /^[0-9\u0660-\u0669]{1,2}\s*[.)\-]\s+(.+)$/;

export function parseInline(src: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let last = 0;
  for (const m of src.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) nodes.push({ type: 'text', value: src.slice(last, at) });
    const strong = m[1];
    const mark = m[2];
    if (strong !== undefined) nodes.push({ type: 'strong', value: strong.trim() });
    else if (mark !== undefined) nodes.push({ type: 'mark', value: mark.trim() });
    last = at + m[0].length;
  }
  if (last < src.length) nodes.push({ type: 'text', value: src.slice(last) });
  return nodes;
}

export function parseRichText(source: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  // الأسطر المتتالية من نفس النوع تُجمَّع في كتلة واحدة: فقرة واحدة، قائمة
  // واحدة، ملاحظة واحدة — بدل صناديق متلاصقة تكسر الإيقاع البصري.
  let text: { kind: TextType; lines: string[] } | null = null;
  let list: { type: ListType; items: InlineNode[][] } | null = null;

  const flushText = () => {
    if (!text) return;
    blocks.push({ type: text.kind, content: parseInline(text.lines.join('\n')) } as RichBlock);
    text = null;
  };
  const flushList = () => {
    if (!list) return;
    blocks.push(list as RichBlock);
    list = null;
  };
  const pushText = (kind: TextType, line: string) => {
    flushList();
    if (!text || text.kind !== kind) {
      flushText();
      text = { kind, lines: [] };
    }
    text.lines.push(line);
  };
  const pushItem = (type: ListType, line: string) => {
    flushText();
    if (!list || list.type !== type) {
      flushList();
      list = { type, items: [] };
    }
    list.items.push(parseInline(line));
  };

  for (const raw of source.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    if (!line) {
      flushText();
      flushList();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading?.[1]) {
      flushText();
      flushList();
      blocks.push({ type: 'heading', content: parseInline(heading[1]) });
      continue;
    }

    const note = NOTE.exec(line);
    if (note?.[1]) {
      pushText('note', note[1]);
      continue;
    }

    // قبل BULLET: النجمة موجودة في الاثنين، والسطر المُغلق بنجمتين ميزة لا نقطة.
    const feature = FEATURE.exec(line);
    if (feature?.[1]) {
      pushItem('features', feature[1]);
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet?.[1]) {
      pushItem('bullets', bullet[1]);
      continue;
    }

    const step = STEP.exec(line);
    if (step?.[1]) {
      pushItem('steps', step[1]);
      continue;
    }

    pushText('paragraph', line);
  }

  flushText();
  flushList();
  return blocks;
}
