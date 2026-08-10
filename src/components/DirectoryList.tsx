"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { ConnectButton } from "@/components/ConnectButton";
import { Chip } from "@/components/Chip";
import { SPECIALTIES, SPECIALTY_META } from "@/lib/meta";
import type { ConnectionState } from "@/lib/nexus";
import type { Specialty } from "@/lib/types";

export interface DirectoryPerson {
  id: string;
  name: string;
  headline: string | null;
  bio: string | null;
  specialty: string;
  practiceState: string;
  state: ConnectionState;
}

export function DirectoryList({ people }: { people: DirectoryPerson[] }) {
  const [specialty, setSpecialty] = useState<Specialty | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter((p) => {
      if (specialty !== "all" && p.specialty !== specialty) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.headline ?? "").toLowerCase().includes(q) ||
        p.practiceState.toLowerCase().includes(q)
      );
    });
  }, [people, specialty, query]);

  return (
    <div>
      <div className="field">
        <input
          className="input"
          placeholder="Search the directory…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filter-row" style={{ margin: "10px 0 16px" }}>
        <Chip active={specialty === "all"} onClick={() => setSpecialty("all")}>
          All
        </Chip>
        {SPECIALTIES.map((s) => (
          <Chip key={s.id} active={specialty === s.id} onClick={() => setSpecialty(s.id)}>
            {s.label}
          </Chip>
        ))}
      </div>

      <div className="directory-list">
        {filtered.map((p) => (
          <div key={p.id} className="card elev-sm" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Link href={`/nexus/profile/${p.id}`} style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0, textDecoration: "none", color: "inherit" }}>
              <Avatar name={p.name} size={44} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 15 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
                  {p.headline || SPECIALTY_META[p.specialty as keyof typeof SPECIALTY_META]}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>{p.practiceState}</div>
              </div>
            </Link>
            <ConnectButton userId={p.id} state={p.state} />
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>No one matches that search.</p>
        )}
      </div>
    </div>
  );
}
