import { PrismaClient, SeriesStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Placeholder art. Swap `cover`/`page` for your CDN (R2/S3) URLs when real
 * assets land; nothing else in the seed depends on where the images live.
 */
const cover = (seed: string) => `https://picsum.photos/seed/${seed}-cover/600/900`;
const page = (seed: string, n: number) =>
  `https://picsum.photos/seed/${seed}-${n}/800/1200`;

const SERIES = [
  {
    slug: 'ashfall-monarch',
    title: 'Ashfall Monarch',
    author: 'Yun Seo-ah',
    artist: 'Kang Min-woo',
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Fantasy', 'Martial Arts'],
    rating: 4.8,
    views: 4_820_000,
    chapters: 24,
    description:
      'Three centuries after the last gate closed, the ash still falls over Seoul. Ha-jin sells scavenged relics to pay for his sister’s treatment — until a relic answers back, and names him heir to a throne that burned down long before he was born.',
  },
  {
    slug: 'the-quiet-blade',
    title: 'The Quiet Blade',
    author: 'Ren Takahashi',
    artist: 'Ren Takahashi',
    status: SeriesStatus.ONGOING,
    genres: ['Action', 'Drama', 'Martial Arts'],
    rating: 4.6,
    views: 3_140_000,
    chapters: 18,
    description:
      'A swordsman who has taken a vow of silence walks the post road between two warring provinces. He does not want students. The road keeps giving him them anyway.',
  },
  {
    slug: 'greenhouse-of-second-chances',
    title: 'Greenhouse of Second Chances',
    author: 'Mira Delacroix',
    artist: 'Sofia Anand',
    status: SeriesStatus.COMPLETED,
    genres: ['Romance', 'Slice of Life', 'Drama'],
    rating: 4.7,
    views: 2_010_000,
    chapters: 32,
    description:
      'Inheriting a derelict greenhouse was supposed to be a burden. Then the plants started blooming out of season, and the neighbour who broke her heart at nineteen turned up asking for a job.',
  },
  {
    slug: 'null-sector',
    title: 'Null Sector',
    author: 'Diego Marchetti',
    artist: 'Kwon Ji-hye',
    status: SeriesStatus.ONGOING,
    genres: ['Sci-Fi', 'Thriller', 'Mystery'],
    rating: 4.5,
    views: 1_760_000,
    chapters: 21,
    description:
      'Every citizen of Meridian Station has a memory allowance. Auditor Vela spends hers hunting people who exceed theirs — and finds a file that says she died four years ago.',
  },
  {
    slug: 'tea-with-demons',
    title: 'Tea With Demons',
    author: 'Park Ha-eun',
    artist: 'Park Ha-eun',
    status: SeriesStatus.ONGOING,
    genres: ['Comedy', 'Fantasy', 'Slice of Life'],
    rating: 4.4,
    views: 1_290_000,
    chapters: 27,
    description:
      'The teahouse on Gyedong Street serves anyone who can pay — including things with too many eyes. The new part-timer is not sure that counts as a customer service job.',
  },
  {
    slug: 'iron-orchard',
    title: 'Iron Orchard',
    author: 'Lena Voss',
    artist: 'Marco Ferrara',
    status: SeriesStatus.HIATUS,
    genres: ['Horror', 'Mystery', 'Drama'],
    rating: 4.2,
    views: 890_000,
    chapters: 12,
    description:
      'The orchard outside Halvard produces fruit no one will eat and a harvest no one will discuss. A city surveyor is sent to draw its boundaries and cannot make the map close.',
  },
  {
    slug: 'reborn-as-the-villains-accountant',
    title: "Reborn as the Villain's Accountant",
    author: 'Choi Dae-hyun',
    artist: 'Im Na-rae',
    status: SeriesStatus.ONGOING,
    genres: ['Isekai', 'Comedy', 'Fantasy'],
    rating: 4.9,
    views: 5_640_000,
    chapters: 30,
    description:
      'Reincarnated into the novel he was reading, Jun expected a sword. He got a ledger, a demon lord with a catastrophic burn rate, and eleven months to make the war profitable.',
  },
  {
    slug: 'saltwater-hymn',
    title: 'Saltwater Hymn',
    author: 'Nadia Okonkwo',
    artist: 'Nadia Okonkwo',
    status: SeriesStatus.COMPLETED,
    genres: ['Adventure', 'Fantasy', 'Drama'],
    rating: 4.6,
    views: 1_120_000,
    chapters: 20,
    description:
      'The tide comes in singing, and the village answers. When it stops answering, a lighthouse keeper’s daughter goes looking for the verse they lost.',
  },
  {
    slug: 'midnight-courier',
    title: 'Midnight Courier',
    author: 'Sam Ito',
    artist: 'Bea Ramos',
    status: SeriesStatus.ONGOING,
    genres: ['Thriller', 'Action', 'Mystery'],
    rating: 4.3,
    views: 760_000,
    chapters: 15,
    description:
      'Packages between 2am and 5am pay triple and are never insured. Rin has never opened one. Tonight the package is knocking.',
  },
  {
    slug: 'the-last-cartographer',
    title: 'The Last Cartographer',
    author: 'Elias Brandt',
    artist: 'Yuki Nakamura',
    status: SeriesStatus.DROPPED,
    genres: ['Adventure', 'Fantasy', 'Mystery'],
    rating: 3.9,
    views: 420_000,
    chapters: 8,
    description:
      'Maps of the Reach expire after a year — the land does not sit still. The guild keeps sending cartographers past the ridge. It has stopped keeping track of how many return.',
  },
  {
    slug: 'paper-crane-protocol',
    title: 'Paper Crane Protocol',
    author: 'Hana Fujimoto',
    artist: 'Hana Fujimoto',
    status: SeriesStatus.ONGOING,
    genres: ['Sci-Fi', 'Romance', 'Drama'],
    rating: 4.5,
    views: 980_000,
    chapters: 19,
    description:
      'A messaging network that runs on folded paper and short-range drones was meant to be a school project. Two cities and one blackout later, it is the only thing still working.',
  },
  {
    slug: 'glasshouse-tyrant',
    title: 'Glasshouse Tyrant',
    author: 'Oh Seung-min',
    artist: 'Oh Seung-min',
    status: SeriesStatus.ONGOING,
    genres: ['Drama', 'Thriller', 'Mystery'],
    rating: 4.4,
    views: 1_430_000,
    chapters: 22,
    description:
      'The chairman’s estate has no interior walls — everything is visible, and nothing is known. His youngest daughter has spent eighteen years learning to be looked at without being seen.',
  },
];

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

    const series = await prisma.series.create({
      data: {
        ...seriesData,
        coverImage: cover(entry.slug),
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
              imageUrl: page(`${entry.slug}-c${n}`, i + 1),
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
    where: { slug: { in: ['ashfall-monarch', 'null-sector', 'tea-with-demons'] } },
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
