import { expect, test } from "@playwright/test";
import { freshEmail, signUpAndEnterApp } from "./helpers";

test("real observer activates the first clip and loads YouTube once", async ({ page }) => {
  let iframeApiRequests = 0;
  await page.route("https://www.youtube.com/iframe_api", async (route) => {
    iframeApiRequests += 1;
    await route.fulfill({
      contentType: "application/javascript",
      body: "window.YT={Player:function(){},PlayerState:{ENDED:0,PLAYING:1,PAUSED:2}};window.onYouTubeIframeAPIReady?.();",
    });
  });

  await signUpAndEnterApp(page, freshEmail("clips-real-observer"));
  await page.goto("/clips");
  await expect(page.locator("[data-slot-id]").first()).toBeVisible();
  await expect.poll(() => iframeApiRequests).toBe(1);
  await expect(page.locator('.clip-slide iframe[src*="youtube.com/embed/"]').first()).toBeAttached();
  await expect(page.locator('script[src="https://www.youtube.com/iframe_api"]')).toHaveCount(1);
});

test("appending a lap observes only the new slides", async ({ page }) => {
  await page.addInitScript(() => {
    type ObserverRecord = {
      callback: IntersectionObserverCallback;
      observer: IntersectionObserver;
      targets: Element[];
      disconnected: boolean;
    };
    const records: ObserverRecord[] = [];

    class RecordingObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = "0px";
      readonly scrollMargin = "0px";
      readonly thresholds = [0.6];
      private readonly record: ObserverRecord;

      constructor(callback: IntersectionObserverCallback) {
        this.record = { callback, observer: this, targets: [], disconnected: false };
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
        this.record.disconnected = true;
      }

      takeRecords() {
        return [];
      }
    }

    window.IntersectionObserver = RecordingObserver;
    Object.assign(window, {
      clipObservationSnapshot() {
        return records.map((record) => ({
          disconnected: record.disconnected,
          ids: record.targets.map((target) => target.getAttribute("data-slot-id")),
        }));
      },
      activateLastObservedSlide() {
        for (const record of records) {
          const targets = record.targets.filter((candidate) => candidate.hasAttribute("data-slot-id"));
          const target = targets[targets.length - 1];
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

  await signUpAndEnterApp(page, freshEmail("clips-lap-observe"));
  await page.goto("/clips");
  await expect(page.locator("[data-slot-id]").first()).toBeVisible();

  const readLive = () =>
    page.evaluate(() =>
      (
        window as typeof window & {
          clipObservationSnapshot: () => { disconnected: boolean; ids: (string | null)[] }[];
        }
      )
        .clipObservationSnapshot()
        .filter((record) => !record.disconnected)
        .map((record) => record.ids.filter((id): id is string => id !== null))
        .filter((ids) => ids.length > 0),
    );

  await expect.poll(async () => (await readLive()).length).toBe(1);

  const before = (await readLive())[0];
  const firstLapCount = await page.locator("[data-slot-id]").count();
  expect(before).toHaveLength(firstLapCount);
  expect(new Set(before).size).toBe(firstLapCount);

  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as typeof window & { activateLastObservedSlide: () => boolean }
        ).activateLastObservedSlide(),
      ),
    )
    .toBe(true);

  await expect.poll(() => page.locator("[data-slot-id]").count()).toBe(firstLapCount * 2);

  const after = await readLive();
  expect(after).toHaveLength(1);
  expect(after[0].slice(0, firstLapCount)).toEqual(before);
  expect(after[0]).toHaveLength(firstLapCount * 2);
  expect(new Set(after[0]).size).toBe(firstLapCount * 2);
});
