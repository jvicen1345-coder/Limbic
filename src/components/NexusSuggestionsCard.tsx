import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ConnectButton } from "@/components/ConnectButton";
import type { ConnectionState } from "@/lib/nexus";

export interface NexusSuggestion {
  id: string;
  name: string;
  headline: string | null;
  state: ConnectionState;
}

export function NexusSuggestionsCard({ people }: { people: NexusSuggestion[] }) {
  if (people.length === 0) return null;

  return (
    <div className="card elev-sm" style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
        <div className="card-kicker" style={{ margin: 0 }}>
          Nexus suggestions
        </div>
        <Link href="/nexus/directory" style={{ fontSize: "var(--fs-10-5)", color: "var(--color-accent-700)" }}>
          See all
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {people.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href={`/nexus/profile/${p.id}`}>
              <Avatar name={p.name} size={30} />
            </Link>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Link
                href={`/nexus/profile/${p.id}`}
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--color-text)",
                  textDecoration: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {p.name}
              </Link>
              {p.headline && (
                <div
                  style={{
                    fontSize: "var(--fs-10)",
                    color: "var(--color-neutral-700)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.headline}
                </div>
              )}
            </div>
            <ConnectButton userId={p.id} state={p.state} compact />
          </div>
        ))}
      </div>
    </div>
  );
}
