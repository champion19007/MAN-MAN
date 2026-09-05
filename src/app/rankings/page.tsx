import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatViews } from '@/lib/format';
import { StarRating } from '@/components/ui/star-rating';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Rankings',
  description: 'The most read manga and manhwa on ManMan, ranked by total views.',
};

export default async function RankingsPage() {
  const series = await prisma.series.findMany({
    orderBy: { views: 'desc' },
    take: 50,
    select: {
      slug: true,
      title: true,
      coverImage: true,
      genres: true,
      rating: true,
      views: true,
      _count: { select: { chapters: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Rankings</h1>
        <p className="mt-2 text-sm text-muted">
          The most read series on ManMan, by total views.
        </p>
      </header>

      <ol className="overflow-hidden rounded-2xl border border-border bg-surface">
        {series.map((item, i) => {
          const rank = i + 1;
          // Only the podium gets emphasis; past that a rank number is enough.
          const podium =
            rank === 1
              ? 'bg-star/10'
              : rank === 2
                ? 'bg-muted/10'
                : rank === 3
                  ? 'bg-accent/10'
                  : '';

          return (
            <li key={item.slug} className="border-b border-border last:border-b-0">
              <Link
                href={`/series/${item.slug}`}
                className={`group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-elevated sm:gap-4 sm:px-4 ${podium}`}
              >
                <span
                  className={`w-8 shrink-0 text-center text-lg font-bold tabular-nums ${
                    rank <= 3 ? 'text-accent' : 'text-muted'
                  }`}
                >
                  {rank}
                </span>

                <span className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-elevated">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 font-semibold group-hover:text-accent">
                    {item.title}
                  </span>
                  <span className="mt-0.5 line-clamp-1 block text-xs text-muted">
                    {item.genres.join(', ')}
                  </span>
                  <span className="mt-1 block">
                    <StarRating rating={item.rating} />
                  </span>
                </span>

                <span className="hidden shrink-0 text-right text-xs text-muted sm:block">
                  <span className="block tabular-nums">{formatViews(item.views)} views</span>
                  <span className="block tabular-nums">
                    {item._count.chapters} chapters
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      {series.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted">Nothing to rank yet.</p>
      ) : null}
    </div>
  );
}
