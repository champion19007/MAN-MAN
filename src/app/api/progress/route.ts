import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const limit = rateLimit(clientKey(request, 'progress'), 60, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  let body: {
    chapterId?: string;
    scrollPosition?: number;
    completed?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { chapterId } = body;
  if (!chapterId) {
    return NextResponse.json({ error: 'chapterId is required' }, { status: 400 });
  }

  const scrollPosition = Math.min(1, Math.max(0, Number(body.scrollPosition) || 0));
  const completed = Boolean(body.completed);

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, seriesId: true },
  });
  if (!chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.readingHistory.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      create: { userId, chapterId, scrollPosition, completed },
      update: { scrollPosition, completed, readAt: new Date() },
    }),
    // Keep the bookmark's resume point in step, but never create one implicitly.
    prisma.bookmark.updateMany({
      where: { userId, seriesId: chapter.seriesId },
      data: { lastReadChapterId: chapterId, updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
