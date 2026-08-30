import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE = 'uid';
export const THEME_COOKIE = 'theme';

/**
 * Minimal cookie-backed session. This is the single seam to replace with
 * NextAuth/Clerk: everything else in the app only calls `getCurrentUser()`
 * and expects `{ id, username, ... } | null`.
 */
export async function getCurrentUserId(): Promise<string | null> {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser() {
  const id = await getCurrentUserId();
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

export function getTheme(): 'dark' | 'light' {
  return cookies().get(THEME_COOKIE)?.value === 'light' ? 'light' : 'dark';
}
