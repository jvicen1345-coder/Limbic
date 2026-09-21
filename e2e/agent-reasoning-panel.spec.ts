import { test, expect } from "@playwright/test";
import { freshEmail, grantLimbicPro, signUpAndEnterApp } from "./helpers";

test("non-Pro visitors get the Limbic Agent upsell and no reasoning web", async ({ page }) => {
  await signUpAndEnterApp(page, freshEmail("agent-gate"));
  await page.goto("/agent");

  await expect(page.getByRole("heading", { name: "Limbic Agent" })).toBeVisible();
  await expect(page.getByText("LimbicPRO Required")).toBeVisible();
  await expect(page.locator(".agent-page")).toHaveCount(0);
  await expect(page.locator(".agent-detail-card")).toHaveCount(0);
  await expect(page.locator(".agent-reasoning")).toHaveCount(0);
});

test("pro reasoning panel sits beside the web, stacks on a narrow viewport, and keeps the disclaimer", async ({
  page,
}) => {
  const email = freshEmail("agent-split");
  await signUpAndEnterApp(page, email);
  await grantLimbicPro(email);

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/agent");

  await expect(page.locator(".agent-topbar")).toContainText("Clinical decision support, not diagnosis.");
  await expect(page.locator(".agent-detail-card")).toHaveCount(0);
  await expect(page.locator(".agent-canvas-wrap")).toBeVisible();
  await expect(page.locator(".agent-reasoning")).toBeVisible();
  await expect(page.getByLabel("Reasoning transcript")).toBeVisible();

  const desktopWeb = await page.locator(".agent-web-pane").boundingBox();
  const desktopPanel = await page.locator(".agent-reasoning").boundingBox();
  expect(desktopWeb).not.toBeNull();
  expect(desktopPanel).not.toBeNull();
  expect(desktopPanel!.x).toBeGreaterThanOrEqual(desktopWeb!.x + desktopWeb!.width - 2);
  expect(desktopWeb!.width).toBeGreaterThan(200);
  expect(desktopPanel!.width).toBeGreaterThan(200);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileWeb = await page.locator(".agent-web-pane").boundingBox();
  const mobilePanel = await page.locator(".agent-reasoning").boundingBox();
  expect(mobileWeb).not.toBeNull();
  expect(mobilePanel).not.toBeNull();
  expect(mobilePanel!.y).toBeGreaterThanOrEqual(mobileWeb!.y + mobileWeb!.height - 2);
  expect(mobileWeb!.height).toBeGreaterThan(120);
  expect(mobilePanel!.height).toBeGreaterThan(120);
  await expect(page.locator(".agent-input-bar")).toBeVisible();
  await expect(page.locator(".agent-detail-card")).toHaveCount(0);
});

test("asking echoes the question in the transcript and selecting a node does not cover the web", async ({
  page,
}) => {
  const email = freshEmail("agent-echo");
  await signUpAndEnterApp(page, email);
  await grantLimbicPro(email);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/agent?topic=patellofemoral%20pain");

  await expect(page.locator(".threads-chat-bubble-user").filter({ hasText: "patellofemoral pain" })).toBeVisible();
  await expect(page.locator(".agent-canvas-wrap")).toBeVisible();
  await expect(page.locator(".agent-reasoning")).toBeVisible();
  await expect(page.locator(".agent-detail-card")).toHaveCount(0);
  await expect(page.locator(".agent-node")).toBeVisible();
});
