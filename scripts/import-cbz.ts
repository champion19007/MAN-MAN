/**
 * Import a folder of .cbz archives (or folders of images) as a series.
 *
 *   npx tsx scripts/import-cbz.ts --dir "path/to/Series Name" --dry-run
 *   npx tsx scripts/import-cbz.ts --dir "path/to/Series Name" --limit 3
 *
 * Writes page images under public/manga/<slug>/ and creates the matching
 * Series / Chapter / Page rows. Re-running skips chapters that already exist
 * unless --force is passed, so an interrupted import can just be resumed.
 */
import AdmZip from 'adm-zip';
import { imageSize } from 'image-size';
import { PrismaClient, SeriesStatus } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient();

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);

// ---------------------------------------------------------------- arguments
function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

function str(key: string, fallback?: string) {
  const value = args[key];
  return typeof value === 'string' ? value : fallback;
}

const sourceDir = str('dir');
if (!sourceDir) {
  console.error(
    'Usage: npx tsx scripts/import-cbz.ts --dir "<folder>" [--title T] [--slug S]\n' +
      '                                    [--limit N] [--dry-run] [--force]',
  );
  process.exit(1);
}
if (!fs.existsSync(sourceDir)) {
  console.error(`No such folder: ${sourceDir}`);
  process.exit(1);
}

const dryRun = Boolean(args['dry-run']);
const force = Boolean(args.force);
const limit = Number(str('limit', '')) || Infinity;

const title = str('title', path.basename(sourceDir))!;
const slug =
  str('slug') ??
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const outRoot = path.join(process.cwd(), 'public', 'manga', slug);

// ------------------------------------------------------------------ helpers
/** "Chapter 100.0" must sort after "Chapter 11.0", not between 10 and 11. */
const naturalCompare = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

function chapterNumberFrom(name: string): number | null {
  const match = name.match(/chapter[\s._-]*(\d+(?:\.\d+)?)/i) ?? name.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

type SourceChapter = { number: number; label: string; read: () => PageBuffer[] };
type PageBuffer = { name: string; data: Buffer };

function readArchive(file: string): PageBuffer[] {
  const zip = new AdmZip(file);
  return zip
    .getEntries()
    .filter((e) => !e.isDirectory && IMAGE_EXT.has(path.extname(e.entryName).toLowerCase()))
    .sort((a, b) => naturalCompare(a.entryName, b.entryName))
    .map((e) => ({ name: e.entryName, data: e.getData() }));
}

function readFolder(dir: string): PageBuffer[] {
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort(naturalCompare)
    .map((f) => ({ name: f, data: fs.readFileSync(path.join(dir, f)) }));
}

/** Prefer .cbz archives; fall back to already-extracted chapter folders. */
function collectChapters(dir: string): SourceChapter[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const archives = entries
    .filter((e) => e.isFile() && path.extname(e.name).toLowerCase() === '.cbz')
    .map((e) => {
      const number = chapterNumberFrom(e.name);
      const full = path.join(dir, e.name);
      return number === null
        ? null
        : { number, label: e.name, read: () => readArchive(full) };
    })
    .filter((c): c is SourceChapter => c !== null);

  if (archives.length > 0) return archives.sort((a, b) => a.number - b.number);

  return entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const number = chapterNumberFrom(e.name);
      const full = path.join(dir, e.name);
      return number === null
        ? null
        : { number, label: e.name, read: () => readFolder(full) };
    })
    .filter((c): c is SourceChapter => c !== null)
    .sort((a, b) => a.number - b.number);
}

// --------------------------------------------------------------------- main
async function main() {
  const chapters = collectChapters(sourceDir!);

  if (chapters.length === 0) {
    console.error(`Found no .cbz files or chapter folders in ${sourceDir}`);
    process.exit(1);
  }

  const selected = chapters.slice(0, limit === Infinity ? undefined : limit);

  console.log(`\n  ${title}  (slug: ${slug})`);
  console.log(`  ${chapters.length} chapters found, importing ${selected.length}`);
  console.log(`  Source: ${sourceDir}`);
  console.log(`  Output: public/manga/${slug}/\n`);

  if (dryRun) {
    for (const chapter of selected.slice(0, 10)) {
      const pages = chapter.read();
      console.log(
        `    Chapter ${chapter.number}`.padEnd(24) +
          `${pages.length} pages   ${chapter.label}`,
      );
    }
    if (selected.length > 10) console.log(`    ... and ${selected.length - 10} more`);
    console.log('\n  Dry run - nothing written. Drop --dry-run to import.\n');
    return;
  }

  const series = await prisma.series.upsert({
    where: { slug },
    create: {
      slug,
      title,
      description: str('description', `${title}. Imported from a local library.`)!,
      coverImage: '',
      author: str('author', 'Unknown')!,
      artist: str('artist', 'Unknown')!,
      genres: (str('genres', '') || '').split(',').map((g) => g.trim()).filter(Boolean),
      status: (str('status', 'ONGOING') as SeriesStatus) ?? SeriesStatus.ONGOING,
      rating: Number(str('rating', '0')) || 0,
    },
    update: { title },
  });

  const existing = new Set(
    (
      await prisma.chapter.findMany({
        where: { seriesId: series.id },
        select: { number: true },
      })
    ).map((c) => c.number),
  );

  let coverUrl = series.coverImage;
  let imported = 0;

  for (const chapter of selected) {
    if (existing.has(chapter.number) && !force) {
      console.log(`    Chapter ${chapter.number} - already imported, skipping`);
      continue;
    }

    const pages = chapter.read();
    if (pages.length === 0) {
      console.log(`    Chapter ${chapter.number} - no images inside, skipping`);
      continue;
    }

    const chapterDir = path.join(outRoot, String(chapter.number));
    fs.mkdirSync(chapterDir, { recursive: true });

    const pageRows: {
      imageUrl: string;
      order: number;
      width: number | null;
      height: number | null;
    }[] = [];

    pages.forEach((page, index) => {
      const ext = path.extname(page.name).toLowerCase();
      const fileName = `${String(index + 1).padStart(3, '0')}${ext}`;
      fs.writeFileSync(path.join(chapterDir, fileName), page.data);

      let width: number | null = null;
      let height: number | null = null;
      try {
        const size = imageSize(page.data);
        width = size.width ?? null;
        height = size.height ?? null;
      } catch {
        // Unreadable header: the reader falls back to its default aspect box.
      }

      pageRows.push({
        imageUrl: `/manga/${slug}/${chapter.number}/${fileName}`,
        order: index + 1,
        width,
        height,
      });
    });

    if (force) {
      await prisma.chapter.deleteMany({
        where: { seriesId: series.id, number: chapter.number },
      });
    }

    await prisma.chapter.create({
      data: {
        seriesId: series.id,
        number: chapter.number,
        releaseDate: new Date(),
        pages: { create: pageRows },
      },
    });

    if (!coverUrl) coverUrl = pageRows[0].imageUrl;
    imported++;
    console.log(`    Chapter ${chapter.number}`.padEnd(24) + `${pageRows.length} pages`);
  }

  if (coverUrl && coverUrl !== series.coverImage) {
    await prisma.series.update({
      where: { id: series.id },
      data: { coverImage: coverUrl },
    });
  }

  await prisma.series.update({ where: { id: series.id }, data: { updatedAt: new Date() } });

  const total = await prisma.chapter.count({ where: { seriesId: series.id } });
  console.log(`\n  Imported ${imported} chapters. ${total} total for this series.`);
  console.log(`  Read it at /series/${slug}\n`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
