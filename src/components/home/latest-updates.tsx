import Image from 'next/image';
import Link from 'next/link';
import { timeAgo } from '@/lib/format';

type Entry = {
  slug: string;
  title: string;
  coverImage: string;
  chapters: { id: string; number: number; releaseDate: Date }[];
};

/**
 * Two columns of series, each showing its three most recent chapters — the
 * shape a reader scans to see what has dropped since they last visited.
 */
export function LatestUpdates({ entries }: { entries: Entry[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
      {entries.map((entry, i) => (
        <li key={entry.slug} className="flex gap-3">
          <Link
            href={`/series/${entry.slug}`}
            className="relative h-[86px] w-[62px] shrink-0 overflow-hidden rounded-lg bg-elevated"
          >
            <Image
              src={entry.coverImage}
              alt={entry.title}
              fill
              priority={i < 4}
              sizes="62px"
              className="object-cover"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <Link
              href={`/series/${entry.slug}`}
              className="line-clamp-1 text-sm font-semibold hover:text-accent"
            >
              {entry.title}
            </Link>

            <ul className="mt-1 space-y-1">
              {entry.chapters.map((chapter, index) => (
                <li key={chapter.id}>
                  <Link
                    href={`/series/${entry.slug}/${chapter.number}`}
                    className="flex items-baseline justify-between gap-2 text-xs transition-colors hover:text-accent"
                  >
                    <span className={index === 0 ? 'text-accent' : 'text-muted'}>
                      Chapter {chapter.number}
                    </span>
                    <span className="shrink-0 text-[11px] text-muted">
                      {timeAgo(chapter.releaseDate)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
}
