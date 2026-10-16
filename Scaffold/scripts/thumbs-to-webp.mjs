/** Optional local script. Requires: npm i -D sharp */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('Missing sharp. Install with: npm i -D sharp');
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'src/assets/thumbnails');

for (const name of fs.readdirSync(dir)) {
  if (!name.toLowerCase().endsWith('.png')) continue;
  const src = path.join(dir, name);
  const out = path.join(dir, name.replace(/\.png$/i, '.webp'));
  await sharp(src).webp({ quality: 90, effort: 5 }).toFile(out);
  const before = fs.statSync(src).size;
  const after = fs.statSync(out).size;
  console.log(`${name}: ${(before / 1024).toFixed(1)}KB → ${(after / 1024).toFixed(1)}KB`);
  fs.unlinkSync(src);
}
