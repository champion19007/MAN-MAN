import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { HeroCarousel } from '@/components/home/hero-carousel';
import { LatestUpdates } from '@/components/home/latest-updates';
import { PopularPanel, type PopularSets } from '@/components/home/popular-panel';
import { ContinueReading } from '@/components/continue-reading';
import { SeriesCard } from '@/components/series-card';
import { Panel } from '@/components/ui/panel';

export const revalidate = 60;

const POPULAR_SELECT = {
  slug: true,
  title: true,
  coverImage: true,
  genres: true,
  rating: true,
} as const;

/**
 * Weekly/Monthly rank by views among series that actually published in the
 * window — we have no per-day view events, so this is the honest version of
 * "popular right now" that the schema supports.
 */
async function getPopular(): Promise<PopularSets> {
  const since = (days: number) => new Date(Date.now() - days * 86_400_000);

  const [weekly, monthly, allTime] = await Promise.all([
    prisma.series.findMany({
      where: { chapters: { some: { releaseDate: { gte: since(7) } } } },
      orderBy: { views: 'desc' },
      take: 10,
      select: POPULAR_SELECT,
    }),
    prisma.series.findMany({
      where: { chapters: { some: { releaseDate: { gte: since(30) } } } },
      orderBy: { views: 'desc' },
      take: 10,
      select: POPULAR_SELECT,
    }),
    prisma.series.findMany({
      orderBy: { views: 'desc' },
      take: 10,
      select: POPULAR_SELECT,
    }),
  ]);

  return { weekly, monthly, allTime };
}

async function getHomeData() {
  const [featured, trending, latest, popular] = await Promise.all([
    prisma.series.findMany({
      orderBy: { views: 'desc' },
      take: 9,
      select: {
        slug: true,
        title: true,
        coverImage: true,
        rating: true,
        genres: true,
      },
    }),
    prisma.series.findMany({
      orderBy: { views: 'desc' },
      take: 12,
      select: {
        slug: true,
        title: true,
        coverImage: true,
        rating: true,
        status: true,
        _count: { select: { chapters: true } },
        chapters: {
          orderBy: { number: 'desc' },
          take: 1,
          select: { number: true },
        },
      },
    }),
    prisma.series.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 16,
      select: {
        slug: true,
        title: true,
        coverImage: true,
        chapters: {
          orderBy: { number: 'desc' },
          take: 3,
          select: { id: true, number: true, releaseDate: true },
        },
      },
    }),
    getPopular(),
  ]);

  return { featured, trending, latest, popular };
}

async function getServerContinue(userId: string) {
  return prisma.readingHistory.findFirst({
    where: { userId },
    orderBy: { readAt: 'desc' },
    select: {
      chapter: {
        select: { number: true, series: { select: { slug: true, title: true } } },
      },
    },
  });
}

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const [{ featured, trending, latest, popular }, resume] = await Promise.all([
    getHomeData(),
    userId ? getServerContinue(userId) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <HeroCarousel items={featured} />

      {resume ? (
        <Link
          href={`/series/${resume.chapter.series.slug}/${resume.chapter.number}`}
          className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
        >
          <span className="min-w-0">
            <span className="block text-xs uppercase tracking-wider text-muted">
              Continue reading
            </span>
            <span className="block truncate font-medium">
              {resume.chapter.series.title} · Chapter {resume.chapter.number}
            </span>
          </span>
          <span className="ml-3 shrink-0 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-fg">
            Resume
          </span>
        </Link>
      ) : (
        <div className="mb-6">
          <ContinueReading suppressed={Boolean(userId)} />
        </div>
      )}

      {/*
        minmax(0,1fr) + min-w-0: a grid item defaults to min-width:auto, so the
        horizontally scrolling Trending row would otherwise stretch the column
        to its full content width instead of scrolling inside it.
      */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Panel
            title="Trending"
            icon="★"
            action={{ href: '/series?sort=views', label: 'All Series' }}
          >
            <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {trending.map((series, i) => (
                <div key={series.slug} className="w-[150px] shrink-0">
                  <SeriesCard
                    slug={series.slug}
                    title={series.title}
                    coverImage={series.coverImage}
                    rating={series.rating}
                    status={series.status}
                    chapterCount={series._count.chapters}
                    latestChapter={series.chapters[0]?.number ?? null}
                    priority={i < 4}
                  />
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title="Latest Updates"
            icon="⟳"
            action={{ href: '/series', label: 'View All' }}
          >
            <LatestUpdates entries={latest} />
          </Panel>
        </div>

        <aside className="space-y-6">
          <PopularPanel sets={popular} />
        </aside>
      </div>
    </div>
  );
}
