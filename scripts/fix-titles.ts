import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(import.meta.dirname, '..', 'src', 'content', 'collections');

function fixTitle(raw: string): string {
  let t = raw.trim();

  // Remove file extensions
  t = t.replace(/\.(png|jpg|jpeg|webp|tif|tiff)$/i, '');

  // Remove "copy" suffix
  t = t.replace(/\s+copy$/i, '');

  // Fix known typos
  t = t.replace(/Minerak/g, 'Mineral');
  t = t.replace(/Minereal/g, 'Mineral');

  // Collapse double spaces
  t = t.replace(/\s{2,}/g, ' ');

  // Replace underscores with spaces
  t = t.replace(/_/g, ' ');

  // Skip camera IDs — clear them so they don't show as titles
  if (/^DSC \d+$/i.test(t) || /^DSCN\d+$/i.test(t) || /^IMG \d+$/i.test(t)) {
    return '';
  }

  // Skip bare numbers
  if (/^\d+$/.test(t)) {
    return '';
  }

  // Skip "Untitled-N" patterns
  if (/^Untitled-?\d*$/i.test(t)) {
    return '';
  }

  // Skip short codes like "M16", "M17", "WT1"
  if (/^[A-Z]{1,3}\d+$/.test(t)) {
    return '';
  }

  // Convert ALL CAPS to title case (3+ chars, not an abbreviation)
  if (t === t.toUpperCase() && t.length > 3) {
    t = t
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Fix specific patterns
  t = t.replace(/^Mask (\w+) (\d+)$/, 'Mask $1-$2');
  t = t.replace(/^Sea Shells E/i, 'Sea Shell ');
  t = t.replace(/^Mineral E/i, 'Mineral ');
  t = t.replace(/^Fossil (\d+)/, 'Fossil $1');
  t = t.replace(/^Photograph (\d+)/, 'Photograph $1');
  t = t.replace(/^Wooden God(\d+)/, 'Wooden God $1');
  t = t.replace(/^Wooden God (\d+)/, 'Wooden God $1');

  return t.trim();
}

let totalFixed = 0;

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.md'))) {
  const path = join(DIR, file);
  let content = readFileSync(path, 'utf-8');
  let changed = false;

  content = content.replace(/    title: "(.+?)"/g, (match, title) => {
    const fixed = fixTitle(title);
    if (fixed !== title) {
      changed = true;
      totalFixed++;
      return `    title: "${fixed}"`;
    }
    return match;
  });

  if (changed) {
    writeFileSync(path, content, 'utf-8');
    console.log(`  fixed titles in ${file}`);
  }
}

console.log(`\nFixed ${totalFixed} titles.`);
