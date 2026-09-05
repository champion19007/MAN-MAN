/**
 * Generates placeholder chapter panels into public/panels/h<hue>-<layout>.svg.
 *
 *   npx tsx scripts/generate-panels.ts
 *
 * A small pool rather than one file per page: 6 hue families x 6 layouts is
 * enough variety for a long-strip reader while staying at ~40KB total. The seed
 * picks a hue by series and a layout by page, so a chapter reads as a sequence
 * instead of the same image repeated.
 *
 * These are stand-ins for real artwork. Replace the Page.imageUrl values with
 * your CDN URLs and this script becomes unnecessary.
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'public', 'panels');
const W = 800;
const H = 1200;

export const HUES = [222, 265, 190, 340, 30, 150];
export const LAYOUTS = 6;

/** Rounded speech-bubble outline with abstract "text" rules inside. */
function bubble(x: number, y: number, w: number, h: number, hue: number) {
  const lines = [0.62, 0.84, 0.5]
    .map(
      (frac, i) =>
        `<rect x="${x + 26}" y="${y + 34 + i * 26}" width="${Math.round(
          (w - 52) * frac,
        )}" height="9" rx="4.5" fill="hsl(${hue} 20% 92%)" opacity="0.75"/>`,
    )
    .join('');

  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(38, h / 2)}"
      fill="hsl(${hue} 22% 96%)" opacity="0.93"/>
    <path d="M${x + 44} ${y + h} L${x + 78} ${y + h} L${x + 52} ${y + h + 30} Z"
      fill="hsl(${hue} 22% 96%)" opacity="0.93"/>
    ${lines}
  </g>`;
}

function frame(x: number, y: number, w: number, h: number, hue: number, light: number) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6"
    fill="hsl(${hue} 45% ${light}%)" stroke="hsl(${hue} 30% 8%)" stroke-width="4"/>`;
}

function panel(hue: number, layout: number) {
  const body: string[] = [];

  if (layout === 0) {
    body.push(frame(40, 40, W - 80, H - 80, hue, 26));
    body.push(
      `<path d="M40 ${H * 0.62} L${W - 40} ${H * 0.38} L${W - 40} ${H - 40} L40 ${H - 40} Z" fill="hsl(${hue} 55% 14%)"/>`,
    );
    body.push(`<circle cx="${W * 0.68}" cy="${H * 0.3}" r="170" fill="hsl(${hue} 70% 60%)" opacity="0.16"/>`);
    body.push(bubble(84, 110, 380, 150, hue));
  } else if (layout === 1) {
    body.push(frame(40, 40, W - 80, H * 0.46, hue, 30));
    body.push(frame(40, H * 0.5, W - 80, H * 0.46 - 8, hue, 20));
    body.push(`<circle cx="${W * 0.34}" cy="${H * 0.26}" r="130" fill="hsl(${hue} 70% 62%)" opacity="0.2"/>`);
    body.push(bubble(W - 460, H * 0.56, 400, 132, hue));
  } else if (layout === 2) {
    for (let i = 0; i < 3; i++) {
      body.push(frame(40, 40 + i * (H - 60) / 3, W - 80, (H - 96) / 3, hue, 30 - i * 6));
    }
    body.push(bubble(90, 96, 340, 124, hue));
  } else if (layout === 3) {
    body.push(frame(40, 40, W - 80, H - 80, hue, 18));
    const rays = Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2;
      const cx = W / 2;
      const cy = H / 2;
      return `<path d="M${cx} ${cy} L${cx + Math.cos(a) * 620} ${cy + Math.sin(a) * 620} L${
        cx + Math.cos(a + 0.16) * 620
      } ${cy + Math.sin(a + 0.16) * 620} Z" fill="hsl(${hue} 70% 65%)" opacity="0.07"/>`;
    }).join('');
    body.push(rays);
    body.push(`<circle cx="${W / 2}" cy="${H / 2}" r="150" fill="hsl(${hue} 75% 62%)" opacity="0.3"/>`);
  } else if (layout === 4) {
    body.push(frame(40, 40, W - 80, H - 80, hue, 24));
    body.push(`<circle cx="${W * 0.3}" cy="${H * 0.72}" r="210" fill="hsl(${hue} 65% 58%)" opacity="0.16"/>`);
    body.push(bubble(W / 2 - 230, H * 0.34, 460, 168, hue));
  } else {
    body.push(frame(40, 40, (W - 96) / 2, H - 80, hue, 28));
    body.push(frame(W / 2 + 8, 40, (W - 96) / 2, H - 80, hue, 18));
    body.push(bubble(78, H * 0.16, 300, 130, hue));
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Comic panel">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 40% 12%)"/>
      <stop offset="100%" stop-color="hsl(${hue} 45% 6%)"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
${body.join('\n')}
</svg>
`;
}

fs.mkdirSync(OUT, { recursive: true });

let count = 0;
for (const hue of HUES) {
  for (let layout = 0; layout < LAYOUTS; layout++) {
    fs.writeFileSync(path.join(OUT, `h${hue}-${layout}.svg`), panel(hue, layout), 'utf8');
    count++;
  }
}

console.log(`Wrote ${count} panels to public/panels/`);
