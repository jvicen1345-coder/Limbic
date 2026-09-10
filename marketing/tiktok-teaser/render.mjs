import { chromium } from 'playwright-core';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const SC = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(SC, '../..');

/** The app's own Plus Jakarta Sans, as next/font already downloaded it into .next — used
 *  as a data: URL rather than a committed font binary, so the teaser's type always matches
 *  whatever the app is actually shipping (and no font file lives in this repo). Falls back
 *  to the system sans stack if .next hasn't been built/run yet. */
function jakartaDataUrl() {
  const media = path.join(REPO, '.next/dev/static/media');
  const alt = path.join(REPO, '.next/static/media');
  for (const dir of [media, alt]) {
    if (!fs.existsSync(dir)) continue;
    // the preloaded latin subset is the one marked "-s.p." by next/font
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.woff2'));
    const pick = files.find(f => f.includes('-s.p.')) || files[0];
    if (pick) return 'data:font/woff2;base64,' + fs.readFileSync(path.join(dir, pick)).toString('base64');
  }
  console.warn('[teaser] Plus Jakarta Sans not found under .next — run `npm run dev` once; falling back to system sans.');
  return null;
}
const FPS = Number(process.env.FPS || 30);
const OUT = process.env.OUT || path.join(SC, 'limbic-teaser.mp4');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const PREVIEW = process.env.PREVIEW ? process.env.PREVIEW.split(',').map(Number) : null;
/** Frames go through the pipe as JPEG, not PNG. Chromium's PNG encoder is the entire
 *  bottleneck in this pipeline — measured on this page at 1080x1920, PNG costs ~780ms per
 *  frame against ~110ms for JPEG q96, i.e. 21 minutes versus 3 for a full render. The
 *  quality cost is nil in practice: H.264's 4:2:0 chroma subsampling at crf 19 discards
 *  more than JPEG q96 does. Set FRAMES=png if you ever need a lossless intermediate. */
const LOSSLESS = process.env.FRAMES === 'png';
/** crf 22 rather than 19: this footage is mostly static UI under slow pans, TikTok
 *  re-encodes everything on upload anyway, and 19 put a 55s cut at 25MB — most of which
 *  would have been bitrate nobody ever sees. Override with CRF=19 for a master copy. */
const CRF = process.env.CRF || '22';

const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--disable-lcd-text'],
});
const ctx = await browser.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto('file://' + path.join(SC, 'teaser.html'), { waitUntil: 'load' });
const font = jakartaDataUrl();
if (font) await page.addStyleTag({ content:
  `@font-face{font-family:'Jakarta';src:url('${font}') format('woff2');font-weight:200 800;font-display:block}` });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : i.decode().catch(() => 1))));
await page.waitForTimeout(1200);
const DUR = await page.evaluate(() => window.__DUR);

if (PREVIEW) {
  for (const t of PREVIEW) {
    await page.evaluate(x => window.__render(x), t);
    await page.waitForTimeout(90);
    await page.screenshot({ path: `${SC}/prev_${String(t).replace('.', '_')}.png` });
  }
  console.log('preview frames done');
  await browser.close();
  process.exit(0);
}

const total = Math.round(DUR * FPS);
const ff = spawn(FFMPEG, [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', LOSSLESS ? 'png' : 'mjpeg', '-i', '-',
  '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
  '-map', '0:v', '-map', '1:a', '-shortest',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', CRF,
  '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.2',
  '-x264-params', 'keyint=60:min-keyint=30',
  '-c:a', 'aac', '-b:a', '96k',
  '-movflags', '+faststart', OUT,
]);
ff.stderr.on('data', d => process.stderr.write(d));

const write = buf => new Promise(res => { if (ff.stdin.write(buf)) res(); else ff.stdin.once('drain', res); });

for (let i = 0; i < total; i++) {
  const t = i / FPS;
  await page.evaluate(x => window.__render(x), t);
  const buf = await page.screenshot(LOSSLESS ? { type: 'png' } : { type: 'jpeg', quality: 96 });
  await write(buf);
  if (i % 60 === 0) console.log(`frame ${i}/${total} (${t.toFixed(1)}s)`);
}
ff.stdin.end();
await new Promise(res => ff.on('close', res));
await browser.close();
console.log('encoded ->', OUT);
