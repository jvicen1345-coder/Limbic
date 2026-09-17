import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isStandaloneDisplay } from "./standalone-display";

function fakeWindow({
  displayMode = "browser",
  standalone = false,
}: {
  displayMode?: string;
  standalone?: boolean;
}): Pick<Window, "matchMedia" | "navigator"> {
  return {
    matchMedia: (query: string) =>
      ({
        matches: query === `(display-mode: ${displayMode})`,
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
          return false;
        },
      }) as MediaQueryList,
    navigator: { standalone } as Navigator & { standalone?: boolean },
  };
}

describe("isStandaloneDisplay", () => {
  it("is false in a normal browser tab", () => {
    assert.equal(isStandaloneDisplay(fakeWindow({})), false);
  });

  it("is true when display-mode is standalone (Android/desktop install)", () => {
    assert.equal(isStandaloneDisplay(fakeWindow({ displayMode: "standalone" })), true);
  });

  it("is true when navigator.standalone is set (iOS Safari)", () => {
    assert.equal(isStandaloneDisplay(fakeWindow({ standalone: true })), true);
  });

  it("does not treat fullscreen or minimal-ui as installed", () => {
    assert.equal(isStandaloneDisplay(fakeWindow({ displayMode: "fullscreen" })), false);
    assert.equal(isStandaloneDisplay(fakeWindow({ displayMode: "minimal-ui" })), false);
  });
});
