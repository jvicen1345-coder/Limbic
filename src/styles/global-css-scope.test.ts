import { readFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const root = process.cwd();
const stylesDir = path.join(root, "src/styles");
const appDir = path.join(root, "src/app");

function readStyle(name: string): string {
  return readFileSync(path.join(stylesDir, name), "utf8");
}

function readApp(rel: string): string {
  return readFileSync(path.join(appDir, rel), "utf8");
}

function sheetImports(src: string): string[] {
  return [...src.matchAll(/import\s+["']@\/styles\/([\w.-]+\.css)["']/g)].map((m) => m[1]);
}

describe("global CSS payload (#162)", () => {
  it("root barrel does not import feature sheets", () => {
    const index = readStyle("index.css");
    assert.match(index, /@import "\.\/tokens\.css"/);
    assert.match(index, /@import "\.\/base\.css"/);
    assert.match(index, /@import "\.\/responsive-lg\.css"/);
    assert.doesNotMatch(index, /crossword|wellness|connexion|games\.css/);
  });

  it("landing/sign-in global sheets have no crossword, wellness, or connexion rules", () => {
    const globalCss = ["tokens.css", "base.css", "responsive-lg.css"].map(readStyle).join("\n");
    assert.doesNotMatch(globalCss, /\.crossword-/);
    assert.doesNotMatch(globalCss, /\.wellness-/);
    assert.doesNotMatch(globalCss, /\.connexion-/);
  });
});

describe("authenticated CSS payload (#465)", () => {
  it("app layout does not dump calendar, onboarding, or streaks on every signed-in page", () => {
    const sheets = sheetImports(readApp("(app)/layout.tsx"));
    assert.ok(sheets.includes("tour.css"), "tour.css stays with TourHost in the app layout");
    assert.ok(sheets.includes("shell.css"));
    assert.ok(!sheets.includes("calendar.css"));
    assert.ok(!sheets.includes("onboarding.css"));
    assert.ok(!sheets.includes("streaks.css"));
    assert.ok(!sheets.includes("pro.css"));
    assert.ok(!sheets.includes("playbooks.css"));
  });

  it("Home does not load article.css or nexus.css", () => {
    const sheets = sheetImports(readApp("(app)/home/layout.tsx"));
    assert.ok(!sheets.includes("article.css"));
    assert.ok(!sheets.includes("nexus.css"));
    assert.ok(sheets.includes("home.css"));
  });

  it("playbooks.css is not on the student hub layout", () => {
    const student = sheetImports(readApp("(app)/student/layout.tsx"));
    const playbooks = sheetImports(readApp("(app)/student/playbooks/layout.tsx"));
    assert.ok(!student.includes("playbooks.css"));
    assert.ok(playbooks.includes("playbooks.css"));
  });

  it("pro.css is not on the LimbicPRO parent layout or special-tests", () => {
    const pro = sheetImports(readApp("(app)/pro/layout.tsx"));
    const special = sheetImports(readApp("(app)/pro/special-tests/layout.tsx"));
    assert.ok(!pro.includes("pro.css"));
    assert.ok(!pro.includes("hep.css"));
    assert.ok(!pro.includes("metrics.css"));
    assert.ok(!pro.includes("research-tools.css"));
    assert.ok(!special.includes("pro.css"));
    assert.ok(special.includes("pro-special-tests.css"));
  });

  it("pro.css is not in the student or home layout graphs", () => {
    const student = sheetImports(readApp("(app)/student/layout.tsx"));
    const home = sheetImports(readApp("(app)/home/layout.tsx"));
    assert.ok(!student.includes("pro.css"));
    assert.ok(!home.includes("pro.css"));
  });
});
