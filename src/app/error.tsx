'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  /**
   * Next redacts server error messages before they reach the client in
   * production — `error.message` becomes a placeholder and only `digest`
   * survives. So this match works in development (where the real message is
   * passed through) and never in production. Treat it as a dev convenience,
   * not as detection: the guidance below is shown either way.
   */
  const looksLikeDbOutage =
    /can't reach database|ECONNREFUSED|P1001|Environment variable not found|does not exist in the current database|P2021/i.test(
      error.message,
    );

  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <h1 className="text-center text-2xl font-bold">Something went wrong</h1>

      <p className="mt-2 text-center text-sm text-muted">
        {looksLikeDbOutage
          ? 'The app cannot reach its database.'
          : 'This page failed to render.'}
      </p>

      <div className="mt-6 space-y-4 text-sm text-muted">
        <p>
          Most failures on this page are database configuration. Check, in order:
        </p>

        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <code>DATABASE_URL</code> is set for this environment. On Vercel that is
            Project → Settings → Environment Variables, then redeploy — env changes do
            not apply to existing deployments.
          </li>
          <li>
            The schema exists in that database: <code>npx prisma db push</code>.
          </li>
          <li>
            Locally, that Postgres is actually running: <code>docker compose up -d</code>.
          </li>
        </ol>

        {error.digest ? (
          <p className="text-xs">
            Error digest <code>{error.digest}</code> — search your server logs for this
            to see the underlying message.
          </p>
        ) : null}
      </div>

      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
