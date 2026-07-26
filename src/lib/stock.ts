import "server-only";

/**
 * USPH (U.S. Physical Therapy, Inc.) price sourcing for the sidebar sparkline.
 *
 * Tries two no-API-key sources in order (Stooq's CSV export, then Yahoo Finance's chart
 * endpoint) before falling back to REAL_SNAPSHOT below. That snapshot isn't invented —
 * it's an actual daily-close series pulled from a live market-data connector while this
 * app was built (2026-06-24 through 2026-07-24, last close $74.58), kept only as the
 * offline fallback for environments where outbound requests to market-data sites are
 * blocked.
 */

const REAL_SNAPSHOT: { date: string; close: number }[] = [
  { date: "2026-06-24", close: 66.13 },
  { date: "2026-06-25", close: 66.36 },
  { date: "2026-06-26", close: 69.0 },
  { date: "2026-06-29", close: 68.94 },
  { date: "2026-06-30", close: 68.96 },
  { date: "2026-07-01", close: 71.23 },
  { date: "2026-07-02", close: 72.36 },
  { date: "2026-07-06", close: 73.38 },
  { date: "2026-07-07", close: 71.74 },
  { date: "2026-07-08", close: 70.29 },
  { date: "2026-07-09", close: 73.52 },
  { date: "2026-07-10", close: 72.52 },
  { date: "2026-07-13", close: 71.59 },
  { date: "2026-07-14", close: 70.02 },
  { date: "2026-07-15", close: 71.31 },
  { date: "2026-07-16", close: 74.25 },
  { date: "2026-07-17", close: 73.73 },
  { date: "2026-07-20", close: 74.59 },
  { date: "2026-07-21", close: 74.71 },
  { date: "2026-07-22", close: 74.39 },
  { date: "2026-07-23", close: 72.91 },
  { date: "2026-07-24", close: 74.58 },
];

export interface StockSeries {
  closes: number[];
  isLive: boolean;
  asOf: string;
}

const FETCH_TIMEOUT_MS = 6000;

async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fn(controller.signal);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromStooq(): Promise<StockSeries | null> {
  return withTimeout(async (signal) => {
    const res = await fetch("https://stooq.com/q/d/l/?s=usph.us&i=d", {
      signal,
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    const lines = text.trim().split("\n").slice(1); // drop header row
    const closes = lines
      .map((line) => Number(line.split(",")[4]))
      .filter((n) => Number.isFinite(n));
    if (closes.length < 5) return null;
    return { closes: closes.slice(-22), isLive: true, asOf: new Date().toISOString() };
  });
}

async function fetchFromYahoo(): Promise<StockSeries | null> {
  return withTimeout(async (signal) => {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/USPH?range=1mo&interval=1d",
      { signal, next: { revalidate: 900 } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const closes: unknown[] = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close ?? [];
    const nums = closes.filter((n): n is number => typeof n === "number" && Number.isFinite(n));
    if (nums.length < 5) return null;
    return { closes: nums.slice(-22), isLive: true, asOf: new Date().toISOString() };
  });
}

let cache: { at: number; data: StockSeries } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000;

export async function getUsphSeries(): Promise<StockSeries> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;

  const data =
    (await fetchFromStooq()) ??
    (await fetchFromYahoo()) ?? {
      closes: REAL_SNAPSHOT.map((p) => p.close),
      isLive: false,
      asOf: REAL_SNAPSHOT[REAL_SNAPSHOT.length - 1].date,
    };

  cache = { at: Date.now(), data };
  return data;
}

export interface StockView {
  price: string;
  changeLabel: string;
  changeUp: boolean;
  sparklinePath: string;
  isLive: boolean;
  asOf: string;
}

export function buildStockView(series: StockSeries): StockView {
  const { closes } = series;
  const w = 220;
  const h = 60;
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const stepX = w / (closes.length - 1 || 1);
  const points = closes.map(
    (v, i) => `${(i * stepX).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`
  );
  const change = closes[closes.length - 1] - closes[0];
  const changePct = (change / closes[0]) * 100;
  const up = change >= 0;

  return {
    price: `$${closes[closes.length - 1].toFixed(2)}`,
    changeLabel: `${up ? "+" : ""}${change.toFixed(2)} (${up ? "+" : ""}${changePct.toFixed(1)}%)`,
    changeUp: up,
    sparklinePath: "M" + points.join(" L"),
    isLive: series.isLive,
    asOf: series.asOf,
  };
}
