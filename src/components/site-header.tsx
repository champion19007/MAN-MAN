'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const NAV = [
  { href: '/series', label: 'Browse' },
  { href: '/search', label: 'Search' },
  { href: '/library', label: 'Library' },
];

export function SiteHeader({ theme }: { theme: 'dark' | 'light' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [current, setCurrent] = useState(theme);

  // The reader supplies its own auto-hiding chrome.
  if (/^\/series\/[^/]+\/[^/]+/.test(pathname)) return null;

  function toggleTheme() {
    const next = current === 'dark' ? 'light' : 'dark';
    setCurrent(next);
    document.documentElement.classList.toggle('light', next === 'light');
    document.cookie = `theme=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-1 px-4">
        <Link href="/" className="mr-2 text-lg font-bold tracking-tight">
          Man<span className="text-accent">Man</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 transition-colors ${
                  active ? 'bg-elevated text-fg' : 'text-muted hover:text-fg'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${current === 'dark' ? 'light' : 'dark'} theme`}
          className="ml-auto rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:text-fg"
        >
          {current === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  );
}
