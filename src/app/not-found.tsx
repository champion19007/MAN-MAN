import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Nothing here</h1>
      <p className="mt-2 text-sm text-muted">
        That series or chapter does not exist — it may have been removed or renamed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
      >
        Back to home
      </Link>
    </div>
  );
}
