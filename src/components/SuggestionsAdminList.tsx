"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteSuggestionAction } from "@/app/actions/suggestions";
import { TrashIcon } from "@/components/icons";

export interface SuggestionRow {
  id: string;
  body: string;
  createdAt: string;
}

/** Admin-only list — the page itself already gated on isSiteAdmin() before rendering this,
 *  same trust boundary as components/founding-funders/FoundingAdminPanel.tsx (the server
 *  action re-checks admin status independently regardless). */
export function SuggestionsAdminList({ suggestions }: { suggestions: SuggestionRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteSuggestionAction(id);
      router.refresh();
    });
  };

  if (suggestions.length === 0) {
    return <p className="card-body">No suggestions yet.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {suggestions.map((s) => (
        <div key={s.id} className="suggestion-admin-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="suggestion-admin-date">
              {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
            <p className="suggestion-admin-body">{s.body}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Delete suggestion" onClick={() => handleDelete(s.id)}>
            <TrashIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
