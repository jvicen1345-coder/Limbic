import { expect, test } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

test("Clips waits for a visible slide before loading YouTube", async ({ page }) => {
  await signUpAndEnterApp(page, freshEmail("clips-lazy-youtube"));

  // Hold IntersectionObserver callbacks until the test explicitly marks a clip visible.
  // This distinguishes rendering the dynamically-loaded feed from activating its first
  // player: route prefetch or hydration alone must not contact YouTube.
  await page.addInitScript(() => {
    type ObserverRecord = {
      callback: IntersectionObserverCallback;
      observer: IntersectionObserver;
      targets: Element[];
    };
    const records: ObserverRecord[] = [];

    class ControlledIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly scrollMargin = "0px";
      readonly thresholds = [0.6];
      private readonly record: ObserverRecord;

      constructor(callback: IntersectionObserverCallback) {
        this.record = { callback, observer: this, targets: [] };
        records.push(this.record);
      }

      observe(target: Element) {
        this.record.targets.push(target);
      }

      unobserve(target: Element) {
        this.record.targets = this.record.targets.filter((candidate) => candidate !== target);
      }

      disconnect() {
        this.record.targets = [];
      }

      takeRecords() {
        return [];
      }
    }

    window.IntersectionObserver = ControlledIntersectionObserver;
    Object.assign(window, {
      activateFirstClip() {
        for (const record of records) {
          const target = record.targets.find((candidate) => candidate.hasAttribute("data-slot-id"));
          if (!target) continue;
          const rect = target.getBoundingClientRect();
          record.callback(
            [
              {
                boundingClientRect: rect,
                intersectionRatio: 1,
                intersectionRect: rect,
                isIntersecting: true,
                rootBounds: null,
                target,
                time: performance.now(),
              },
            ],
            record.observer,
          );
          return true;
        }
        return false;
      },
    });
  });

  let iframeApiRequests = 0;
  await page.route("https://www.youtube.com/iframe_api", async (route) => {
    iframeApiRequests += 1;
    await route.fulfill({
      contentType: "application/javascript",
      body: "window.YT={Player:function(){},PlayerState:{ENDED:0,PLAYING:1,PAUSED:2}};window.onYouTubeIframeAPIReady?.();",
    });
  });

  await page.goto("/clips");
  await expect(page.locator("[data-slot-id]").first()).toBeVisible();
  expect(iframeApiRequests).toBe(0);
  await expect(page.locator('script[src="https://www.youtube.com/iframe_api"]')).toHaveCount(0);
  await expect(page.locator(".clip-slide iframe")).toHaveCount(0);

  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as typeof window & { activateFirstClip: () => boolean }).activateFirstClip(),
      ),
    )
    .toBe(true);
  await expect.poll(() => iframeApiRequests).toBe(1);
  await expect(page.locator('.clip-slide iframe[src*="youtube.com/embed/"]').first()).toBeAttached();
});
