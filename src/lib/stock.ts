import "server-only";

/**
 * "PT Industry Index" price sourcing for the sidebar sparkline — cycles between two
 * tickers (see components/StockCard.tsx): USPH (a pure-play PT provider) and XHS (State
 * Street's SPDR S&P Health Care Services ETF, a broader industry benchmark).
 *
 * Each ticker tries two no-API-key sources in order (Stooq's CSV export, then Yahoo
 * Finance's chart endpoint) before falling back to its own REAL_SNAPSHOTS entry below.
 * Neither snapshot is invented — both are actual daily-close series pulled from a live
 * market-data connector while this app was built, kept only as the offline fallback for
 * environments where outbound requests to market-data sites are blocked.
 */

export interface IndustryTicker {
  symbol: string;
  /** Stooq's own symbol format, e.g. "usph.us". */
  stooqSymbol: string;
  exchange: string;
  name: string;
}

export const INDUSTRY_TICKERS: IndustryTicker[] = [
  { symbol: "USPH", stooqSymbol: "usph.us", exchange: "NYSE", name: "U.S. Physical Therapy, Inc." },
  { symbol: "XHS", stooqSymbol: "xhs.us", exchange: "NYSEArca", name: "SPDR S&P Health Care Services ETF" },
];

// 2026-06-24 through 2026-07-24, last close $74.58.
const USPH_SNAPSHOT: { date: string; close: number }[] = [
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

// 2026-07-06 through 2026-08-04, last close $132.89.
const XHS_SNAPSHOT: { date: string; close: number }[] = [
  { date: "2026-07-06", close: 137.5 },
  { date: "2026-07-07", close: 136.9 },
  { date: "2026-07-08", close: 134.75 },
  { date: "2026-07-09", close: 136.24 },
  { date: "2026-07-10", close: 134.9 },
  { date: "2026-07-13", close: 135.0 },
  { date: "2026-07-14", close: 134.21 },
  { date: "2026-07-15", close: 134.75 },
  { date: "2026-07-16", close: 135.36 },
  { date: "2026-07-17", close: 135.77 },
  { date: "2026-07-20", close: 134.46 },
  { date: "2026-07-21", close: 135.68 },
  { date: "2026-07-22", close: 132.94 },
  { date: "2026-07-23", close: 131.95 },
  { date: "2026-07-24", close: 132.82 },
  { date: "2026-07-27", close: 133.26 },
  { date: "2026-07-28", close: 135.96 },
  { date: "2026-07-29", close: 134.07 },
  { date: "2026-07-30", close: 134.26 },
  { date: "2026-07-31", close: 132.71 },
  { date: "2026-08-03", close: 134.19 },
  { date: "2026-08-04", close: 132.89 },
];

const REAL_SNAPSHOTS: Record<string, { date: string; close: number }[]> = {
  USPH: USPH_SNAPSHOT,
  XHS: XHS_SNAPSHOT,
};

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

async function fetchFromStooq(ticker: IndustryTicker): Promise<StockSeries | null> {
  return withTimeout(async (signal) => {
    const res = await fetch(`https://stooq.com/q/d/l/?s=${ticker.stooqSymbol}&i=d`, {
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

async function fetchFromYahoo(ticker: IndustryTicker): Promise<StockSeries | null> {
  return withTimeout(async (signal) => {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker.symbol}?range=1mo&interval=1d`,
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

const cache = new Map<string, { at: number; data: StockSeries }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

async function getSeriesFor(ticker: IndustryTicker): Promise<StockSeries> {
  const cached = cache.get(ticker.symbol);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.data;

  const snapshot = REAL_SNAPSHOTS[ticker.symbol];
  const data =
    (await fetchFromStooq(ticker)) ??
    (await fetchFromYahoo(ticker)) ?? {
      closes: snapshot.map((p) => p.close),
      isLive: false,
      asOf: snapshot[snapshot.length - 1].date,
    };

  cache.set(ticker.symbol, { at: Date.now(), data });
  return data;
}

/** One series per entry in INDUSTRY_TICKERS, fetched concurrently. */
export async function getIndustryIndexSeries(): Promise<StockSeries[]> {
  return Promise.all(INDUSTRY_TICKERS.map(getSeriesFor));
}

export interface StockView {
  symbol: string;
  exchange: string;
  name: string;
  price: string;
  changeLabel: string;
  changeUp: boolean;
  sparklinePath: string;
  isLive: boolean;
  asOf: string;
}

export function buildStockView(ticker: IndustryTicker, series: StockSeries): StockView {
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
    symbol: ticker.symbol,
    exchange: ticker.exchange,
    name: ticker.name,
    price: `$${closes[closes.length - 1].toFixed(2)}`,
    changeLabel: `${up ? "+" : ""}${change.toFixed(2)} (${up ? "+" : ""}${changePct.toFixed(1)}%)`,
    changeUp: up,
    sparklinePath: "M" + points.join(" L"),
    isLive: series.isLive,
    asOf: series.asOf,
  };
}

/** Builds all industry-index tiles (see INDUSTRY_TICKERS) for the cycling StockCard. */
export async function getIndustryIndexView(): Promise<StockView[]> {
  const series = await getIndustryIndexSeries();
  return series.map((s, i) => buildStockView(INDUSTRY_TICKERS[i], s));
}
