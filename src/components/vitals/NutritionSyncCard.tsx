/** Read-only "today's synced totals" card, shown above the Macro Calculator on
 *  /wellness/nutrition when a connected Google Health account has logged food today (see
 *  lib/google-health-nutrition-sync.ts) — sits next to the calculator's own *targets* so a
 *  reader can compare what they actually ate against what the calculator recommends, without
 *  the two being wired together (the calculator's result is ephemeral client state from its
 *  own "Calculate" button, not something worth prop-drilling into a server-rendered card).
 *  Renders nothing if there's nothing synced yet today, same "don't show an empty state for
 *  a feature that hasn't been used" convention as the rest of Health & Wellness. */
export function NutritionSyncCard({
  calories,
  proteinG,
  carbsG,
  fatG,
}: {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}) {
  if (calories == null && proteinG == null && carbsG == null && fatG == null) return null;

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Today, synced from Google Health</div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 8 }}>
        {calories != null && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{calories.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>calories</div>
          </div>
        )}
        {proteinG != null && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{proteinG}g</div>
            <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>protein</div>
          </div>
        )}
        {carbsG != null && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{carbsG}g</div>
            <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>carbs</div>
          </div>
        )}
        {fatG != null && (
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{fatG}g</div>
            <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>fat</div>
          </div>
        )}
      </div>
    </div>
  );
}
