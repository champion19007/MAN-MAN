import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { formatViews } from '@/lib/format';
import { TrendingCarousel } from '@/components/trending-carousel';
import { ContinueReading } from '@/components/continue-reading';
import { SeriesCard } from '@/components/series-card';

export const revalidate = 60;

async function getHomeData() {
  const [trending, latest, popular] = await Promise.all([
    prisma.series.findMany({
      orderBy: { views: 'desc' },
      take: 5,
      select: {
        slug: true,
        title: true,
        coverImage: true,
        description: true,
        genres: true,
      },
    }),
    prisma.series.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: {
        slug: true,
        title: true,
        coverImage: true,
        updatedAt: true,
        chapters: {
          orderBy: { number: 'desc' },
          take: 1,
          select: { number: true, releaseDate: true },
        },
      },
    }),
    prisma.series.findMany({
      orderBy: { views: 'desc' },
      take: 10,
      select: { slug: true, title: true, coverImage: true, views: true, genres: true },
    }),
  ]);

  return { trending, latest, popular };
}

async function getServerContinue(userId: string) {
  const history = await prisma.readingHistory.findFirst({
    where: { userId },
    orderBy: { readAt: 'desc' },
    select: {
      scrollPosition: true,
      chapter: {
        select: { number: true, series: { select: { slug: true, title: true } } },
      },
    },
  });
  return history;
}

export default async function HomePage() {
  const userId = await getCurrentUserId();
  const [{ trending, latest, popular }, resume] = await Promise.all([
    getHomeData(),
    userId ? getServerContinue(userId) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-6">
      {resume ? (
        <Link
          href={`/series/${resume.chapter.series.slug}/${resume.chapter.number}`}
          className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
        >
          <span className="min-w-0">
            <span className="block text-xs uppercase tracking-wider text-muted">
              Continue reading
            </span>
            <span className="block truncate font-medium">
              {resume.chapter.series.title} · Chapter {resume.chapter.number}
            </span>
          </span>
          <span className="ml-3 shrink-0 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white">
            Resume
          </span>
        </Link>
      ) : (
        <ContinueReading suppressed={Boolean(userId)} />
      )}

      <TrendingCarousel items={trending} />

      <div className="grid gap-10 lg:grid-cols-[1fr_280px]">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Latest updates</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4">
            {latest.map((series, i) => {
              const newest = series.chapters[0];
              return (
                <SeriesCard
                  key={series.slug}
                  slug={series.slug}
                  title={series.title}
                  coverImage={series.coverImage}
                  priority={i < 4}
                  subtitle={newest ? `Chapter ${newest.number}` : 'No chapters yet'}
                  updatedAt={newest?.releaseDate ?? series.updatedAt}
                />
              );
            })}
          </div>
        </section>

        <aside>
          <h2 className="mb-4 text-lg font-semibold">Popular this week</h2>
          <ol className="space-y-3">
            {popular.map((series, i) => (
              <li key={series.slug}>
                <Link href={`/series/${series.slug}`} className="group flex gap-3">
                  <span className="w-5 shrink-0 text-lg font-bold text-muted">{i + 1}</span>
                  <span className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-elevated">
                    <Image
                      src={series.coverImage}
                      alt={series.title}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 block text-sm font-medium group-hover:text-accent">
                      {series.title}
                    </span>
                    <span className="block text-xs text-muted">
                      {formatViews(series.views)} views
                    </span>
                    <span className="block truncate text-xs text-muted">
                      {series.genres.slice(0, 2).join(' · ')}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}
