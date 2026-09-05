import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PUBLIC_SERIES } from '@/lib/visibility';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const limit = rateLimit(clientKey(request, 'search'), 30, 10_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many searches. Slow down a moment.' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  const query = (new URL(request.url).searchParams.get('q') ?? '').trim();
  if (query.length < 2) return NextResponse.json({ results: [] });

  const results = await prisma.series.findMany({
    where: {
      ...PUBLIC_SERIES,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { author: { contains: query, mode: 'insensitive' } },
        { artist: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { views: 'desc' },
    take: 20,
    select: {
      id: true,
      slug: true,
      title: true,
      coverImage: true,
      status: true,
      genres: true,
      _count: { select: { chapters: true } },
    },
  });

  return NextResponse.json({ results });
}
