"use client";

import { useEffect, useState } from "react";
import type { StockView } from "@/lib/stock";

const ROTATE_MS = 12000;

/** Cycles between the PT industry's tracked tickers (see lib/stock.ts's
 *  INDUSTRY_TICKERS) on a timer — same auto-rotate pattern as the Home hero (see
 *  HeroFeed.tsx). */
export function StockCard({ stocks }: { stocks: StockView[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (stocks.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % stocks.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [stocks.length]);

  if (stocks.length === 0) return null;
  const stock = stocks[index % stocks.length];

  return (
    <div className="card elev-sm" style={{ padding: 14 }}>
      <div className="card-kicker" style={{ margin: 0, fontSize: "var(--fs-9)" }}>
        PT Industry Index
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "5px 0" }}>
        <div>
          <div style={{ fontSize: "var(--fs-10-5)", color: "var(--color-neutral-700)" }}>
            {stock.symbol} · {stock.exchange}
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, marginTop: 2 }}>{stock.price}</div>
        </div>
        <div
          style={{
            fontSize: "var(--fs-10-5)",
            fontWeight: 600,
            color: stock.changeUp ? "var(--color-accent-2-700)" : "var(--color-neutral-700)",
          }}
        >
          {stock.changeLabel}
        </div>
      </div>
      <svg width="100%" height="40" viewBox="0 0 220 60" preserveAspectRatio="none" style={{ display: "block" }}>
        <path
          d={stock.sparklinePath}
          fill="none"
          stroke={stock.changeUp ? "var(--color-accent-2)" : "var(--color-neutral-500)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div style={{ fontSize: "var(--fs-8-5)", color: "var(--color-neutral-700)", marginTop: 5 }}>
        {stock.name} · {stock.isLive ? "live" : "last known snapshot"}
      </div>
      {stocks.length > 1 && (
        <div style={{ display: "flex", gap: 5, marginTop: 9 }}>
          {stocks.map((s, i) => (
            <button
              key={s.symbol}
              type="button"
              aria-label={`Show ${s.symbol}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === index ? "var(--color-accent)" : "var(--color-neutral-300)",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
