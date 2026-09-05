import { PrismaClient } from '@prisma/client';
import { SERIES } from './series-data';

const prisma = new PrismaClient();

/**
 * Placeholder art. Swap `cover`/`page` for your CDN (R2/S3) URLs when real
 * assets land; nothing else in the seed depends on where the images live.
 */
import { HUES, LAYOUTS } from '../scripts/generate-panels';

/**
 * Placeholder panels from the generated pool: hue by series so chapters of one
 * title hang together, layout by page so a chapter reads as a sequence.
 */
const page = (seriesIndex: number, chapter: number, pageIndex: number) =>
  `/panels/h${HUES[seriesIndex % HUES.length]}-${(chapter + pageIndex) % LAYOUTS}.svg`;

const CHAPTER_TITLES = [
  'The First Fall',
  'What the Ash Remembers',
  'A Debt in Two Halves',
  'Small Mercies',
  'The Long Way Around',
  'Everything You Left',
  'Nightfall Terms',
  'The Quiet Part',
  'Handfuls of Salt',
  'A Reasonable Person',
  'The Second Door',
  'Weather for Leaving',
];

async function main() {
  console.log('Resetting seed data…');
  await prisma.comment.deleteMany();
  await prisma.readingHistory.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.page.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.series.deleteMany();
  await prisma.user.deleteMany();

  const now = Date.now();
  const hour = 3_600_000;

  for (const [seriesIndex, entry] of SERIES.entries()) {
    const { chapters: chapterCount, ...seriesData } = entry;

    // Stagger updatedAt so "latest updates" has a believable ordering.
    const updatedAt = new Date(now - seriesIndex * 7 * hour);

    const { hues: _hues, ...rest } = seriesData as typeof seriesData & {
      hues?: [number, number];
    };

    const series = await prisma.series.create({
      data: {
        ...rest,
        coverImage: `/covers/${entry.slug}.svg`,
        published: true,
        publishedAt: new Date(),
        updatedAt,
      },
    });

    for (let n = 1; n <= chapterCount; n++) {
      const releaseDate = new Date(
        updatedAt.getTime() - (chapterCount - n) * 72 * hour,
      );
      const pageCount = 8 + ((seriesIndex + n) % 5);

      await prisma.chapter.create({
        data: {
          seriesId: series.id,
          number: n,
          title: n % 3 === 0 ? CHAPTER_TITLES[(seriesIndex + n) % CHAPTER_TITLES.length] : null,
          releaseDate,
          viewCount: Math.round(series.views / chapterCount),
          pages: {
            create: Array.from({ length: pageCount }, (_, i) => ({
              imageUrl: page(seriesIndex, n, i),
              order: i + 1,
              width: 800,
              height: 1200,
            })),
          },
        },
      });
    }

    console.log(`  ${entry.title} — ${chapterCount} chapters`);
  }

  const demo = await prisma.user.create({
    data: { email: 'demo@manman.local', username: 'demo_reader' },
  });

  // Give the demo reader a library with a partially-read series.
  const bookmarked = await prisma.series.findMany({
    where: { slug: { in: ['solo-leveling', 'eleceed', 'tower-of-god'] } },
    select: { id: true, slug: true },
  });

  for (const series of bookmarked) {
    const chapters = await prisma.chapter.findMany({
      where: { seriesId: series.id },
      orderBy: { number: 'asc' },
      take: 4,
      select: { id: true },
    });

    await prisma.bookmark.create({
      data: {
        userId: demo.id,
        seriesId: series.id,
        lastReadChapterId: chapters.at(-1)?.id,
      },
    });

    await prisma.readingHistory.createMany({
      data: chapters.map((chapter, i) => ({
        userId: demo.id,
        chapterId: chapter.id,
        scrollPosition: i === chapters.length - 1 ? 0.42 : 1,
        completed: i !== chapters.length - 1,
      })),
    });
  }

  console.log(`\nSeeded ${SERIES.length} series and a demo reader (demo@manman.local).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
