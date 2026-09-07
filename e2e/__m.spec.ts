import { test, expect } from "@playwright/test";
import { signUpAndEnterApp } from "./helpers";
const SP = "/tmp/claude-0/-home-user-Limbic/e744dc4a-78fe-5099-bd6e-e23d79a38a1b/scratchpad";
test("merged shoulder", async ({ page }) => {
  await page.setViewportSize({ width: 1180, height: 900 });
  await signUpAndEnterApp(page, `pw-m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@school.edu`);
  await page.goto("/student/playbooks/shoulder");
  await expect(page.getByRole("heading", { name: "Shoulder Examination Playbook" })).toBeVisible();
  await page.screenshot({ path: `${SP}/m-top.png` });
  await page.locator("#screen").scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SP}/m-screen.png` });
  await page.locator("#patterns figure.playbook-figure").scrollIntoViewIfNeeded();
  await page.locator("#patterns figure.playbook-figure").screenshot({ path: `${SP}/m-painmap.png` });
  const errs: string[] = [];
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await page.goto("/student/playbooks/ankle");
  await expect(page.getByRole("heading", { name: "Ankle & Foot Examination Playbook" })).toBeVisible();
  console.log("CONSOLE ERRORS:", errs.length);
});
