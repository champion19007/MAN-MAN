'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

type Item = {
  slug: string;
  title: string;
  coverImage: string;
  description: string;
  genres: string[];
};

export function TrendingCarousel({ items }: { items: Item[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: 'smooth' });
  }

  if (items.length === 0) return null;

  return (
    <section className="relative">
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth"
      >
        {items.map((item, i) => (
          <Link
            key={item.slug}
            href={`/series/${item.slug}`}
            className="relative aspect-[16/9] w-full shrink-0 snap-center overflow-hidden rounded-2xl sm:aspect-[21/9]"
          >
            <Image
              src={item.coverImage}
              alt={item.title}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Trending
              </p>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-3xl">{item.title}</h2>
              <p className="mt-1 line-clamp-2 max-w-xl text-sm text-white/75">
                {item.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {item.genres.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-white"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden items-center justify-between px-2 sm:flex">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollByCard(-1)}
          className="pointer-events-auto rounded-full bg-black/50 px-3 py-2 text-white backdrop-blur hover:bg-black/70"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollByCard(1)}
          className="pointer-events-auto rounded-full bg-black/50 px-3 py-2 text-white backdrop-blur hover:bg-black/70"
        >
          ›
        </button>
      </div>
    </section>
  );
}
