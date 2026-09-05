import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { Reader } from '@/components/reader/reader';

export const dynamic = 'force-dynamic';

type Params = { slug: string; chapterNumber: string };

function parseNumber(value: string) {
  const parsed = Number(decodeURIComponent(value));
  return Number.isFinite(parsed) ? parsed : null;
}

async function getChapter(slug: string, number: number) {
  return prisma.chapter.findFirst({
    where: { number, series: { slug, published: true } },
    select: {
      id: true,
      number: true,
      title: true,
      pages: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          imageUrl: true,
          order: true,
          width: true,
          height: true,
          blurData: true,
        },
      },
      series: { select: { id: true, slug: true, title: true, coverImage: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const number = parseNumber(params.chapterNumber);
  if (number === null) return { title: 'Chapter not found' };

  const chapter = await prisma.chapter.findFirst({
    where: { number, series: { slug: params.slug, published: true } },
    select: {
      number: true,
      title: true,
      series: { select: { title: true, coverImage: true, description: true } },
    },
  });
  if (!chapter) return { title: 'Chapter not found' };

  const title = `${chapter.series.title} — Chapter ${chapter.number}${
    chapter.title ? `: ${chapter.title}` : ''
  }`;
  const description = `Read ${chapter.series.title} chapter ${chapter.number} online. ${chapter.series.description.slice(0, 120)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: chapter.series.coverImage }],
      type: 'article',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ChapterPage({ params }: { params: Params }) {
  const number = parseNumber(params.chapterNumber);
  if (number === null) notFound();

  const chapter = await getChapter(params.slug, number);
  if (!chapter) notFound();

  const userId = await getCurrentUserId();

  const [chapters, history] = await Promise.all([
    prisma.chapter.findMany({
      where: { seriesId: chapter.series.id },
      orderBy: { number: 'asc' },
      select: { id: true, number: true, title: true },
    }),
    userId
      ? prisma.readingHistory.findUnique({
          where: { userId_chapterId: { userId, chapterId: chapter.id } },
          select: { scrollPosition: true },
        })
      : Promise.resolve(null),
  ]);

  // Fire-and-forget view count; a failure here must not break the read.
  void prisma.chapter
    .update({ where: { id: chapter.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  return (
    <Reader
      series={{ slug: chapter.series.slug, title: chapter.series.title }}
      chapters={chapters}
      initialChapter={{
        id: chapter.id,
        number: chapter.number,
        title: chapter.title,
        pages: chapter.pages,
      }}
      initialScroll={history?.scrollPosition ?? 0}
      signedIn={Boolean(userId)}
    />
  );
}
