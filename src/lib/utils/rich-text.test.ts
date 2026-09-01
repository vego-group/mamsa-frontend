import { describe, it, expect } from 'vitest';
import { parseRichText, parseInline, detectTextDirection } from './rich-text';

describe('parseInline', () => {
  it('marks *text* and bolds **text**', () => {
    expect(parseInline('مطبخ *مجهّز* و**تكييف** مركزي')).toEqual([
      { type: 'text', value: 'مطبخ ' },
      { type: 'mark', value: 'مجهّز' },
      { type: 'text', value: ' و' },
      { type: 'strong', value: 'تكييف' },
      { type: 'text', value: ' مركزي' },
    ]);
  });

  it('leaves an unclosed asterisk as a literal character', () => {
    expect(parseInline('السعر 360 ر.س *')).toEqual([{ type: 'text', value: 'السعر 360 ر.س *' }]);
  });

  it('does not let emphasis span a line break', () => {
    expect(parseInline('سطر *أول\nثانٍ* هنا')).toEqual([{ type: 'text', value: 'سطر *أول\nثانٍ* هنا' }]);
  });
});

describe('parseRichText', () => {
  it('renders unmarked text exactly as one paragraph per blank-line group', () => {
    const blocks = parseRichText('وصف قديم بلا علامات.\nسطر ثانٍ.\n\nفقرة أخرى.');
    expect(blocks).toEqual([
      { type: 'paragraph', content: [{ type: 'text', value: 'وصف قديم بلا علامات.\nسطر ثانٍ.' }] },
      { type: 'paragraph', content: [{ type: 'text', value: 'فقرة أخرى.' }] },
    ]);
  });

  it('groups consecutive bullet lines into one list whatever the marker', () => {
    const blocks = parseRichText('- واي فاي\n• موقف خاص\n* مسبح');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      type: 'bullets',
      items: [
        [{ type: 'text', value: 'واي فاي' }],
        [{ type: 'text', value: 'موقف خاص' }],
        [{ type: 'text', value: 'مسبح' }],
      ],
    });
  });

  it('treats a whole line wrapped in asterisks as a feature card, not a bullet', () => {
    const blocks = parseRichText('*إطلالة على المدينة*\n*تسجيل ذاتي*');
    expect(blocks).toEqual([
      {
        type: 'features',
        items: [[{ type: 'text', value: 'إطلالة على المدينة' }], [{ type: 'text', value: 'تسجيل ذاتي' }]],
      },
    ]);
  });

  it('reads headings, numbered steps and notes', () => {
    const blocks = parseRichText('## الموقع\n1. اخرج من البوابة\n٢) اتجه يمينًا\n> الوصول بعد 3 عصرًا');
    expect(blocks.map((b) => b.type)).toEqual(['heading', 'steps', 'note']);
    expect(blocks[1]).toMatchObject({ items: [[{ value: 'اخرج من البوابة' }], [{ value: 'اتجه يمينًا' }]] });
  });

  it('merges consecutive note lines into a single box', () => {
    const blocks = parseRichText('> الأولى\n> الثانية');
    expect(blocks).toEqual([
      { type: 'note', content: [{ type: 'text', value: 'الأولى\nالثانية' }] },
    ]);
  });

  it('keeps block order across mixed content and handles CRLF', () => {
    const blocks = parseRichText('مقدمة\r\n\r\n- نقطة\r\n\r\n*ميزة*\r\nخاتمة');
    expect(blocks.map((b) => b.type)).toEqual(['paragraph', 'bullets', 'features', 'paragraph']);
  });

  it('returns nothing for empty or whitespace-only text', () => {
    expect(parseRichText('')).toEqual([]);
    expect(parseRichText('   \n\n  ')).toEqual([]);
  });
});

describe('detectTextDirection', () => {
  it('reads an Arabic description as RTL — it is shown inside the English page too', () => {
    expect(detectTextDirection('شقة فسيحة بغرفة نوم واحدة، وحمام خاص.')).toBe('rtl');
  });

  it('reads an English description as LTR', () => {
    expect(detectTextDirection('A spacious one-bedroom apartment with a private bathroom.')).toBe('ltr');
  });

  it('keeps a mostly-Arabic line RTL even when it opens with a Latin word', () => {
    // dir="auto" من المتصفّح يحكم بأول حرف قوي، فيقلب هذا السطر وحده وسط قائمة عربية.
    expect(detectTextDirection('WiFi متوفّر في كل الغرف مع تكييف مركزي')).toBe('rtl');
  });

  it('falls back to LTR for text with no letters at all', () => {
    expect(detectTextDirection('263 — 2026/09/01')).toBe('ltr');
    expect(detectTextDirection('')).toBe('ltr');
  });
});
