import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const stylesDir = path.join(process.cwd(), "src/styles");

function read(name: string): string {
  return readFileSync(path.join(stylesDir, name), "utf8");
}

describe("global CSS payload (#162)", () => {
  it("root barrel does not import feature sheets", () => {
    const index = read("index.css");
    expect(index).toContain("@import \"./tokens.css\"");
    expect(index).toContain("@import \"./base.css\"");
    expect(index).toContain("@import \"./responsive-lg.css\"");
    expect(index).not.toMatch(/crossword|wellness|connexion|games\.css/);
  });

  it("landing/sign-in global sheets have no crossword, wellness, or connexion rules", () => {
    const globalCss = ["tokens.css", "base.css", "responsive-lg.css"].map(read).join("\n");
    expect(globalCss).not.toMatch(/\.crossword-/);
    expect(globalCss).not.toMatch(/\.wellness-/);
    expect(globalCss).not.toMatch(/\.connexion-/);
  });
});
