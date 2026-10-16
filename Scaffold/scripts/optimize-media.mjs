/**
 * One-shot local media optimization (optional; not used in Netlify builds).
 * Requires: npm i -D sharp
 * Run: node scripts/optimize-media.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('Missing sharp. Install with: npm i -D sharp');
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const backupRoot = path.join(root, '.media-originals');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function backupOnce(absPath) {
  const rel = path.relative(root, absPath);
  const dest = path.join(backupRoot, rel);
  if (fs.existsSync(dest)) return;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(absPath, dest);
  console.log('backed up', rel);
}

async function toWebp(absPath, quality = 82) {
  backupOnce(absPath);
  const out = absPath.replace(/\.(png|jpe?g)$/i, '.webp');
  await sharp(absPath)
    .webp({ quality, effort: 4 })
    .toFile(out);
  const before = fs.statSync(absPath).size;
  const after = fs.statSync(out).size;
  console.log(
    `webp ${path.relative(root, absPath)} → ${path.relative(root, out)} ` +
      `${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`
  );
  return out;
}

async function recompressJpeg(absPath, quality = 85) {
  backupOnce(absPath);
  const tmp = absPath + '.tmp.jpg';
  await sharp(absPath).jpeg({ quality, mozjpeg: true }).toFile(tmp);
  const before = fs.statSync(absPath).size;
  const after = fs.statSync(tmp).size;
  if (after < before * 0.95) {
    fs.renameSync(tmp, absPath);
    console.log(
      `jpeg ${path.relative(root, absPath)} ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB`
    );
  } else {
    fs.unlinkSync(tmp);
    console.log(`jpeg skip (no savings) ${path.relative(root, absPath)}`);
  }
}

function findFfmpeg() {
  const which = spawnSync('where.exe', ['ffmpeg'], { encoding: 'utf8' });
  if (which.status === 0) {
    const line = which.stdout.split(/\r?\n/).find(Boolean);
    if (line) return line.trim();
  }
  const localApp = process.env.LOCALAPPDATA || '';
  const candidates = [
    path.join(localApp, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
    path.join(localApp, 'Microsoft', 'WinGet', 'Packages'),
  ];
  for (const c of candidates) {
    if (c.endsWith('ffmpeg.exe') && fs.existsSync(c)) return c;
  }
  // Search WinGet Packages for ffmpeg.exe
  const pkgRoot = path.join(localApp, 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(pkgRoot)) {
    const stack = [pkgRoot];
    while (stack.length) {
      const dir = stack.pop();
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isFile() && e.name.toLowerCase() === 'ffmpeg.exe') return p;
        if (e.isDirectory() && e.name.toLowerCase().includes('ffmpeg')) stack.push(p);
        else if (e.isDirectory() && e.name === 'bin') stack.push(p);
      }
    }
  }
  return null;
}

function reencodeMp4(absPath, ffmpeg) {
  backupOnce(absPath);
  const tmp = absPath.replace(/\.mp4$/i, '.opt.mp4');
  const args = [
    '-y',
    '-i',
    absPath,
    '-c:v',
    'libx264',
    '-crf',
    '23',
    '-preset',
    'medium',
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    '128k',
    '-movflags',
    '+faststart',
    tmp,
  ];
  const r = spawnSync(ffmpeg, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    console.error('ffmpeg failed', path.relative(root, absPath), r.stderr?.slice(-400));
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    return;
  }
  const before = fs.statSync(absPath).size;
  const after = fs.statSync(tmp).size;
  if (after < before * 0.95) {
    fs.renameSync(tmp, absPath);
    console.log(
      `mp4 ${path.relative(root, absPath)} ${(before / 1024 / 1024).toFixed(2)}MB → ${(after / 1024 / 1024).toFixed(2)}MB`
    );
  } else {
    fs.unlinkSync(tmp);
    console.log(`mp4 skip (no savings) ${path.relative(root, absPath)}`);
  }
}

function walk(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((x) => e.name.toLowerCase().endsWith(x))) out.push(p);
  }
  return out;
}

const leslie =
  'src/assets/BG Images/leslieyang_fully_defocused_natural_color_field_glowing_yellow_28df0a8d-da9e-4464-86ac-103780be7ae8_0.png';

async function main() {
  ensureDir(backupRoot);

  // Hero / weather backgrounds → WebP
  await toWebp(path.join(root, leslie), 80);
  await toWebp(path.join(root, 'public/weather/assets/rain-bg.png'), 80);
  await toWebp(path.join(root, 'public/weather/assets/snow-bg.jpg'), 82);

  // Large project gallery JPEGs (skip tiny / already small)
  const jpgs = walk(path.join(root, 'src/data/projects'), ['.jpg', '.jpeg']);
  for (const p of jpgs) {
    if (fs.statSync(p).size < 200 * 1024) continue;
    await recompressJpeg(p, 85);
  }

  const ffmpeg = findFfmpeg();
  if (!ffmpeg) {
    console.warn('ffmpeg not found — skipping video re-encode');
  } else {
    console.log('using ffmpeg', ffmpeg);
    const mp4s = walk(path.join(root, 'src/data/projects'), ['.mp4']);
    for (const p of mp4s) reencodeMp4(p, ffmpeg);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
