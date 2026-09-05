import type { Metadata } from 'next';
import Link from 'next/link';
import { Prisma, SeriesStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { PUBLIC_SERIES } from '@/lib/visibility';
import { GENRES } from '@/lib/format';
import { SeriesCard } from '@/components/series-card';
import { BrowseSearch } from '@/components/browse-search';
import { FilterDropdown } from '@/components/ui/filter-dropdown';
import { SeriesRow } from '@/components/series-row';
import { ViewToggle } from '@/components/ui/view-toggle';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Browse series',
  description:
    'Browse every manga and manhwa on ManMan by genre, status, popularity, and release date.',
};

const PAGE_SIZE = 25;

const SORTS = {
  latest: { updatedAt: 'desc' },
  views: { views: 'desc' },
  rating: { rating: 'desc' },
  title: { title: 'asc' },
} satisfies Record<string, Prisma.SeriesOrderByWithRelationInput>;

const SORT_LABELS: Record<keyof typeof SORTS, string> = {
  latest: 'Latest Update',
  views: 'Most Viewed',
  rating: 'Top Rated',
  title: 'A-Z',
};

const STATUSES = ['ONGOING', 'COMPLETED', 'HIATUS', 'DROPPED'] as const;

type SearchParams = {
  genre?: string;
  status?: string;
  sort?: string;
  page?: string;
  q?: string;
  min?: string;
  view?: string;
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
  const query = (searchParams.q ?? '').trim();
  const minChapters = Number(searchParams.min) || 0;
  const view: 'grid' | 'list' = searchParams.view === 'list' ? 'list' : 'grid';

  const status = STATUSES.includes(searchParams.status as (typeof STATUSES)[number])
    ? (searchParams.status as SeriesStatus)
    : undefined;

  const where: Prisma.SeriesWhereInput = {
    ...PUBLIC_SERIES,
    ...(status ? { status } : {}),
    ...(searchParams.genre ? { genres: { has: searchParams.genre } } : {}),
    ...(query ? { title: { contains: query, mode: 'insensitive' } } : {}),
  };

  const [total, series, userId] = await Promise.all([
    prisma.series.count({ where }),
    prisma.series.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        slug: true,
        title: true,
        coverImage: true,
        description: true,
        genres: true,
        views: true,
        status: true,
        rating: true,
        updatedAt: true,
        _count: { select: { chapters: true } },
        chapters: {
          orderBy: { number: 'desc' },
          take: 1,
          select: { number: true, releaseDate: true },
        },
      },
    }),
    getCurrentUserId(),
  ]);

  // "Minimum chapters" filters on a relation count, which Prisma cannot express
  // in `where`, so it is applied after the page is fetched.
  const visible = minChapters
    ? series.filter((item) => item._count.chapters >= minChapters)
    : series;

  const bookmarked = userId
    ? new Set(
        (
          await prisma.bookmark.findMany({
            where: { userId, seriesId: { in: visible.map((s) => s.id) } },
            select: { seriesId: true },
          })
        ).map((b) => b.seriesId),
      )
    : new Set<string>();

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <h1 className="text-xl font-bold">Browse Series</h1>
          <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-semibold text-accent-fg tabular-nums">
            {total}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Sort"
            icon="⇅"
            active={sortKey}
            options={(Object.keys(SORTS) as (keyof typeof SORTS)[]).map((key) => ({
              value: key,
              label: SORT_LABELS[key],
              href: buildHref(searchParams, { sort: key, page: undefined }),
            }))}
          />

          <FilterDropdown
            label="Status"
            active={searchParams.status ?? ''}
            options={[
              { value: '', label: 'Any status', href: buildHref(searchParams, { status: undefined, page: undefined }) },
              ...STATUSES.map((s) => ({
                value: s,
                label: s[0] + s.slice(1).toLowerCase(),
                href: buildHref(searchParams, { status: s, page: undefined }),
              })),
            ]}
          />

          <FilterDropdown
            label="Genres"
            active={searchParams.genre ?? ''}
            options={[
              { value: '', label: 'All genres', href: buildHref(searchParams, { genre: undefined, page: undefined }) },
              ...GENRES.map((g) => ({
                value: g,
                label: g,
                href: buildHref(searchParams, { genre: g, page: undefined }),
              })),
            ]}
          />

          <FilterDropdown
            label="Minimum Chapters"
            active={searchParams.min ?? ''}
            options={[
              { value: '', label: 'Any length', href: buildHref(searchParams, { min: undefined, page: undefined }) },
              ...['10', '20', '50', '100'].map((n) => ({
                value: n,
                label: `${n}+ chapters`,
                href: buildHref(searchParams, { min: n, page: undefined }),
              })),
            ]}
          />

          <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
            <BrowseSearch initial={query} params={searchParams} />
            <ViewToggle
              view={view}
              gridHref={buildHref(searchParams, { view: undefined })}
              listHref={buildHref(searchParams, { view: 'list' })}
            />
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {visible.map((item, i) => (
            <SeriesRow
              key={item.slug}
              slug={item.slug}
              title={item.title}
              coverImage={item.coverImage}
              description={item.description}
              genres={item.genres}
              status={item.status}
              views={item.views}
              chapterCount={item._count.chapters}
              priority={i < 4}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((item, i) => (
            <SeriesCard
              key={item.slug}
              slug={item.slug}
              title={item.title}
              coverImage={item.coverImage}
              rating={item.rating}
              status={item.status}
              chapterCount={item._count.chapters}
              latestChapter={item.chapters[0]?.number ?? null}
              updatedAt={item.chapters[0]?.releaseDate ?? item.updatedAt}
              priority={i < 5}
              seriesId={item.id}
              bookmarked={bookmarked.has(item.id)}
              signedIn={Boolean(userId)}
            />
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted">
          No series match these filters.{' '}
          <Link href="/series" className="text-accent hover:underline">
            Clear them
          </Link>
        </p>
      ) : null}

      {pages > 1 ? (
        <nav
          className="mt-8 flex items-center justify-center gap-1.5"
          aria-label="Pagination"
        >
          <Link
            href={buildHref(searchParams, { page: String(Math.max(1, page - 1)) })}
            aria-disabled={page === 1}
            className={`grid h-9 w-9 place-items-center rounded-lg bg-elevated text-sm ${
              page === 1 ? 'pointer-events-none opacity-40' : 'hover:text-accent'
            }`}
          >
            ‹
          </Link>

          {pageWindow(page, pages).map((n) => (
            <Link
              key={n}
              href={buildHref(searchParams, { page: String(n) })}
              aria-current={n === page ? 'page' : undefined}
              className={`grid h-9 w-9 place-items-center rounded-lg text-sm font-medium tabular-nums transition-colors ${
                n === page
                  ? 'bg-accent text-accent-fg'
                  : 'bg-elevated text-muted hover:text-fg'
              }`}
            >
              {n}
            </Link>
          ))}

          <Link
            href={buildHref(searchParams, {
              page: String(Math.min(pages, page + 1)),
            })}
            aria-disabled={page === pages}
            className={`grid h-9 w-9 place-items-center rounded-lg bg-elevated text-sm ${
              page === pages ? 'pointer-events-none opacity-40' : 'hover:text-accent'
            }`}
          >
            ›
          </Link>
        </nav>
      ) : null}
    </div>
  );
}

/** Up to five page numbers centred on the current page. */
function pageWindow(page: number, pages: number) {
  const span = Math.min(5, pages);
  let start = Math.max(1, page - Math.floor(span / 2));
  if (start + span - 1 > pages) start = pages - span + 1;
  return Array.from({ length: span }, (_, i) => start + i);
}
