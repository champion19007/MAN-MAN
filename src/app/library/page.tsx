import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { timeAgo } from '@/lib/format';
import { DemoAuthButton } from '@/components/demo-auth-button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your library',
  description: 'Your bookmarked series and reading progress.',
};

async function getLibrary(userId: string) {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    select: {
      id: true,
      lastReadChapter: { select: { id: true, number: true } },
      series: {
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          updatedAt: true,
          _count: { select: { chapters: true } },
          chapters: {
            orderBy: { number: 'desc' },
            take: 1,
            select: { number: true, releaseDate: true },
          },
        },
      },
    },
  });

  if (bookmarks.length === 0) return [];

  const seriesIds = bookmarks.map((b) => b.series.id);
  const readCounts = await prisma.readingHistory.groupBy({
    by: ['chapterId'],
    where: { userId, chapter: { seriesId: { in: seriesIds } } },
  });

  const readChapterIds = readCounts.map((row) => row.chapterId);
  const readBySeries = new Map<string, number>();
  if (readChapterIds.length > 0) {
    const chapters = await prisma.chapter.findMany({
      where: { id: { in: readChapterIds } },
      select: { seriesId: true },
    });
    for (const chapter of chapters) {
      readBySeries.set(chapter.seriesId, (readBySeries.get(chapter.seriesId) ?? 0) + 1);
    }
  }

  return bookmarks
    .map((bookmark) => ({
      ...bookmark,
      unread: Math.max(
        0,
        bookmark.series._count.chapters - (readBySeries.get(bookmark.series.id) ?? 0),
      ),
    }))
    .sort(
      (a, b) => b.series.updatedAt.getTime() - a.series.updatedAt.getTime(),
    );
}

export default async function LibraryPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your library</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in to keep bookmarks, unread badges, and your reading position in sync
          across devices. Guests still get their last-read chapter saved locally.
        </p>
        <div className="mt-6 flex justify-center">
          <DemoAuthButton signedIn={false} />
        </div>
      </div>
    );
  }

  const library = await getLibrary(userId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your library</h1>
          <p className="mt-1 text-sm text-muted">{library.length} bookmarked series</p>
        </div>
        <DemoAuthButton signedIn />
      </div>

      {library.length === 0 ? (
        <p className="mt-10 text-sm text-muted">
          Nothing bookmarked yet.{' '}
          <Link href="/series" className="text-accent hover:underline">
            Browse series
          </Link>{' '}
          and tap Bookmark to build your list.
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {library.map((entry) => {
            const latest = entry.series.chapters[0];
            const resumeNumber = entry.lastReadChapter?.number ?? latest?.number;

            return (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
              >
                <Link
                  href={`/series/${entry.series.slug}`}
                  className="relative h-24 w-16 shrink-0 overflow-hidden rounded-lg bg-elevated"
                >
                  <Image
                    src={entry.series.coverImage}
                    alt={entry.series.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/series/${entry.series.slug}`}
                    className="block truncate font-medium hover:text-accent"
                  >
                    {entry.series.title}
                  </Link>
                  <p className="text-xs text-muted">
                    {entry.lastReadChapter
                      ? `Read up to chapter ${entry.lastReadChapter.number}`
                      : 'Not started'}
                  </p>
                  {latest ? (
                    <p className="text-xs text-muted">
                      Latest: chapter {latest.number} · {timeAgo(latest.releaseDate)}
                    </p>
                  ) : null}
                  {entry.unread > 0 ? (
                    <span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
                      {entry.unread} unread
                    </span>
                  ) : null}
                </div>

                {resumeNumber !== undefined ? (
                  <Link
                    href={`/series/${entry.series.slug}/${resumeNumber}`}
                    className="shrink-0 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white"
                  >
                    Continue
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
