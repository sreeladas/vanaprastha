import { mkdirSync, readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const GOOGLE_DRIVE = '/home/sreela/VANAPRASTHA GOOGLE DRIVE';
const EDITED_DIR = join(GOOGLE_DRIVE, 'EDITIED IMAGES');
const RAW_DIR = join(GOOGLE_DRIVE, 'RAW IMAGES');
const OUTPUT_DIR = join(import.meta.dirname, '..', '.images-staging', 'collections');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

interface FolderMapping {
  slug: string;
  edited: string[];
  raw: string[];
}

const MAPPINGS: FolderMapping[] = [
  { slug: 'auli-mascots', edited: ['auli mascot'], raw: ['AULI MASCOT'] },
  { slug: 'nekchand-sculptures', edited: [], raw: ['NEKCHAND STATUES'] },
  { slug: 'paintings', edited: ['PAINITNG'], raw: ['Paintings Final'] },
  { slug: 'bollywood-posters', edited: ['Bollywood Poster'], raw: ['BOLLYWOOD POSTER FINAL'] },
  { slug: 'crockery-set', edited: [], raw: ['CROCKERY SET'] },
  { slug: 'traditional-textiles', edited: [], raw: ['TRADITIONAL BED SHEETS'] },
  { slug: 'wooden-toys', edited: ['WOODEN TOY EDIT'], raw: ['WOODEN TOYS'] },
  { slug: 'masks', edited: ['MASKS'], raw: ['MASK FINAL'] },
  { slug: 'dokra-chola-crafts', edited: ['DOKRA AND CHOLA COLLECTION EDITED'], raw: ['DOKHRA METAL CRAFT'] },
  {
    slug: 'seaforms-minerals-fossils',
    edited: ['SEA SHELLS EIDT', 'Sea Shells open mouth', 'MINERALS', 'FOSSIL'],
    raw: ['SEA SHELLS', 'FOSSILS'],
  },
  { slug: 'photographs', edited: ['PHOTOGRAPHS EDIT'], raw: ['PHOTOGRAPHS FINAL'] },
  { slug: 'wooden-gods-sculpture', edited: ['WOODEN GOD SCULPTURE'], raw: ['WOODEN GOD AND METAL STATUE GOD 2'] },
  { slug: 'floor-tiles', edited: [], raw: [] },
  { slug: 'tehri-pillars', edited: [], raw: ['TEHRI PILLAR AND WOODEN VASE'] },
  { slug: 'wooden-vessels', edited: [], raw: ['WOODEN VASE FINAL'] },
  { slug: 'butterflies', edited: ['BUTTERFLIES'], raw: ['BUTTERFLY'] },
];

function collectImages(baseDir: string, folderNames: string[]): string[] {
  const files: string[] = [];
  for (const folder of folderNames) {
    const dirPath = join(baseDir, folder);
    try {
      gatherFiles(dirPath, files);
    } catch {
      console.warn(`  folder not found: ${dirPath}`);
    }
  }
  return files;
}

function gatherFiles(dir: string, out: string[]) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      gatherFiles(fullPath, out);
    } else if (IMAGE_EXTS.has(extname(entry).toLowerCase())) {
      out.push(fullPath);
    }
  }
}

function slugify(filename: string): string {
  const name = basename(filename, extname(filename));
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function processCollection(mapping: FolderMapping) {
  const outDir = join(OUTPUT_DIR, mapping.slug);
  mkdirSync(outDir, { recursive: true });

  let sourceFiles = collectImages(EDITED_DIR, mapping.edited);
  if (sourceFiles.length === 0) {
    sourceFiles = collectImages(RAW_DIR, mapping.raw);
  }

  if (sourceFiles.length === 0) {
    console.log(`  ${mapping.slug}: no images found, skipping`);
    return [];
  }

  console.log(`  ${mapping.slug}: processing ${sourceFiles.length} images...`);

  const items: { filename: string; title: string }[] = [];
  const seenNames = new Set<string>();

  for (const src of sourceFiles) {
    let slug = slugify(src);
    if (seenNames.has(slug)) {
      let i = 2;
      while (seenNames.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
    seenNames.add(slug);

    const outFile = `${slug}.webp`;
    const outPath = join(outDir, outFile);

    try {
      await sharp(src)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outPath);

      items.push({ filename: outFile, title: basename(src, extname(src)) });
    } catch (e) {
      console.warn(`    failed: ${basename(src)} — ${e}`);
    }
  }

  return items;
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('Importing images from Google Drive...\n');

  const contentDir = join(import.meta.dirname, '..', 'src', 'content', 'collections');

  for (const mapping of MAPPINGS) {
    const items = await processCollection(mapping);

    if (items.length > 0) {
      const mdPath = join(contentDir, `${mapping.slug}.md`);
      try {
        const existing = readFileSync(mdPath, 'utf-8');
        const fmEnd = existing.indexOf('---', 3);
        const frontmatter = existing.slice(0, fmEnd);
        const body = existing.slice(fmEnd + 3).trim();

        const itemsYaml = items
          .map((item) => `  - filename: "${item.filename}"\n    title: "${item.title.replace(/"/g, '\\"')}"`)
          .join('\n');

        const heroImage = items[0].filename;
        const newFm = frontmatter.replace(/items:.*$/m, `items:\n${itemsYaml}`).replace(
          /heroImage:.*$/m,
          `heroImage: "${heroImage}"`,
        );

        const hasFmHero = newFm.includes('heroImage:');
        const finalFm = hasFmHero
          ? newFm
          : newFm.trimEnd() + `\nheroImage: "${heroImage}"\n`;

        writeFileSync(mdPath, `${finalFm}---\n\n${body}\n`, 'utf-8');
        console.log(`    updated ${mapping.slug}.md with ${items.length} items\n`);
      } catch {
        console.warn(`    could not update ${mapping.slug}.md\n`);
      }
    }
  }

  console.log('Done.');
}

main();
