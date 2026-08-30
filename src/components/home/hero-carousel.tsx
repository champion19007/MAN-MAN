'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type Item = {
  slug: string;
  title: string;
  coverImage: string;
  rating: number;
  genres: string[];
};

const ADVANCE_MS = 6000;

/**
 * A strip of covers where the centred one is enlarged and titled. The track
 * scrolls the active card into the centre rather than transforming a fixed
 * layout, so it behaves the same at any viewport width.
 */
export function HeroCarousel({ items }: { items: Item[] }) {
  const [active, setActive] = useState(Math.floor(items.length / 2));
  const [paused, setPaused] = useState(false);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const centre = useCallback((index: number, smooth = true) => {
    cardRefs.current[index]?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      inline: 'center',
      block: 'nearest',
    });
  }, []);

  useEffect(() => {
    centre(active, false);
    // Centre the initial card without animating past every neighbour.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const timer = setInterval(
      () => setActive((i) => (i + 1) % items.length),
      ADVANCE_MS,
    );
    return () => clearInterval(timer);
  }, [paused, items.length]);

  useEffect(() => {
    centre(active);
  }, [active, centre]);

  if (items.length === 0) return null;
  const current = items[active];

  return (
    <section
      className="relative -mx-4 overflow-hidden py-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured series"
    >
      {/* Blurred backdrop of whatever is centred. */}
      <div className="absolute inset-0 -z-10">
        <Image
          key={current.slug}
          src={current.coverImage}
          alt=""
          fill
          aria-hidden
          sizes="100vw"
          className="scale-110 object-cover opacity-25 blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-bg/30 to-bg" />
      </div>

      <div className="no-scrollbar flex snap-x items-center gap-3 overflow-x-auto px-[42vw] sm:px-[38vw]">
        {items.map((item, i) => {
          const isActive = i === active;
          return (
            <Link
              key={item.slug}
              href={`/series/${item.slug}`}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              aria-current={isActive}
              className={`group relative shrink-0 snap-center overflow-hidden rounded-xl transition-all duration-300 ${
                isActive
                  ? 'w-40 ring-2 ring-accent sm:w-52'
                  : 'w-24 opacity-55 hover:opacity-80 sm:w-32'
              }`}
            >
              <div className="relative aspect-[2/3] w-full bg-elevated">
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  priority={i === active}
                  sizes="(max-width: 640px) 40vw, 210px"
                  className="object-cover"
                />
                {isActive ? (
                  <span className="absolute left-2 top-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[11px] font-bold text-star">
                    ★ {(item.rating * 2).toFixed(1)}
                  </span>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 px-4 text-center">
        <Link
          href={`/series/${current.slug}`}
          className="text-lg font-bold hover:text-accent sm:text-2xl"
        >
          {current.title}
        </Link>
        <p className="mt-1 text-xs text-muted">{current.genres.join(' · ')}</p>

        <div className="mt-3 flex justify-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              aria-label={`Show ${item.title}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? 'w-6 bg-accent' : 'w-1.5 bg-border hover:bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
