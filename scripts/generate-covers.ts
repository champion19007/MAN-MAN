/**
 * Generates a cover image per series into public/covers/<slug>.svg.
 *
 *   npx tsx scripts/generate-covers.ts
 *
 * Typographic covers rather than sourced artwork: real cover art belongs to the
 * publishers. These are ours, they are a few hundred bytes each, and they stay
 * crisp at any size.
 */
import fs from 'node:fs';
import path from 'node:path';
import { SERIES } from '../prisma/series-data';

const OUT = path.join(process.cwd(), 'public', 'covers');
const W = 400;
const H = 600;

const escape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** Greedy wrap so long titles break across lines instead of overflowing. */
function wrap(title: string, maxChars: number): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function cover(title: string, author: string, hues: [number, number]) {
  const [h1, h2] = hues;
  const lines = wrap(title.toUpperCase(), 11);

  // Fit the type to the box rather than assuming: a fixed size clips long
  // titles ("THE GOD OF HIGH SCHOOL") at the right edge. 0.62em is a workable
  // average advance width for uppercase serif caps.
  const inset = 34;
  const usable = W - inset * 2;
  const longest = Math.max(...lines.map((line) => line.length));
  const byWidth = usable / (longest * 0.62);
  const byCount = lines.length > 3 ? 40 : lines.length > 2 ? 46 : 54;
  const fontSize = Math.max(24, Math.min(byCount, byWidth));
  const blockHeight = lines.length * fontSize * 1.12;
  const startY = H / 2 - blockHeight / 2 + fontSize * 0.85;

  const text = lines
    .map(
      (line, i) =>
        `    <text x="34" y="${Math.round(startY + i * fontSize * 1.12)}" ` +
        `font-family="Georgia, 'Times New Roman', serif" font-size="${fontSize}" ` +
        `font-weight="700" fill="#ffffff" letter-spacing="-0.5">${escape(line)}</text>`,
    )
    .join('\n');

  // The XML declaration is required: Next's image optimiser sniffs content type
  // from the leading bytes and only recognises SVG when the file starts with
  // `<?xml`. Without it the optimiser reports "received null" and 400s.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escape(title)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${h1} 62% 26%)"/>
      <stop offset="55%" stop-color="hsl(${h2} 55% 15%)"/>
      <stop offset="100%" stop-color="hsl(${h2} 60% 8%)"/>
    </linearGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <circle cx="${W - 60}" cy="120" r="190" fill="hsl(${h1} 80% 60%)" opacity="0.12"/>
  <circle cx="40" cy="${H - 90}" r="150" fill="hsl(${h2} 80% 60%)" opacity="0.10"/>
  <path d="M0 ${H * 0.62} L${W} ${H * 0.44} L${W} ${H} L0 ${H} Z" fill="#000000" opacity="0.18"/>
  <rect width="${W}" height="${H}" fill="url(#v)"/>

${text}

  <rect x="34" y="${Math.round(startY + lines.length * fontSize * 1.12 - fontSize * 0.55)}" width="56" height="3" fill="hsl(${h1} 85% 65%)"/>
  <text x="34" y="${Math.round(startY + lines.length * fontSize * 1.12 + 26)}" font-family="Verdana, Geneva, sans-serif" font-size="15" fill="#ffffff" opacity="0.72">${escape(author)}</text>

  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none" stroke="#ffffff" stroke-opacity="0.16" rx="10"/>
</svg>
`;
}

fs.mkdirSync(OUT, { recursive: true });

for (const entry of SERIES) {
  const svg = cover(entry.title, entry.author, entry.hues);
  fs.writeFileSync(path.join(OUT, `${entry.slug}.svg`), svg, 'utf8');
}

console.log(`Wrote ${SERIES.length} covers to public/covers/`);
