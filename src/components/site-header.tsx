'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/series', label: 'Browse' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/library', label: 'Library' },
];

export function SiteHeader({ theme }: { theme: 'dark' | 'light' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [current, setCurrent] = useState(theme);

  // Ctrl/Cmd+K jumps to search, the shortcut the header advertises.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        router.push('/search');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  // The reader supplies its own auto-hiding chrome.
  if (/^\/series\/[^/]+\/[^/]+/.test(pathname)) return null;

  function toggleTheme() {
    const next = current === 'dark' ? 'light' : 'dark';
    setCurrent(next);
    document.documentElement.classList.toggle('light', next === 'light');
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-header text-header-fg shadow-lg shadow-black/20">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:px-4">
        <Link
          href="/"
          aria-label="ManMan home"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/25 text-lg font-black"
        >
          M
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 transition-colors ${
                isActive(item.href)
                  ? 'bg-black/25 text-white'
                  : 'text-header-fg/80 hover:bg-black/15 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 text-sm text-header-fg/80 transition-colors hover:text-white"
          >
            <span aria-hidden>⌕</span>
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-white/25 px-1.5 py-0.5 text-[10px] tracking-wider md:inline">
              Ctrl K
            </kbd>
          </Link>

          <Link
            href="/library"
            className="hidden items-center gap-2 rounded-xl bg-black/25 px-3 py-2 text-sm text-header-fg/80 transition-colors hover:text-white sm:flex"
          >
            <span aria-hidden>🔖</span>
            Bookmarks
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${current === 'dark' ? 'light' : 'dark'} theme`}
            className="rounded-xl bg-black/25 px-3 py-2 text-sm transition-colors hover:text-white"
          >
            {current === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </div>
    </header>
  );
}
