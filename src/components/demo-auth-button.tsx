'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DemoAuthButton({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    await fetch('/api/auth', { method: signedIn ? 'DELETE' : 'POST' });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
    >
      {signedIn ? 'Sign out' : 'Sign in as demo reader'}
    </button>
  );
}
