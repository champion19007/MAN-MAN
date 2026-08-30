import Link from 'next/link';

/** The rounded card that wraps each content block on the home page. */
export function Panel({
  title,
  icon,
  action,
  children,
  className = '',
}: {
  title?: string;
  icon?: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-surface p-4 sm:p-5 ${className}`}
    >
      {title ? (
        <div className="mb-4 flex items-center gap-2">
          {icon ? (
            <span aria-hidden className="text-accent">
              {icon}
            </span>
          ) : null}
          <h2 className="text-base font-bold">{title}</h2>
          {action ? (
            <Link
              href={action.href}
              className="ml-auto rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg transition-opacity hover:opacity-90"
            >
              {action.label}
            </Link>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
