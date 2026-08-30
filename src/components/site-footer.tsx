'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SiteFooter() {
  const pathname = usePathname();

  // The reader is full-bleed; a footer under it would interrupt the strip.
  if (/^\/series\/[^/]+\/[^/]+/.test(pathname)) return null;

  return (
    <footer className="mt-12 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-fg">
            M
          </span>
          ManMan
        </Link>

        <nav className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted">
          <Link href="/series" className="hover:text-fg">
            Browse
          </Link>
          <Link href="/search" className="hover:text-fg">
            Search
          </Link>
          <Link href="/library" className="hover:text-fg">
            Library
          </Link>
        </nav>

        <p className="mt-6 text-xs text-muted">
          © {new Date().getFullYear()} ManMan. Demo project — series and artwork
          shown are placeholder data.
        </p>
      </div>
    </footer>
  );
}
