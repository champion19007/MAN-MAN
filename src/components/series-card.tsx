import Image from 'next/image';
import Link from 'next/link';
import { timeAgo } from '@/lib/format';
import { CardBookmarkButton } from '@/components/card-bookmark-button';

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
  rating?: number;
  status?: string;
  chapterCount?: number;
  latestChapter?: number | null;
  updatedAt?: Date | string | null;
  unread?: number;
  priority?: boolean;
  /** Renders the card as a browse tile with a footer action. */
  withAction?: boolean;
  /** Supplying these turns the footer action into a bookmark toggle. */
  seriesId?: string;
  bookmarked?: boolean;
  signedIn?: boolean;
};

export function SeriesCard({
  slug,
  title,
  coverImage,
  rating,
  status,
  chapterCount,
  latestChapter,
  updatedAt,
  unread,
  priority,
  withAction,
  seriesId,
  bookmarked = false,
  signedIn = false,
}: Props) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent/60">
      <Link href={`/series/${slug}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden bg-elevated">
          <Image
            src={coverImage}
            alt={title}
            fill
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {rating !== undefined ? (
            <span className="absolute right-2 top-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-bold text-star">
              ★ {(rating * 2).toFixed(1)}
            </span>
          ) : null}

          {unread ? (
            <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg">
              {unread > 99 ? '99+' : unread}
            </span>
          ) : null}
        </div>

        <div className="p-3">
          <h3 className="line-clamp-1 text-sm font-semibold group-hover:text-accent">
            {title}
          </h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
            {chapterCount !== undefined ? (
              <span className="rounded bg-elevated px-1.5 py-0.5 text-muted">
                {chapterCount} Chapters
              </span>
            ) : null}
            {status ? (
              <span className="rounded bg-accent/15 px-1.5 py-0.5 font-medium text-accent">
                {STATUS_LABEL[status] ?? status}
              </span>
            ) : null}
          </div>

          {latestChapter !== undefined && latestChapter !== null ? (
            <p className="mt-1.5 text-xs text-muted">
              Chapter {latestChapter}
              {updatedAt ? ` · ${timeAgo(updatedAt)}` : ''}
            </p>
          ) : null}
        </div>
      </Link>

      {seriesId ? (
        <CardBookmarkButton
          seriesId={seriesId}
          initial={bookmarked}
          signedIn={signedIn}
        />
      ) : withAction ? (
        <Link
          href={`/series/${slug}`}
          className="block bg-accent px-3 py-2 text-center text-xs font-semibold text-accent-fg transition-opacity hover:opacity-90"
        >
          Read now
        </Link>
      ) : null}
    </div>
  );
}
