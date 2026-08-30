import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function readSeriesId(request: Request) {
  try {
    const body = (await request.json()) as { seriesId?: string };
    return body.seriesId ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const seriesId = await readSeriesId(request);
  if (!seriesId) {
    return NextResponse.json({ error: 'seriesId is required' }, { status: 400 });
  }

  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    select: { id: true },
  });
  if (!series) return NextResponse.json({ error: 'Series not found' }, { status: 404 });

  const bookmark = await prisma.bookmark.upsert({
    where: { userId_seriesId: { userId, seriesId } },
    create: { userId, seriesId },
    update: {},
  });

  return NextResponse.json({ ok: true, bookmark });
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const seriesId = await readSeriesId(request);
  if (!seriesId) {
    return NextResponse.json({ error: 'seriesId is required' }, { status: 400 });
  }

  await prisma.bookmark.deleteMany({ where: { userId, seriesId } });
  return NextResponse.json({ ok: true });
}
