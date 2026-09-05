import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Feeds the reader's infinite scroll: one chapter with its ordered pages. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const number = Number(searchParams.get('number'));

  if (!slug || !Number.isFinite(number)) {
    return NextResponse.json({ error: 'slug and number are required' }, { status: 400 });
  }

  const chapter = await prisma.chapter.findFirst({
    where: { number, series: { slug, published: true } },
    select: {
      id: true,
      number: true,
      title: true,
      pages: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          imageUrl: true,
          order: true,
          width: true,
          height: true,
          blurData: true,
        },
      },
    },
  });

  if (!chapter) {
    return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
  }

  return NextResponse.json(chapter, {
    headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=300' },
  });
}
