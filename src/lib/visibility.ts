import type { Prisma } from '@prisma/client';

/**
 * Every public-facing query filters on this. A series stays invisible - to
 * browse, search, rankings, the home page and its own detail route - until it
 * is explicitly published, so titles can be staged in the database while rights
 * or artwork are still pending.
 *
 * A reader's own library is deliberately exempt: if something they bookmarked
 * is unpublished it simply stops appearing in public listings.
 */
export const PUBLIC_SERIES = { published: true } as const;

export const publicSeriesWhere = (
  extra: Prisma.SeriesWhereInput = {},
): Prisma.SeriesWhereInput => ({ ...PUBLIC_SERIES, ...extra });
