'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function BookmarkButton({
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
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (!signedIn) {
      setError('Sign in to bookmark this series.');
      return;
    }

    const next = !bookmarked;
    setBookmarked(next); // optimistic
    setError(null);

    const res = await fetch('/api/bookmarks', {
      method: next ? 'POST' : 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ seriesId }),
    });

    if (!res.ok) {
      setBookmarked(!next);
      setError('Could not update your bookmark. Try again.');
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={bookmarked}
        className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors sm:w-auto ${
          bookmarked
            ? 'border border-accent bg-accent/15 text-accent'
            : 'bg-accent text-white hover:opacity-90'
        }`}
      >
        {bookmarked ? '✓ Bookmarked' : '+ Bookmark'}
      </button>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
