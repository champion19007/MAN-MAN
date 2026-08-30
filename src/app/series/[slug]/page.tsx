import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { formatViews, timeAgo } from '@/lib/format';
import { BookmarkButton } from '@/components/bookmark-button';

export const revalidate = 60;

const STATUS_LABEL: Record<string, string> = {
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  HIATUS: 'Hiatus',
  DROPPED: 'Dropped',
};

async function getSeries(slug: string) {
  return prisma.series.findUnique({
    where: { slug },
    include: {
      chapters: {
        orderBy: { number: 'desc' },
        select: { id: true, number: true, title: true, releaseDate: true },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const series = await prisma.series.findUnique({
    where: { slug: params.slug },
    select: { title: true, description: true, coverImage: true },
  });
  if (!series) return { title: 'Series not found' };

  const description = series.description.slice(0, 160);
  return {
    title: series.title,
    description,
    openGraph: {
      title: series.title,
      description,
      images: [{ url: series.coverImage }],
      type: 'book',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function SeriesPage({ params }: { params: { slug: string } }) {
  const series = await getSeries(params.slug);
  if (!series) notFound();

  const userId = await getCurrentUserId();
  const [bookmark, history] = await Promise.all([
    userId
      ? prisma.bookmark.findUnique({
          where: { userId_seriesId: { userId, seriesId: series.id } },
        })
      : Promise.resolve(null),
    userId
      ? prisma.readingHistory.findMany({
          where: { userId, chapter: { seriesId: series.id } },
          select: { chapterId: true },
        })
      : Promise.resolve([]),
  ]);

  const readChapterIds = new Set(history.map((h) => h.chapterId));
  const first = series.chapters[series.chapters.length - 1];
  const resumeNumber = bookmark?.lastReadChapterId
    ? series.chapters.find((c) => c.id === bookmark.lastReadChapterId)?.number
    : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative mx-auto aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-xl bg-elevated sm:mx-0 sm:w-52">
          <Image
            src={series.coverImage}
            alt={series.title}
            fill
            priority
            sizes="(max-width: 640px) 160px, 208px"
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{series.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {series.author}
            {series.artist !== series.author ? ` · art by ${series.artist}` : ''}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-border px-2 py-1">
              {STATUS_LABEL[series.status]}
            </span>
            <span className="rounded-full border border-border px-2 py-1">
              ★ {series.rating.toFixed(1)}
            </span>
            <span className="rounded-full border border-border px-2 py-1">
              {formatViews(series.views)} views
            </span>
            <span className="rounded-full border border-border px-2 py-1">
              {series.chapters.length} chapters
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {series.genres.map((genre) => (
              <Link
                key={genre}
                href={`/series?genre=${encodeURIComponent(genre)}`}
                className="rounded-full bg-elevated px-2.5 py-1 text-xs text-muted hover:text-fg"
              >
                {genre}
              </Link>
            ))}
          </div>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">
            {series.description}
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            {resumeNumber !== undefined ? (
              <Link
                href={`/series/${series.slug}/${resumeNumber}`}
                className="rounded-xl bg-elevated px-4 py-2.5 text-center text-sm font-semibold hover:text-accent"
              >
                Continue · Chapter {resumeNumber}
              </Link>
            ) : first ? (
              <Link
                href={`/series/${series.slug}/${first.number}`}
                className="rounded-xl bg-elevated px-4 py-2.5 text-center text-sm font-semibold hover:text-accent"
              >
                Start reading
              </Link>
            ) : null}
            <BookmarkButton
              seriesId={series.id}
              initial={Boolean(bookmark)}
              signedIn={Boolean(userId)}
            />
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Chapters</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {series.chapters.map((chapter) => {
            const read = readChapterIds.has(chapter.id);
            return (
              <li key={chapter.id}>
                <Link
                  href={`/series/${series.slug}/${chapter.number}`}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-elevated ${
                    read ? 'text-muted' : ''
                  }`}
                >
                  <span
                    aria-hidden
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      userId && !read ? 'bg-accent' : 'bg-transparent'
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm">
                    Chapter {chapter.number}
                    {chapter.title ? ` — ${chapter.title}` : ''}
                  </span>
                  {userId && !read ? <span className="sr-only">unread</span> : null}
                  <span className="shrink-0 text-xs text-muted">
                    {timeAgo(chapter.releaseDate)}
                  </span>
                </Link>
              </li>
            );
          })}
          {series.chapters.length === 0 ? (
            <li className="px-4 py-6 text-sm text-muted">No chapters published yet.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
