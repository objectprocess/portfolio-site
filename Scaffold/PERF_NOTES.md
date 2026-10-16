# Portfolio performance cleanup — local notes

Branch: `perf/optimization`  
No commits until owner approval.

## Round 1 (code / JS)

| Metric | Before | After |
|---|---:|---:|
| Entry JS | ~1424 KiB (~420 gzip) | ~452–458 KiB (~157–159 gzip) |
| 3D chunk | in entry | ~969 KiB lazy |

- Mobile skips Leslie Yang BG fetch; PNG thumbs; lazy 3D; `fs`/`path` removed; Weather `src/assets` dupes removed; hooks fix.

## Round 2 (weather / media / hygiene)

### Weather
- Unified `public/weather/index.html?mode=rain|snow` (single maintainable module).
- Rain now uses **one canvas** + 3 logical layers (same params as old 3-canvas).
- Snow particle budgets cut ~50%.
- Removed unused `snowfield.png` with old snow folder.
- BG assets: `assets/rain-bg.webp`, `assets/snow-bg.webp`.

### Media
- Grid BG: PNG ~1820KB → WebP ~177KB (q90). Originals in `.media-originals/` (gitignored).
- Rain/snow BGs → WebP (very compressible soft images — **please eyeball**).
- Many gallery JPEGs recompressed (mozjpeg q85) where savings ≥5%.
- Filmora MP4s: ~14.8/16.0 MB → ~7.1/7.6 MB (1280p, crf26). Other MP4s already efficient.

### App behavior
- Stopped eager preload of all 19 homepage thumbs (lazy `loading` remains).

### Netlify
- `netlify.toml`: long-cache `/assets/*`, week cache `/weather/*`, no-cache `index.html`.

### Hygiene
- Favicon: `/favicon.svg` (JG mark); removed Vite default use.
- `npm audit fix` → **0 vulnerabilities** reported.
- `CONTEXT AND PROTOTYPES/` removed from working tree; recoverable via branch `archive/context-and-prototypes`.

## How to preview

```bash
cd Scaffold
npm run build
npx vite preview --host 127.0.0.1 --port 4173
```

**Please QA especially:** desktop grid texture, rain scene, snow scene, filmora video playback, gallery stills that look “softer”.
