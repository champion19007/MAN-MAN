'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type FilterOption = { value: string; label: string; href: string };

/**
 * A filter rendered as links rather than form state, so every combination is a
 * real URL the reader can bookmark, share, or hit refresh on.
 */
export function FilterDropdown({
  label,
  options,
  active,
  icon = '+',
}: {
  label: string;
  options: FilterOption[];
  active: string;
  icon?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointer = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selected = options.find((option) => option.value === active);
  const isSet = Boolean(active);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
          isSet
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-border bg-elevated text-muted hover:text-fg'
        }`}
      >
        <span aria-hidden className="text-xs">
          {icon}
        </span>
        {isSet && selected ? selected.label : label}
        <span aria-hidden className="text-[10px] opacity-70">
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-1.5 max-h-72 w-52 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-xl shadow-black/30"
        >
          {options.map((option) => (
            <Link
              key={option.value || 'any'}
              href={option.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                option.value === active
                  ? 'bg-accent text-accent-fg'
                  : 'text-muted hover:bg-elevated hover:text-fg'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
