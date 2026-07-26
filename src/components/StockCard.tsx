import type { StockView } from "@/lib/stock";

export function StockCard({ stock }: { stock: StockView }) {
  return (
    <div className="card elev-sm" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5 }}>
        <div>
          <div className="card-kicker" style={{ margin: 0, fontSize: 9 }}>
            USPH · NYSE
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, marginTop: 2 }}>{stock.price}</div>
        </div>
        <div
          style={{
            fontSize: 10.5,
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
      <div style={{ fontSize: 8.5, color: "var(--color-neutral-700)", marginTop: 5 }}>
        U.S. Physical Therapy, Inc. · {stock.isLive ? "live" : "last known snapshot"}
      </div>
    </div>
  );
}
