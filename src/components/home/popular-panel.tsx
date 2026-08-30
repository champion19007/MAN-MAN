'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { StarRating } from '@/components/ui/star-rating';

export type PopularEntry = {
  slug: string;
  title: string;
  coverImage: string;
  genres: string[];
  rating: number;
};

export type PopularSets = {
  weekly: PopularEntry[];
  monthly: PopularEntry[];
  allTime: PopularEntry[];
};

const TABS = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'allTime', label: 'All Time' },
] as const;

export function PopularPanel({ sets }: { sets: PopularSets }) {
  const [tab, setTab] = useState<keyof PopularSets>('weekly');
  const entries = sets[tab];

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-base font-bold">Popular</h2>
        <div className="flex gap-1">
          {TABS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setTab(entry.key)}
              aria-pressed={tab === entry.key}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                tab === entry.key
                  ? 'bg-accent text-accent-fg'
                  : 'bg-elevated text-muted hover:text-fg'
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="py-4 text-sm text-muted">
          No chapters released in this window yet.
        </p>
      ) : (
        <ol className="space-y-3">
          {entries.map((entry, i) => (
            <li key={entry.slug}>
              <Link href={`/series/${entry.slug}`} className="group flex gap-3">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center self-start rounded-md text-xs font-bold ${
                    i < 3
                      ? 'bg-accent text-accent-fg'
                      : 'bg-elevated text-muted'
                  }`}
                >
                  {i + 1}
                </span>

                <span className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-elevated">
                  <Image
                    src={entry.coverImage}
                    alt={entry.title}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 text-sm font-medium group-hover:text-accent">
                    {entry.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-[11px] text-muted">
                    {entry.genres.join(', ')}
                  </span>
                  <span className="mt-1 block">
                    <StarRating rating={entry.rating} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
