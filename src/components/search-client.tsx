'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

type Result = {
  id: string;
  slug: string;
  title: string;
  coverImage: string;
  status: string;
  genres: string[];
  _count: { chapters: number };
};

const DEBOUNCE_MS = 250;

export function SearchClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (res.status === 429) {
          setError('Searching too fast — try again in a moment.');
          return;
        }
        if (!res.ok) throw new Error('search failed');
        const data = (await res.json()) as { results: Result[] };
        setResults(data.results);
        setError(null);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setError('Search is unavailable.');
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <label htmlFor="search-input" className="sr-only">
        Search series
      </label>
      <input
        id="search-input"
        type="search"
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by title, author, or artist…"
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-accent"
      />

      <div className="mt-4 min-h-[3rem]">
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {!error && loading ? <p className="text-sm text-muted">Searching…</p> : null}
        {!error && !loading && query.trim().length >= 2 && results.length === 0 ? (
          <p className="text-sm text-muted">No matches for “{query.trim()}”.</p>
        ) : null}

        <ul className="divide-y divide-border">
          {results.map((result) => (
            <li key={result.id}>
              <Link
                href={`/series/${result.slug}`}
                className="flex items-center gap-3 py-3 transition-colors hover:text-accent"
              >
                <span className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-elevated">
                  <Image
                    src={result.coverImage}
                    alt={result.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{result.title}</span>
                  <span className="block text-xs text-muted">
                    {result._count.chapters} chapters ·{' '}
                    {result.status[0] + result.status.slice(1).toLowerCase()}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {result.genres.slice(0, 3).join(' · ')}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
