import Image from 'next/image';
import Link from 'next/link';
import { formatViews } from '@/lib/format';

const STATUS_STYLE: Record<string, string> = {
  ONGOING: 'border-emerald-500/40 text-emerald-400',
  COMPLETED: 'border-sky-500/40 text-sky-400',
  HIATUS: 'border-amber-500/40 text-amber-400',
  DROPPED: 'border-rose-500/40 text-rose-400',
};

const STATUS_LABEL: Record<string, string> = {
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  HIATUS: 'Hiatus',
  DROPPED: 'Dropped',
};

type Props = {
  slug: string;
  title: string;
  coverImage: string;
  description: string;
  genres: string[];
  status: string;
  views: number;
  chapterCount: number;
  priority?: boolean;
};

/**
 * Wide list row: cover, title, popularity, genre chips and a synopsis excerpt.
 * Denser than the grid tile and better for scanning what a series actually is.
 */
export function SeriesRow({
  slug,
  title,
  coverImage,
  description,
  genres,
  status,
  views,
  chapterCount,
  priority,
}: Props) {
  return (
    <article className="flex gap-4 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent/50">
      <Link
        href={`/series/${slug}`}
        className="relative aspect-[2/3] w-[92px] shrink-0 overflow-hidden rounded-lg bg-elevated sm:w-[116px]"
      >
        <Image
          src={coverImage}
          alt={title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 92px, 116px"
          className="object-cover"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
          <Link
            href={`/series/${slug}`}
            className="text-base font-semibold leading-tight hover:text-accent"
          >
            {title}
          </Link>
          <span
            className={`ml-auto shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              STATUS_STYLE[status] ?? 'border-border text-muted'
            }`}
          >
            {STATUS_LABEL[status] ?? status}
          </span>
        </div>

        <p className="mt-1 flex items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span aria-hidden className="text-accent">
              ♥
            </span>
            <span className="tabular-nums">{formatViews(views)}</span>
          </span>
          <span className="tabular-nums">{chapterCount} chapters</span>
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {genres.slice(0, 5).map((genre) => (
            <Link
              key={genre}
              href={`/series?genre=${encodeURIComponent(genre)}`}
              className="rounded bg-elevated px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted transition-colors hover:text-accent"
            >
              {genre}
            </Link>
          ))}
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {description}
        </p>
      </div>
    </article>
  );
}
