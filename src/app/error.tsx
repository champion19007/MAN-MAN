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

  // The overwhelmingly common first-run failure is "no database yet".
  const looksLikeDbOutage =
    /can't reach database|ECONNREFUSED|P1001|does not exist in the current database|P2021/i.test(
      error.message,
    );

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>

      {looksLikeDbOutage ? (
        <div className="mt-4 space-y-3 text-left text-sm text-muted">
          <p>The app cannot reach its database. If this is a fresh checkout:</p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-3 text-xs">
            {`docker compose up -d\nnpm run db:push\nnpm run db:seed`}
          </pre>
          <p>
            Otherwise check that <code>DATABASE_URL</code> in <code>.env</code> points at a
            running PostgreSQL server.
          </p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted">
          This page failed to render. The details are in the server logs.
        </p>
      )}

      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
