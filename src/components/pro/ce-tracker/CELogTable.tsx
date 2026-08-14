"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCELog } from "@/app/actions/pro-toolbox";
import { TrashIcon } from "@/components/icons";

export interface CELogRow {
  id: string;
  courseName: string;
  provider: string | null;
  completedAt: string;
  hours: number;
  category: string;
}

export function CELogTable({ rows }: { rows: CELogRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteCELog(id);
      router.refresh();
    });
  };

  if (rows.length === 0) {
    return <p style={{ fontSize: 12.5, color: "var(--color-neutral-700)", margin: 0 }}>No CE courses logged yet.</p>;
  }

  return (
    <div className="pro-table-wrap">
      <table className="pro-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Course Name</th>
            <th>Provider</th>
            <th>Hours</th>
            <th>Category</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td style={{ whiteSpace: "nowrap" }}>
                {new Date(`${r.completedAt}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </td>
              <td>{r.courseName}</td>
              <td>{r.provider ?? "—"}</td>
              <td>{r.hours}</td>
              <td>{r.category}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label={`Delete ${r.courseName}`}
                  disabled={pending}
                  onClick={() => handleDelete(r.id)}
                >
                  <TrashIcon size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
