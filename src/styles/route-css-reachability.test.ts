import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

/* Guards the other half of the CSS split (#452/#456): global-css-scope.test.ts proves the
 * root sheets stay small, and this proves the feature sheets are actually *reachable*.
 *
 * The split moved ~15k lines out of globals.css into per-feature sheets loaded from route
 * layouts. Nothing checked that a rule landed in a sheet the route rendering it loads, so
 * rules went missing in production without any test failing: the /pro/research-literacy
 * histogram kept its markup but lost `width`/`background` (invisible bars), /dmca, /privacy
 * and /terms imported no sheet at all, and `.top-loading-bar` sat in tour.css while the root
 * layout renders it on every route.
 *
 * For each page this walks the layout chain to collect the sheets that route actually loads,
 * walks the component import graph to collect the classes it can render, and fails when a
 * class is styled in some sheet the route never loads. A class no sheet defines is ignored —
 * that is unstyled-by-design markup, not a split regression. */

const ROOT = path.join(import.meta.dirname, "../..");
const APP_DIR = path.join(ROOT, "src/app");
const STYLES_DIR = path.join(ROOT, "src/styles");

/** Classes that resolve at runtime even though the static walk cannot see it. Keep this
 *  list short and always say why — a new entry is usually a real bug, not an exception. */
const ALLOWED: Record<string, string> = {
  // AppShell renders on every authenticated route but only adds this modifier when the
  // active route is an Atrium one, and those all load student.css.
  "app-root--atrium": "conditional in AppShell; only added on Atrium routes",
  // CollapsibleCard's title is deliberately unstyled by default. The only rule naming it is
  // wellness.css's visually-hidden override for the Exercise Library.
  "collapsible-card-title": "no default rule by design; only a wellness-scoped override",
};

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Every class name that appears in a selector in the given sheet. */
function classesInSheet(css: string): Set<string> {
  const out = new Set<string>();
  for (const match of stripComments(css).matchAll(/(^|[}])([^{}]+)\{/g)) {
    const selector = match[2];
    if (/^\s*@/.test(selector)) continue; // at-rule preludes carry no selectors of their own
    for (const cls of selector.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) out.add(cls[1]);
  }
  return out;
}

const SHEET_CLASSES = new Map<string, Set<string>>();
for (const file of readdirSync(STYLES_DIR)) {
  if (file.endsWith(".css")) {
    SHEET_CLASSES.set(file, classesInSheet(readFileSync(path.join(STYLES_DIR, file), "utf8")));
  }
}

/** Sheets the root layout pulls in, following globals.css -> index.css @imports. */
function rootSheets(): Set<string> {
  const sheets = new Set<string>();
  const queue = ["index.css"];
  const globals = path.join(APP_DIR, "globals.css");
  if (existsSync(globals)) {
    for (const m of readFileSync(globals, "utf8").matchAll(/@import\s+["'][^"']*\/([\w.-]+\.css)["']/g)) {
      queue.push(m[1]);
    }
  }
  while (queue.length) {
    const sheet = queue.pop()!;
    if (sheets.has(sheet)) continue;
    sheets.add(sheet);
    const p = path.join(STYLES_DIR, sheet);
    if (!existsSync(p)) continue;
    for (const m of readFileSync(p, "utf8").matchAll(/@import\s+["']\.\/([\w.-]+\.css)["']/g)) {
      queue.push(m[1]);
    }
  }
  return sheets;
}

function sheetImportsIn(file: string): string[] {
  if (!existsSync(file)) return [];
  const src = readFileSync(file, "utf8");
  return [...src.matchAll(/import\s+["']@\/styles\/([\w.-]+\.css)["']/g)].map((m) => m[1]);
}

/** Directories from src/app down to the page, i.e. the layouts that wrap it. */
function layoutChain(page: string): string[] {
  const dirs: string[] = [];
  let dir = path.dirname(page);
  for (;;) {
    dirs.push(dir);
    if (path.resolve(dir) === path.resolve(APP_DIR)) break;
    dir = path.dirname(dir);
  }
  return dirs.reverse();
}

function sheetsForPage(page: string): Set<string> {
  const sheets = rootSheets();
  for (const dir of layoutChain(page)) {
    for (const s of sheetImportsIn(path.join(dir, "layout.tsx"))) sheets.add(s);
  }
  for (const s of sheetImportsIn(page)) sheets.add(s);
  return sheets;
}

function resolveImport(spec: string, from: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = path.join(ROOT, "src", spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const c of [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`, base]) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

/** Every module a route can render, following imports from the page and its layouts. */
function componentTree(entries: string[]): Set<string> {
  const seen = new Set<string>();
  const stack = [...entries];
  while (stack.length) {
    const file = stack.pop();
    if (!file || seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    for (const m of readFileSync(file, "utf8").matchAll(/from\s+["']([^"']+)["']/g)) {
      const resolved = resolveImport(m[1], file);
      if (resolved && /\.tsx?$/.test(resolved)) stack.push(resolved);
    }
  }
  return seen;
}

/** Class names appearing in className strings, including template-literal branches. */
function classesUsedIn(files: Iterable<string>): Map<string, string> {
  const used = new Map<string, string>();
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    const literals: string[] = [];
    for (const m of src.matchAll(/className\s*=\s*\{?\s*[`"']([^`"']*)[`"']/g)) literals.push(m[1]);
    for (const m of src.matchAll(/className\s*=\s*\{([\s\S]{0,600}?)\}/g)) {
      for (const s of m[1].matchAll(/[`"']([^`"'${}]*)[`"']/g)) literals.push(s[1]);
    }
    for (const literal of literals) {
      for (const token of literal.split(/\s+/)) {
        if (!token || !/^-?[_a-zA-Z][\w-]*$/.test(token)) continue;
        if (!used.has(token)) used.set(token, path.relative(ROOT, file));
      }
    }
  }
  return used;
}

function allPages(): string[] {
  const pages: string[] = [];
  (function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name === "page.tsx") pages.push(p);
    }
  })(APP_DIR);
  return pages.sort();
}

describe("route CSS reachability", () => {
  it("every class a route can render is defined in a sheet that route loads", () => {
    const violations: string[] = [];

    for (const page of allPages()) {
      const route = path.relative(APP_DIR, page).replace(/\/page\.tsx$/, "") || "/";
      const sheets = sheetsForPage(page);

      const reachable = new Set<string>();
      for (const sheet of sheets) {
        for (const cls of SHEET_CLASSES.get(sheet) ?? []) reachable.add(cls);
      }

      const entries = [page];
      for (const dir of layoutChain(page)) {
        const layout = path.join(dir, "layout.tsx");
        if (existsSync(layout)) entries.push(layout);
      }

      for (const [cls, component] of classesUsedIn(componentTree(entries))) {
        if (reachable.has(cls) || cls in ALLOWED) continue;
        const homes = [...SHEET_CLASSES].filter(([, set]) => set.has(cls)).map(([f]) => f);
        if (!homes.length) continue; // unstyled by design, not a split regression
        violations.push(`  /${route}: .${cls} is defined in ${homes.join(", ")} but that route loads only [${[...sheets].sort().join(", ")}] (used by ${component})`);
      }
    }

    assert.deepEqual(
      violations,
      [],
      `${violations.length} class(es) render on a route whose sheets do not define them.\n` +
        `Move the rule into a sheet every consumer loads, or import that sheet from the route's layout (see docs/css.md).\n` +
        violations.join("\n"),
    );
  });
});
