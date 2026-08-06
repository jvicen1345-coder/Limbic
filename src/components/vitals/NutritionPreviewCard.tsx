import Link from "next/link";

export function NutritionPreviewCard({ tip }: { tip: string }) {
  return (
    <div className="card elev-sm" style={{ flex: 1, minWidth: 220 }}>
      <div className="card-kicker">Nutrition tip of the day</div>
      <p className="card-body" style={{ marginTop: 4 }}>
        {tip}
      </p>
      <Link href="/wellness/nutrition" style={{ fontSize: 12.5, color: "var(--color-accent-700)", marginTop: 12, display: "inline-block" }}>
        → Go to Nutrition
      </Link>
    </div>
  );
}
