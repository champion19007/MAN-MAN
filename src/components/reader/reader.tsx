'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReaderChrome } from './reader-chrome';
import { useReaderSettings } from './use-reader-settings';
import { readGuestProgress, useProgressSync } from './use-progress-sync';
import type { ChapterStub, ReaderChapter } from './types';

const PRELOAD_AHEAD = 3;
const SWIPE_MIN_X = 60;
const SWIPE_MAX_Y = 45;

type Props = {
  series: { slug: string; title: string };
  chapters: ChapterStub[]; // ascending by number
  initialChapter: ReaderChapter;
  initialScroll: number;
  signedIn: boolean;
};

export function Reader({ series, chapters, initialChapter, initialScroll, signedIn }: Props) {
  const router = useRouter();
  const { settings, update, hydrated } = useReaderSettings();
  const { record, flush } = useProgressSync({
    signedIn,
    seriesSlug: series.slug,
    seriesTitle: series.title,
  });

  const [loaded, setLoaded] = useState<ReaderChapter[]>([initialChapter]);
  const [activeNumber, setActiveNumber] = useState(initialChapter.number);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [eagerUntil, setEagerUntil] = useState(PRELOAD_AHEAD);
  const [pageIndex, setPageIndex] = useState(0);
  const [appending, setAppending] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);

  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);
  const restored = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const index = useMemo(
    () => chapters.findIndex((c) => c.number === activeNumber),
    [chapters, activeNumber],
  );
  const prevChapter = index > 0 ? chapters[index - 1] : null;
  const nextChapter =
    index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : null;

  const activeChapter =
    loaded.find((c) => c.number === activeNumber) ?? loaded[loaded.length - 1];

  /** Global page offsets so preloading can look across chapter boundaries. */
  const offsets = useMemo(() => {
    const map = new Map<string, number>();
    let running = 0;
    for (const chapter of loaded) {
      map.set(chapter.id, running);
      running += chapter.pages.length;
    }
    return map;
  }, [loaded]);

  const goToChapter = useCallback(
    (number: number) => {
      flush(true);
      router.push(`/series/${series.slug}/${number}`);
    },
    [flush, router, series.slug],
  );

  // --- Restore the saved position once, after the first images have a box. ---
  useEffect(() => {
    if (restored.current || !hydrated) return;
    restored.current = true;

    const fraction = signedIn ? initialScroll : readGuestProgress(initialChapter.id);
    if (fraction <= 0.001) return;

    const restore = () => {
      const section = sectionRefs.current.get(initialChapter.id);
      if (!section) return;
      window.scrollTo({ top: section.offsetTop + section.offsetHeight * fraction });
    };
    // Two frames plus a short delay: enough for next/image to reserve space.
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(restore, 150)));
  }, [hydrated, initialChapter.id, initialScroll, signedIn]);

  // --- Scroll tracking: chrome auto-hide, progress bar, active chapter. ---
  useEffect(() => {
    if (settings.mode !== 'vertical') return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;

        if (Math.abs(y - lastScrollY.current) > 8) {
          setChromeVisible(y < lastScrollY.current || y < 80);
          lastScrollY.current = y;
        }

        const viewportMiddle = y + window.innerHeight / 2;
        for (const chapter of loaded) {
          const section = sectionRefs.current.get(chapter.id);
          if (!section) continue;
          const top = section.offsetTop;
          const bottom = top + section.offsetHeight;
          if (viewportMiddle >= top && viewportMiddle < bottom) {
            const fraction = Math.min(
              1,
              Math.max(0, (y + window.innerHeight - top) / section.offsetHeight),
            );
            setProgress(fraction);
            if (chapter.number !== activeNumber) {
              setActiveNumber(chapter.number);
              window.history.replaceState(
                null,
                '',
                `/series/${series.slug}/${chapter.number}`,
              );
            }
            record({
              chapterId: chapter.id,
              chapterNumber: chapter.number,
              scrollPosition: fraction,
              completed: fraction > 0.9,
            });
            break;
          }
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeNumber, loaded, record, series.slug, settings.mode]);

  // --- Preloading: stay PRELOAD_AHEAD pages in front of what is on screen. ---
  const pageObserver = useRef<IntersectionObserver | null>(null);
  const pageNodes = useRef(new Set<HTMLElement>());

  const registerPage = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    pageNodes.current.add(node);
    pageObserver.current?.observe(node);
  }, []);

  useEffect(() => {
    if (settings.mode !== 'vertical') return;

    const observer = new IntersectionObserver(
      (entries) => {
        let furthest = -1;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number(
            (entry.target as HTMLElement).dataset.pageIndex ?? '-1',
          );
          if (index > furthest) furthest = index;
        }
        if (furthest >= 0) {
          setEagerUntil((prev) => Math.max(prev, furthest + PRELOAD_AHEAD));
        }
      },
      { rootMargin: '300px 0px' },
    );

    pageObserver.current = observer;
    for (const node of pageNodes.current) observer.observe(node);

    return () => {
      observer.disconnect();
      pageObserver.current = null;
    };
  }, [settings.mode]);

  // --- Infinite scroll into the next chapter. ---
  const appendNext = useCallback(async () => {
    if (appending || reachedEnd) return;
    const last = loaded[loaded.length - 1];
    const position = chapters.findIndex((c) => c.number === last.number);
    const upcoming = position >= 0 ? chapters[position + 1] : undefined;
    if (!upcoming) {
      setReachedEnd(true);
      return;
    }

    setAppending(true);
    try {
      const res = await fetch(
        `/api/chapters?slug=${encodeURIComponent(series.slug)}&number=${upcoming.number}`,
      );
      if (!res.ok) throw new Error('failed');
      const chapter = (await res.json()) as ReaderChapter;
      setLoaded((prev) =>
        prev.some((c) => c.id === chapter.id) ? prev : [...prev, chapter],
      );
    } catch {
      setReachedEnd(true);
    } finally {
      setAppending(false);
    }
  }, [appending, chapters, loaded, reachedEnd, series.slug]);

  useEffect(() => {
    if (settings.mode !== 'vertical') return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void appendNext();
      },
      { rootMargin: '1200px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [appendNext, settings.mode]);

  // --- Keyboard shortcuts. ---
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return;
      if (settings.mode === 'paginated') {
        if (event.key === 'ArrowRight') turnPage(1);
        if (event.key === 'ArrowLeft') turnPage(-1);
        return;
      }
      if (event.key === 'ArrowRight' && nextChapter) goToChapter(nextChapter.number);
      if (event.key === 'ArrowLeft' && prevChapter) goToChapter(prevChapter.number);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.mode, nextChapter, prevChapter, goToChapter, pageIndex, activeChapter]);

  function turnPage(direction: 1 | -1) {
    const pages = activeChapter?.pages ?? [];
    const next = pageIndex + direction;

    if (next < 0) {
      if (prevChapter) goToChapter(prevChapter.number);
      return;
    }
    if (next >= pages.length) {
      if (nextChapter) goToChapter(nextChapter.number);
      return;
    }

    setPageIndex(next);
    setProgress(pages.length > 1 ? (next + 1) / pages.length : 1);
    setEagerUntil((prev) => Math.max(prev, next + PRELOAD_AHEAD));
    if (activeChapter) {
      record({
        chapterId: activeChapter.id,
        chapterNumber: activeChapter.number,
        scrollPosition: pages.length > 1 ? next / (pages.length - 1) : 1,
        completed: next >= pages.length - 1,
      });
    }
  }

  // --- Swipe: chapter navigation in scroll mode, page turns when paginated. ---
  function onTouchStart(event: React.TouchEvent) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function onTouchEnd(event: React.TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_X || Math.abs(dy) > SWIPE_MAX_Y) return;

    if (settings.mode === 'paginated') {
      turnPage(dx < 0 ? 1 : -1);
      return;
    }
    if (dx < 0 && nextChapter) goToChapter(nextChapter.number);
    if (dx > 0 && prevChapter) goToChapter(prevChapter.number);
  }

  function onTapZone(event: React.MouseEvent<HTMLDivElement>) {
    if (!settings.tapZones) {
      setChromeVisible((v) => !v);
      return;
    }
    const { left, width } = event.currentTarget.getBoundingClientRect();
    const relative = (event.clientX - left) / width;

    if (relative < 0.3) {
      settings.mode === 'paginated'
        ? turnPage(-1)
        : prevChapter && goToChapter(prevChapter.number);
    } else if (relative > 0.7) {
      settings.mode === 'paginated'
        ? turnPage(1)
        : nextChapter && goToChapter(nextChapter.number);
    } else {
      setChromeVisible((v) => !v);
    }
  }

  const widthStyle = { maxWidth: `${settings.imageWidth}%` };

  return (
    <div
      className="min-h-dvh bg-black"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ReaderChrome
        visible={chromeVisible}
        seriesSlug={series.slug}
        seriesTitle={series.title}
        chapters={chapters}
        activeNumber={activeNumber}
        activeTitle={activeChapter?.title ?? null}
        prevNumber={prevChapter?.number ?? null}
        nextNumber={nextChapter?.number ?? null}
        progress={progress}
        settings={settings}
        onSettingsChange={update}
        onNavigate={goToChapter}
      />

      <div
        className="relative"
        style={{ filter: `brightness(${settings.brightness})` }}
      >
        {settings.mode === 'vertical' ? (
          <div className="reader-strip mx-auto flex flex-col items-center">
            {loaded.map((chapter) => (
              <section
                key={chapter.id}
                ref={(node) => {
                  if (node) sectionRefs.current.set(chapter.id, node);
                  else sectionRefs.current.delete(chapter.id);
                }}
                className="w-full"
                aria-label={`Chapter ${chapter.number}`}
              >
                <div className="mx-auto flex justify-center bg-black/60 py-3 text-xs uppercase tracking-widest text-white/60">
                  Chapter {chapter.number}
                  {chapter.title ? ` — ${chapter.title}` : ''}
                </div>
                {chapter.pages.map((page, i) => {
                  const globalIndex = (offsets.get(chapter.id) ?? 0) + i;
                  const eager = globalIndex <= eagerUntil;
                  return (
                    <div
                      key={page.id}
                      className="mx-auto w-full"
                      style={widthStyle}
                      data-page-index={globalIndex}
                      ref={registerPage}
                      onClick={onTapZone}
                    >
                      <Image
                        src={page.imageUrl}
                        alt={`Page ${page.order}`}
                        width={page.width ?? 800}
                        height={page.height ?? 1200}
                        sizes="(max-width: 900px) 100vw, 900px"
                        priority={globalIndex === 0}
                        loading={eager ? 'eager' : 'lazy'}
                        placeholder={page.blurData ? 'blur' : 'empty'}
                        blurDataURL={page.blurData ?? undefined}
                        className="h-auto w-full"
                      />
                    </div>
                  );
                })}
              </section>
            ))}

            <div ref={sentinelRef} className="h-24 w-full" />

            <div className="pb-28 text-center text-sm text-white/60">
              {appending ? (
                <span>Loading next chapter…</span>
              ) : reachedEnd || !nextChapter ? (
                <span>You are all caught up on {series.title}.</span>
              ) : (
                <button
                  type="button"
                  onClick={() => void appendNext()}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white"
                >
                  Load chapter {nextChapter.number}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className="flex min-h-dvh items-center justify-center"
            onClick={onTapZone}
          >
            {activeChapter?.pages[pageIndex] ? (
              <Image
                key={activeChapter.pages[pageIndex].id}
                src={activeChapter.pages[pageIndex].imageUrl}
                alt={`Page ${pageIndex + 1}`}
                width={activeChapter.pages[pageIndex].width ?? 800}
                height={activeChapter.pages[pageIndex].height ?? 1200}
                sizes="100vw"
                priority
                className="max-h-dvh w-auto object-contain"
                style={widthStyle}
              />
            ) : null}

            {/* Warm the next few pages so a tap never waits on the network. */}
            <div className="hidden">
              {activeChapter?.pages
                .slice(pageIndex + 1, pageIndex + 1 + PRELOAD_AHEAD)
                .map((page) => (
                  <Image
                    key={page.id}
                    src={page.imageUrl}
                    alt=""
                    width={page.width ?? 800}
                    height={page.height ?? 1200}
                    priority
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
