/**
 * Points each series at real cover art once you have the files.
 *
 *   1. Drop images into public/covers/ named after the slug:
 *        public/covers/solo-leveling.jpg
 *        public/covers/tower-of-god.webp
 *   2. npm run covers:link
 *
 * Raster files win over the generated .svg placeholder, so the swap needs no
 * code change - only files. Series with no matching file keep their generated
 * cover, which means you can migrate a few titles at a time.
 *
 * Flags:
 *   --dry-run   report what would change, write nothing
 *   --publish   also switch on `published` for every series that got real art,
 *               so a launch can go out with whatever titles have landed and the
 *               rest stay invisible until their assets arrive
 */
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COVERS = path.join(process.cwd(), 'public', 'covers');
// Ordered by preference: modern formats first, generated placeholder last.
const EXTENSIONS = ['.avif', '.webp', '.jpg', '.jpeg', '.png', '.svg'];

const dryRun = process.argv.includes('--dry-run');
const publish = process.argv.includes('--publish');

function findCover(slug: string): { file: string; generated: boolean } | null {
  for (const ext of EXTENSIONS) {
    const file = path.join(COVERS, `${slug}${ext}`);
    if (fs.existsSync(file)) {
      return { file: `/covers/${slug}${ext}`, generated: ext === '.svg' };
    }
  }
  return null;
}

async function main() {
  if (!fs.existsSync(COVERS)) {
    console.error(`No public/covers directory. Run: npm run gen:covers`);
    process.exit(1);
  }

  const series = await prisma.series.findMany({
    select: { id: true, slug: true, title: true, coverImage: true, published: true },
    orderBy: { title: 'asc' },
  });

  if (series.length === 0) {
    console.error('No series in the database. Run: npm run db:seed');
    process.exit(1);
  }

  let linked = 0;
  let placeholder = 0;
  let missing = 0;
  let unchanged = 0;
  let publishedNow = 0;

  console.log('');
  for (const entry of series) {
    const found = findCover(entry.slug);

    if (!found) {
      missing++;
      console.log(`  ${'MISSING'.padEnd(9)} ${entry.title}`);
      console.log(`  ${''.padEnd(9)} expected public/covers/${entry.slug}.{jpg,png,webp,avif}`);
      continue;
    }

    // Only real artwork earns a publish; a generated placeholder never does.
    const shouldPublish = publish && !found.generated && !entry.published;
    const coverChanged = found.file !== entry.coverImage;

    if (!coverChanged && !shouldPublish) {
      unchanged++;
      if (found.generated) placeholder++;
      continue;
    }

    if (!dryRun) {
      await prisma.series.update({
        where: { id: entry.id },
        data: {
          ...(coverChanged ? { coverImage: found.file } : {}),
          ...(shouldPublish ? { published: true, publishedAt: new Date() } : {}),
        },
      });
    }

    if (shouldPublish) publishedNow++;

    if (found.generated) {
      placeholder++;
      console.log(`  ${'generated'.padEnd(9)} ${entry.title}`);
    } else {
      linked++;
      console.log(
        `  ${'LINKED'.padEnd(9)} ${entry.title}  ->  ${found.file}` +
          (shouldPublish ? '  [published]' : ''),
      );
    }
  }

  console.log('');
  console.log(`  ${linked} linked to real art, ${placeholder} on generated covers,`);
  console.log(`  ${unchanged} already correct, ${missing} with no file at all.`);
  if (publish) console.log(`  ${publishedNow} newly published.`);
  else if (linked > 0) console.log('  Re-run with --publish to make these live.');
  if (dryRun) console.log('\n  Dry run - nothing written.');
  console.log('');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
