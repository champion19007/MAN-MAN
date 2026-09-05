'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/**
 * Filters the browse grid by title. Debounced and pushed to the URL, so the
 * server does the filtering and the result stays shareable.
 *
 * `params` is a plain object rather than a callback: functions cannot cross the
 * server/client component boundary.
 */
export function BrowseSearch({
  initial,
  params,
}: {
  initial: string;
  params: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const query = new URLSearchParams();
      for (const [key, entry] of Object.entries(params)) {
        if (entry && key !== 'q' && key !== 'page') query.set(key, entry);
      }
      const trimmed = value.trim();
      if (trimmed) query.set('q', trimmed);

      const qs = query.toString();
      router.push(qs ? `/series?${qs}` : '/series');
    }, 350);

    return () => clearTimeout(timer);
  }, [value, params, router]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <span
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted"
      >
        ⌕
      </span>
      <label htmlFor="browse-search" className="sr-only">
        Search series
      </label>
      <input
        id="browse-search"
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search series..."
        className="w-full rounded-lg border border-border bg-elevated py-2 pl-8 pr-3 text-sm outline-none transition-colors focus:border-accent"
      />
    </div>
  );
}
