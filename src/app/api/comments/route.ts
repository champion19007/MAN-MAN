import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';
import { clientKey, rateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MAX_LENGTH = 2000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapterId = searchParams.get('chapterId');
  const seriesId = searchParams.get('seriesId');

  if (!chapterId && !seriesId) {
    return NextResponse.json(
      { error: 'chapterId or seriesId is required' },
      { status: 400 },
    );
  }

  const comments = await prisma.comment.findMany({
    where: chapterId ? { chapterId } : { seriesId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { username: true, avatar: true } },
    },
  });

  return NextResponse.json({ comments });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  // Comments are cheap to write and expensive to moderate: keep the tap narrow.
  const limit = rateLimit(clientKey(request, 'comments'), 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'You are commenting too quickly.' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  let body: { content?: string; chapterId?: string; seriesId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const content = (body.content ?? '').trim();
  if (!content) {
    return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 });
  }
  if (content.length > MAX_LENGTH) {
    return NextResponse.json(
      { error: `Comments are limited to ${MAX_LENGTH} characters` },
      { status: 400 },
    );
  }
  if (!body.chapterId && !body.seriesId) {
    return NextResponse.json(
      { error: 'chapterId or seriesId is required' },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      userId,
      content,
      chapterId: body.chapterId ?? null,
      seriesId: body.seriesId ?? null,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { username: true, avatar: true } },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
