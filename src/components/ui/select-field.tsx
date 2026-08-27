'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  /** Heading this option is filed under. Options with no group list first. */
  group?: string;
  /** Matched by the search box alongside the label — e.g. the other locale's name. */
  keywords?: string;
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /**
   * Muted caption in front of the value, e.g. "المدينة". Omit it in a form that
   * already prints its own caption above the field — pair `id` with that
   * `<label htmlFor>` there, so the trigger keeps an accessible name.
   */
  label?: string;
  /** Ties the trigger to an outside `<label htmlFor>`. */
  id?: string;
  /**
   * The caption's own classes. A crowded toolbar hides it below `md` and keeps
   * the value, which is the half that says what the control is set to.
   */
  labelClassName?: string;
  /** Stands in for the value when nothing is chosen. */
  placeholder?: string;
  /** Present ⇒ the list gets a filter box. Worth it past ~15 options. */
  searchPlaceholder?: string;
  /** Shown when a search matches nothing. */
  emptyLabel?: string;
  /** Normalises both sides of the search comparison. */
  fold?: (s: string) => string;
  /**
   * Caption above the value instead of beside it, and no chevron — the shape a
   * search bar's segments take. Beside it is right for a standalone pill.
   */
  stacked?: boolean;
  /** Class the host bar uses for its own fields, so the trigger blends in. */
  fieldClassName?: string;
  className?: string;
  panelClassName?: string;
}

const lower = (s: string) => s.toLowerCase();

/**
 * A dropdown that belongs to the page rather than to the OS.
 *
 * The native `<select>` this replaces rendered its list in the platform's own
 * chrome — a square white box in the system font, ignoring the brand entirely,
 * mis-anchored in RTL, and with no room for a search box or region headings.
 * Long lists (every city in the Kingdom) were unusable in it.
 */
export function SelectField({
  value,
  onChange,
  options,
  label,
  id,
  labelClassName,
  placeholder,
  searchPlaceholder,
  emptyLabel,
  fold,
  stacked = false,
  fieldClassName,
  className,
  panelClassName,
}: SelectFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const norm = fold ?? lower;
  const searchable = Boolean(searchPlaceholder);

  const selected = options.find((o) => o.value === value);
  // An empty value is "nothing chosen yet" even when the list carries a row for
  // it (the "all cities" reset), so the trigger reads as a placeholder.
  const unset = !selected || selected.value === '';

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return options;
    return options.filter(
      (o) =>
        norm(o.label).includes(q) ||
        norm(o.value).includes(q) ||
        (o.keywords ? norm(o.keywords).includes(q) : false),
    );
  }, [options, query, norm]);

  // Dismiss on an outside press or Escape. Bound only while open, so a bar full
  // of these does not keep listeners alive for lists nobody can see.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Keep the highlighted row on screen as the arrows walk past the fold.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const openList = () => {
    setQuery('');
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const commit = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(filtered.length - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const option = filtered[active];
      if (option) commit(option.value);
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)} onKeyDown={onKeyDown}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        className={cn(fieldClassName, 'cursor-pointer text-start', open && 'bg-brand-cream/70 md:bg-brand-cream/70')}
      >
        {stacked ? (
          <span className="flex min-w-0 flex-1 flex-col">
            {label && (
              <span className="text-[11px] font-semibold leading-tight text-brand-ink">{label}</span>
            )}
            <span
              className={cn(
                'truncate text-sm leading-snug',
                unset ? 'text-brand-muted' : 'font-medium text-brand-ink',
              )}
            >
              {selected?.label ?? placeholder}
            </span>
          </span>
        ) : (
          <>
            {label && (
              <span className={cn('shrink-0 text-sm text-brand-muted', labelClassName)}>{label}</span>
            )}
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-sm',
                unset ? 'text-brand-muted/70' : 'font-medium text-brand-ink',
              )}
            >
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown
              className={cn('h-4 w-4 shrink-0 text-brand-muted transition', open && 'rotate-180')}
            />
          </>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full z-50 mt-3 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-brand-border bg-white shadow-xl',
            // Anchored to the field's leading edge, which is its right in RTL.
            'start-0',
            panelClassName,
          )}
        >
          {searchable && (
            <div className="border-b border-brand-border p-2">
              <div className="flex items-center gap-2 rounded-xl bg-brand-cream/50 px-3 py-2">
                <Search className="h-4 w-4 shrink-0 text-brand-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  placeholder={searchPlaceholder}
                  aria-controls={listId}
                  aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
                  className="w-full min-w-0 bg-transparent text-sm text-brand-ink placeholder:text-brand-muted/70 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div
            ref={listRef}
            id={listId}
            role="listbox"
            className="max-h-72 overflow-y-auto overscroll-contain p-1.5"
          >
            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-brand-muted">{emptyLabel}</p>
            )}
            {filtered.map((option, i) => {
              const isSelected = option.value === value;
              // A heading is drawn the first time its group appears, so the
              // list re-groups itself as the search narrows it down.
              const heading = option.group && option.group !== filtered[i - 1]?.group;
              return (
                <div key={`${option.group ?? ''}:${option.value}`}>
                  {heading && (
                    <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                      {option.group}
                    </p>
                  )}
                  <button
                    type="button"
                    id={`${listId}-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    data-index={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => commit(option.value)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-start text-sm text-brand-ink transition',
                      i === active && 'bg-brand-cream',
                      isSelected && 'font-semibold',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-brand-primary" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
