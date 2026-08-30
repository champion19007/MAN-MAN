'use client';

import { useCallback, useEffect, useRef } from 'react';
import { GUEST_PROGRESS_KEY, LAST_READ_KEY } from './types';

type Snapshot = {
  chapterId: string;
  chapterNumber: number;
  scrollPosition: number;
  completed: boolean;
};

const FLUSH_INTERVAL_MS = 5000;

/**
 * Collects reading progress and flushes it at most once every 5s — to the API
 * for signed-in readers, to localStorage for guests. The latest snapshot wins;
 * intermediate scroll positions are never worth a request.
 */
export function useProgressSync({
  signedIn,
  seriesSlug,
  seriesTitle,
}: {
  signedIn: boolean;
  seriesSlug: string;
  seriesTitle: string;
}) {
  const pending = useRef<Snapshot | null>(null);
  const lastSent = useRef<string>('');

  const flush = useCallback(
    (useBeacon = false) => {
      const snapshot = pending.current;
      if (!snapshot) return;

      const signature = `${snapshot.chapterId}:${snapshot.scrollPosition.toFixed(3)}`;
      if (signature === lastSent.current) return;
      lastSent.current = signature;

      try {
        localStorage.setItem(
          LAST_READ_KEY,
          JSON.stringify({
            seriesSlug,
            seriesTitle,
            chapterNumber: snapshot.chapterNumber,
            scrollPosition: snapshot.scrollPosition,
          }),
        );
      } catch {
        // Storage unavailable; server sync below still applies when signed in.
      }

      if (!signedIn) {
        try {
          const raw = localStorage.getItem(GUEST_PROGRESS_KEY);
          const all = raw ? (JSON.parse(raw) as Record<string, Snapshot>) : {};
          all[snapshot.chapterId] = snapshot;
          localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(all));
        } catch {
          // Nothing more we can do for guests without storage.
        }
        return;
      }

      const body = JSON.stringify(snapshot);
      if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/progress', new Blob([body], { type: 'application/json' }));
        return;
      }
      void fetch('/api/progress', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {
        // A dropped progress ping is not worth surfacing to the reader.
        lastSent.current = '';
      });
    },
    [seriesSlug, seriesTitle, signedIn],
  );

  const record = useCallback((snapshot: Snapshot) => {
    pending.current = snapshot;
  }, []);

  useEffect(() => {
    const timer = setInterval(() => flush(false), FLUSH_INTERVAL_MS);

    const onHide = () => {
      if (document.visibilityState === 'hidden') flush(true);
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', () => flush(true));

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onHide);
      flush(true);
    };
  }, [flush]);

  return { record, flush };
}

export function readGuestProgress(chapterId: string): number {
  try {
    const raw = localStorage.getItem(GUEST_PROGRESS_KEY);
    if (!raw) return 0;
    const all = JSON.parse(raw) as Record<string, { scrollPosition?: number }>;
    return all[chapterId]?.scrollPosition ?? 0;
  } catch {
    return 0;
  }
}
