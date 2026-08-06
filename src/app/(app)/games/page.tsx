import Link from "next/link";
import { GridIcon } from "@/components/icons";

const GAMES = [
  { href: "/wordle", title: "Daily Term", description: "Guess today's 5-letter health & wellness word in 6 tries." },
  { href: "/crossword", title: "Mini Crossword", description: "A small 5x5 crossword, a new one each day." },
];

export default function GamesPage() {
  return (
    <div className="screen-pad" style={{ maxWidth: 460, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Limbic Games</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 16px" }}>Pick a daily game.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {GAMES.map((g) => (
          <Link key={g.href} href={g.href} className="card elev-sm card-hoverable" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--radius-md)",
                background: "var(--color-accent-100)",
                color: "var(--color-accent-700)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <GridIcon size={18} />
            </span>
            <span>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{g.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--color-neutral-700)", marginTop: 2 }}>{g.description}</div>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
