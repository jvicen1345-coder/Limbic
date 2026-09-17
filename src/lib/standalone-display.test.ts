import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isStandaloneDisplay, subscribeStandaloneDisplay } from "./standalone-display";

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

  it("falls through when matchMedia throws", () => {
    const win = {
      matchMedia: () => {
        throw new Error("no matchMedia");
      },
      navigator: { standalone: true } as Navigator & { standalone?: boolean },
    };
    assert.equal(isStandaloneDisplay(win), true);
  });
});

describe("subscribeStandaloneDisplay", () => {
  it("subscribes to display-mode changes and unsubscribes", () => {
    const listeners = new Set<() => void>();
    const win = {
      matchMedia: () =>
        ({
          matches: false,
          media: "(display-mode: standalone)",
          addEventListener(_type: string, listener: EventListener) {
            listeners.add(listener as () => void);
          },
          removeEventListener(_type: string, listener: EventListener) {
            listeners.delete(listener as () => void);
          },
        }) as MediaQueryList,
    };

    let calls = 0;
    const unsubscribe = subscribeStandaloneDisplay(() => {
      calls += 1;
    }, win);
    assert.equal(listeners.size, 1);
    for (const listener of listeners) listener();
    assert.equal(calls, 1);
    unsubscribe();
    assert.equal(listeners.size, 0);
  });

  it("returns a no-op unsubscribe when matchMedia throws", () => {
    const win = {
      matchMedia: () => {
        throw new Error("no matchMedia");
      },
    };
    const unsubscribe = subscribeStandaloneDisplay(() => {
      throw new Error("should not subscribe");
    }, win);
    unsubscribe();
  });
});
