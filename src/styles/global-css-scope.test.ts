import { readFileSync } from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

const stylesDir = path.join(process.cwd(), "src/styles");

function read(name: string): string {
  return readFileSync(path.join(stylesDir, name), "utf8");
}

describe("global CSS payload (#162)", () => {
  it("root barrel does not import feature sheets", () => {
    const index = read("index.css");
    assert.match(index, /@import "\.\/tokens\.css"/);
    assert.match(index, /@import "\.\/base\.css"/);
    assert.match(index, /@import "\.\/responsive-lg\.css"/);
    assert.doesNotMatch(index, /crossword|wellness|connexion|games\.css/);
  });

  it("landing/sign-in global sheets have no crossword, wellness, or connexion rules", () => {
    const globalCss = ["tokens.css", "base.css", "responsive-lg.css"].map(read).join("\n");
    assert.doesNotMatch(globalCss, /\.crossword-/);
    assert.doesNotMatch(globalCss, /\.wellness-/);
    assert.doesNotMatch(globalCss, /\.connexion-/);
  });
});
