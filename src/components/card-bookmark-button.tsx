'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** Compact bookmark toggle for grid cards. */
export function CardBookmarkButton({
  seriesId,
  initial,
  signedIn,
}: {
  seriesId: string;
  initial: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push('/library');
      return;
    }

    const next = !bookmarked;
    setBookmarked(next); // optimistic
    setBusy(true);

    const res = await fetch('/api/bookmarks', {
      method: next ? 'POST' : 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ seriesId }),
    });

    setBusy(false);
    if (!res.ok) {
      setBookmarked(!next);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={bookmarked}
      className={`flex w-full items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 ${
        bookmarked
          ? 'bg-elevated text-accent'
          : 'bg-accent text-accent-fg hover:opacity-90'
      }`}
    >
      <span aria-hidden>{bookmarked ? '✓' : '🔖'}</span>
      {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  );
}
