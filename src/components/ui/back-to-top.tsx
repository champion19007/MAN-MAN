'use client';

import { useEffect, useState } from 'react';

export function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      hidden={!shown}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
        })
      }
      className="fixed bottom-5 right-5 z-30 grid h-11 w-11 place-items-center rounded-full bg-accent text-lg text-accent-fg shadow-lg shadow-black/30 transition-opacity hover:opacity-90"
    >
      ↑
    </button>
  );
}
