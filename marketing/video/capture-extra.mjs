/** The four screens that only look right at a particular scroll offset or tab, which the
 *  plain route sweep in capture.mjs can't produce:
 *
 *   feed         /home, Research tab, scrolled onto an actual study card
 *   playbook     the Shoulder Examination playbook's title page
 *   movementlab  /hep with the Movement Lab tab selected
 *   wellness2    Limbic Metrics' "personalize your tracking" form
 *
 *  The scroller here is `main.app-main`, not the window — window.scrollTo() silently does
 *  nothing on these pages, so scrollTop is set on that element directly.
 */
import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'shots');
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE || 'http://localhost:3000';

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const ctx = await browser.newContext({
  viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
});
const page = await ctx.newPage();

await page.goto(BASE + '/sign-in', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1800);
await page.fill('input[name="email"]', 'demo@limbic.center');
await page.fill('input[name="password"]', 'TeaserDemo!2026');
await page.click('button[type="submit"]');
await page.waitForTimeout(4500);

/** Role picker, welcome tour, and the dev-overlay badge all sit on top of the screens. */
async function clean() {
  for (let i = 0; i < 5; i++) {
    const b = page.getByRole('button', { name: /skip tour|^continue$|got it|dismiss/i });
    if (await b.count()) { try { await b.first().click({ timeout: 1500 }); await page.waitForTimeout(900); continue; } catch {} }
    break;
  }
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
}
await clean();

async function scrollTo(y) {
  const el = await page.evaluateHandle(() => document.querySelector('main.app-main'));
  await page.evaluate(({ el, y }) => { if (el) el.scrollTop = y; }, { el, y });
  await page.waitForTimeout(1200);
}

async function shot(name, route, after) {
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  await clean();
  if (after) await after();
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log(name, '->', page.url());
}

await shot('feed', '/home', async () => {
  const tab = page.getByRole('tab', { name: /^research$/i }).or(page.getByText('Research', { exact: true }));
  if (await tab.count()) { try { await tab.first().click({ timeout: 2500 }); await page.waitForTimeout(3000); } catch {} }
  // Far enough in to clear the first two cards, which the specialty classifier
  // currently mislabels (see the note at the end of captions.md).
  await scrollTo(2300);
});
await shot('playbook', '/student/guides/shoulder-examination');
await shot('movementlab', '/hep?tab=movement-lab', async () => {
  const t = page.getByText('Movement Lab', { exact: true });
  if (await t.count()) { try { await t.first().click({ timeout: 2500 }); await page.waitForTimeout(2500); } catch {} }
});
await shot('wellness2', '/wellness/metrics');

await browser.close();
