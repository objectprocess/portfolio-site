import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backup = path.join(root, '.media-originals');

const jobs = [
  [
    'src/assets/BG Images/leslieyang_fully_defocused_natural_color_field_glowing_yellow_28df0a8d-da9e-4464-86ac-103780be7ae8_0.png',
    'src/assets/BG Images/leslieyang_fully_defocused_natural_color_field_glowing_yellow_28df0a8d-da9e-4464-86ac-103780be7ae8_0.webp',
    90,
  ],
  ['public/weather/assets/rain-bg.png', 'public/weather/assets/rain-bg.webp', 90],
  ['public/weather/assets/snow-bg.jpg', 'public/weather/assets/snow-bg.webp', 90],
];

for (const [relSrc, relOut, q] of jobs) {
  const backed = path.join(backup, ...relSrc.split('/'));
  const input = fs.existsSync(backed) ? backed : path.join(root, ...relSrc.split('/'));
  const out = path.join(root, ...relOut.split('/'));
  const tmp = out + '.tmp';
  await sharp(input).webp({ quality: q, effort: 5 }).toFile(tmp);
  fs.renameSync(tmp, out);
  console.log(
    `${relOut}: ${(fs.statSync(input).size / 1024).toFixed(0)}KB → ${(fs.statSync(out).size / 1024).toFixed(0)}KB @q${q}`
  );
}
