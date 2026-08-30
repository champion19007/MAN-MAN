export function timeAgo(date: Date | string) {
  const then = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);

  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [604800, 'day'],
    [2629800, 'week'],
    [31557600, 'month'],
    [Infinity, 'year'],
  ];

  const divisors = [1, 60, 3600, 86400, 604800, 2629800, 31557600];
  for (let i = 0; i < units.length; i++) {
    if (seconds < units[i][0]) {
      const value = Math.floor(seconds / divisors[i]);
      return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        -value,
        units[i][1],
      );
    }
  }
  return 'just now';
}

export function chapterLabel(number: number, title?: string | null) {
  const n = Number.isInteger(number) ? number.toString() : number.toString();
  return title ? `Ch. ${n} — ${title}` : `Chapter ${n}`;
}

export function formatViews(views: number) {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return `${views}`;
}

export const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Isekai',
  'Martial Arts',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Thriller',
] as const;
