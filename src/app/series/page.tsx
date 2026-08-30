import type { Metadata } from 'next';
import Link from 'next/link';
import { Prisma, SeriesStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { GENRES } from '@/lib/format';
import { SeriesCard } from '@/components/series-card';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Browse series',
  description:
    'Browse every manga and manhwa on ManMan by genre, status, popularity, and release date.',
};

const PAGE_SIZE = 24;

const SORTS = {
  latest: { updatedAt: 'desc' },
  views: { views: 'desc' },
  rating: { rating: 'desc' },
  title: { title: 'asc' },
} satisfies Record<string, Prisma.SeriesOrderByWithRelationInput>;

const STATUSES = ['ONGOING', 'COMPLETED', 'HIATUS', 'DROPPED'] as const;

type SearchParams = {
  genre?: string;
  status?: string;
  sort?: string;
  page?: string;
};

function buildHref(params: SearchParams, patch: SearchParams) {
  const merged = { ...params, ...patch };
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value) query.set(key, value);
  }
  const qs = query.toString();
  return qs ? `/series?${qs}` : '/series';
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sortKey = (searchParams.sort ?? 'latest') as keyof typeof SORTS;
  const orderBy = SORTS[sortKey] ?? SORTS.latest;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const status = STATUSES.includes(searchParams.status as (typeof STATUSES)[number])
    ? (searchParams.status as SeriesStatus)
    : undefined;

  const where: Prisma.SeriesWhereInput = {
    ...(status ? { status } : {}),
    ...(searchParams.genre ? { genres: { has: searchParams.genre } } : {}),
  };

  const [total, series] = await Promise.all([
    prisma.series.count({ where }),
    prisma.series.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        slug: true,
        title: true,
        coverImage: true,
        status: true,
        updatedAt: true,
        chapters: {
          orderBy: { number: 'desc' },
          take: 1,
          select: { number: true, releaseDate: true },
        },
      },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold">Browse</h1>
      <p className="mt-1 text-sm text-muted">{total} series</p>

      <div className="mt-5 space-y-4">
        <Filter
          label="Genre"
          options={[{ value: '', label: 'All' }, ...GENRES.map((g) => ({ value: g, label: g }))]}
          active={searchParams.genre ?? ''}
          hrefFor={(value) => buildHref(searchParams, { genre: value, page: undefined })}
        />
        <Filter
          label="Status"
          options={[
            { value: '', label: 'Any' },
            ...STATUSES.map((s) => ({ value: s, label: s[0] + s.slice(1).toLowerCase() })),
          ]}
          active={searchParams.status ?? ''}
          hrefFor={(value) => buildHref(searchParams, { status: value, page: undefined })}
        />
        <Filter
          label="Sort"
          options={[
            { value: 'latest', label: 'Latest' },
            { value: 'views', label: 'Most viewed' },
            { value: 'rating', label: 'Top rated' },
            { value: 'title', label: 'A–Z' },
          ]}
          active={sortKey}
          hrefFor={(value) => buildHref(searchParams, { sort: value, page: undefined })}
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {series.map((item, i) => (
          <SeriesCard
            key={item.slug}
            slug={item.slug}
            title={item.title}
            coverImage={item.coverImage}
            priority={i < 6}
            badge={item.status === 'COMPLETED' ? 'Completed' : null}
            subtitle={item.chapters[0] ? `Chapter ${item.chapters[0].number}` : null}
            updatedAt={item.chapters[0]?.releaseDate ?? item.updatedAt}
          />
        ))}
      </div>

      {series.length === 0 ? (
        <p className="mt-10 text-sm text-muted">No series match these filters.</p>
      ) : null}

      {pages > 1 ? (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
          {page > 1 ? (
            <Link
              href={buildHref(searchParams, { page: String(page - 1) })}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:text-accent"
            >
              ‹ Prev
            </Link>
          ) : null}
          <span className="text-sm text-muted">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link
              href={buildHref(searchParams, { page: String(page + 1) })}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:text-accent"
            >
              Next ›
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

function Filter({
  label,
  options,
  active,
  hrefFor,
}: {
  label: string;
  options: { value: string; label: string }[];
  active: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-xs uppercase tracking-wider text-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <Link
            key={option.value || 'all'}
            href={hrefFor(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
              active === option.value
                ? 'bg-accent text-white'
                : 'bg-elevated text-muted hover:text-fg'
            }`}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
