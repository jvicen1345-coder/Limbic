import { chromium } from 'playwright-core';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'shots');
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:3000';

const ROUTES = [
  ['landing', '/'],
  ['home', '/home'],
  ['agent', '/agent'],
  ['pro', '/pro/toolbox'],
  ['boards', '/boards'],
  ['nexus', '/nexus'],
  ['search', '/search'],
  ['news', '/news'],
  ['wellness', '/wellness'],
  ['games', '/games'],
  ['clips', '/clips'],
  ['hep', '/hep'],
  ['atlas', '/atlas'],
  ['student', '/student'],
];

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const ctx = await browser.newContext({
  viewport: { width: 402, height: 874 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await ctx.newPage();

// sign up
await page.goto(BASE + '/sign-in', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
const email = 'demo@limbic.center';
async function submitAuth() {
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', 'TeaserDemo!2026');
  const conf = page.locator('input[name="confirmPassword"]');
  if (await conf.count()) await conf.fill('TeaserDemo!2026');
  const terms = page.locator('input[type="checkbox"]');
  for (let i = 0; i < await terms.count(); i++) { try { await terms.nth(i).check(); } catch {} }
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
}
try {
  await submitAuth();
  if (page.url().includes('error=invalid_credentials')) {
    const toSignup = page.getByRole('button', { name: /create an account/i });
    if (await toSignup.count()) { await toSignup.first().click(); await page.waitForTimeout(800); }
    await submitAuth();
  }
} catch (e) { console.log('auth issue:', e.message); }

// onboarding: name
if (page.url().includes('/onboarding/name')) {
  await page.fill('input[name="firstName"]', 'Delia');
  await page.fill('input[name="lastName"]', 'Vicencio');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}
// onboarding: topics
if (page.url().includes('/onboarding')) {
  const chips = page.locator('form button, .tag, button');
  const n = Math.min(await chips.count(), 8);
  for (let i = 0; i < n; i++) {
    const txt = (await chips.nth(i).innerText().catch(() => '')) || '';
    if (/continue to limbic|skip for now/i.test(txt)) continue;
    try { await chips.nth(i).click({ timeout: 1000 }); await page.waitForTimeout(300); } catch {}
  }
  const go = page.getByRole('button', { name: /continue to limbic/i });
  if (await go.count()) { await go.first().click(); await page.waitForTimeout(4000); }
}

// role picker modal ("How are you using Limbic?")
async function dismissRolePicker() {
  for (let pass = 0; pass < 2; pass++) {
    const heading = page.getByText(/How are you using Limbic\?/i);
    if (!(await heading.count())) return;
    const pt = page.getByText('Physical Therapist', { exact: true });
    if (await pt.count()) { try { await pt.first().click({ timeout: 2000 }); } catch {} }
    await page.waitForTimeout(400);
    const cont = page.getByRole('button', { name: /^continue$/i });
    if (await cont.count()) { try { await cont.first().click({ timeout: 2000 }); } catch {} }
    await page.waitForTimeout(2500);
  }
}
async function dismissOverlays() {
  await dismissRolePicker();
  for (let i = 0; i < 4; i++) {
    const skip = page.getByRole('button', { name: /skip tour|skip for now|got it|dismiss/i });
    if (await skip.count()) { try { await skip.first().click({ timeout: 1500 }); await page.waitForTimeout(900); continue; } catch {} }
    break;
  }
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(400);
}
await dismissOverlays();
console.log('after auth url:', page.url());

for (const [name, route] of ROUTES) {
  try {
    await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3500);
    await dismissOverlays();
    await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log(name, '->', page.url());
  } catch (e) { console.log('FAIL', name, e.message); }
}
await browser.close();
