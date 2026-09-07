import base from "./playwright.config";
const cfg = base as unknown as Record<string, unknown>;
export default { ...cfg, use: { ...(cfg.use as object), launchOptions: { executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" } } };
