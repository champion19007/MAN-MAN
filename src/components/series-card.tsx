import Image from 'next/image';
import Link from 'next/link';
import { timeAgo } from '@/lib/format';

type Props = {
  slug: string;
  title: string;
  coverImage: string;
  badge?: string | null;
  subtitle?: string | null;
  updatedAt?: Date | string | null;
  unread?: number;
  priority?: boolean;
};

export function SeriesCard({
  slug,
  title,
  coverImage,
  badge,
  subtitle,
  updatedAt,
  unread,
  priority,
}: Props) {
  return (
    <Link href={`/series/${slug}`} className="group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-elevated">
        <Image
          src={coverImage}
          alt={title}
          fill
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {badge ? (
          <span className="absolute left-2 top-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {badge}
          </span>
        ) : null}
        {unread ? (
          <span className="absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        ) : null}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-snug group-hover:text-accent">
        {title}
      </h3>
      {subtitle ? <p className="mt-0.5 text-xs text-muted">{subtitle}</p> : null}
      {updatedAt ? <p className="text-xs text-muted">{timeAgo(updatedAt)}</p> : null}
    </Link>
  );
}
