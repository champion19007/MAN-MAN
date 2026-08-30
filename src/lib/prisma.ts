import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Warn loudly rather than throwing: a throw here would take down routes that
 * never touch the database (they import this module transitively via the
 * session helper), turning one broken page into a broken site.
 */
if (!process.env.DATABASE_URL) {
  console.error(
    '[manman] DATABASE_URL is not set. Database-backed pages will fail. ' +
      'Set it in your environment (Vercel: Settings → Environment Variables, ' +
      'then redeploy) and run `prisma db push` against that database.',
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
