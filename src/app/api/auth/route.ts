import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * Development-only session stub so the signed-in surfaces (bookmarks, history,
 * unread badges) are exercisable without wiring an identity provider. Replace
 * this route and `src/lib/session.ts` with NextAuth or Clerk before shipping —
 * it authenticates nobody.
 */
export async function POST() {
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_DEMO_LOGIN) {
    return NextResponse.json({ error: 'Demo login is disabled' }, { status: 403 });
  }

  const user = await prisma.user.upsert({
    where: { email: 'demo@manman.local' },
    create: { email: 'demo@manman.local', username: 'demo_reader' },
    update: {},
  });

  const response = NextResponse.json({ ok: true, user });
  response.cookies.set(SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}
