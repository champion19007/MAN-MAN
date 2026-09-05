import Link from 'next/link';

/** Grid / list switch for the browse page. Links, so the choice lives in the URL. */
export function ViewToggle({
  view,
  gridHref,
  listHref,
}: {
  view: 'grid' | 'list';
  gridHref: string;
  listHref: string;
}) {
  const base =
    'grid h-9 w-10 place-items-center text-sm transition-colors first:rounded-l-lg last:rounded-r-lg';

  return (
    <div
      className="flex overflow-hidden rounded-lg border border-border"
      role="group"
      aria-label="Layout"
    >
      <Link
        href={gridHref}
        aria-label="Grid view"
        aria-current={view === 'grid' ? 'true' : undefined}
        className={`${base} ${
          view === 'grid'
            ? 'bg-accent text-accent-fg'
            : 'bg-elevated text-muted hover:text-fg'
        }`}
      >
        ▦
      </Link>
      <Link
        href={listHref}
        aria-label="List view"
        aria-current={view === 'list' ? 'true' : undefined}
        className={`${base} ${
          view === 'list'
            ? 'bg-accent text-accent-fg'
            : 'bg-elevated text-muted hover:text-fg'
        }`}
      >
        ☰
      </Link>
    </div>
  );
}
