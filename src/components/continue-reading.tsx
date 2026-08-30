'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Guest = {
  seriesSlug: string;
  seriesTitle: string;
  chapterNumber: number;
  scrollPosition: number;
};

/**
 * Guests keep their place in localStorage; signed-in readers get the
 * server-backed version rendered by the page itself.
 */
export function ContinueReading({ suppressed }: { suppressed: boolean }) {
  const [entry, setEntry] = useState<Guest | null>(null);

  useEffect(() => {
    if (suppressed) return;
    try {
      const raw = localStorage.getItem('manman:last-read');
      if (raw) setEntry(JSON.parse(raw) as Guest);
    } catch {
      // Private-mode or corrupted value: just show nothing.
    }
  }, [suppressed]);

  if (suppressed || !entry) return null;

  return (
    <Link
      href={`/series/${entry.seriesSlug}/${entry.chapterNumber}`}
      className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
    >
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-wider text-muted">
          Continue reading
        </span>
        <span className="block truncate font-medium">
          {entry.seriesTitle} · Chapter {entry.chapterNumber}
        </span>
      </span>
      <span className="ml-3 shrink-0 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white">
        Resume
      </span>
    </Link>
  );
}
