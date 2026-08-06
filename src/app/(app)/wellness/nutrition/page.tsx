import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getWellnessArticles } from "@/lib/articles";
import { NUTRITION_SECTIONS, NUTRITION_GOAL_TIPS, isNutritionArticle } from "@/lib/nutrition-content";
import type { WellnessGoal } from "@/lib/vitals";
import { WELLNESS_GOAL_OPTIONS } from "@/lib/vitals";
import { WellnessDisclaimer } from "@/components/vitals/WellnessDisclaimer";
import { WellnessListItem } from "@/components/RowCards";
import { LockIcon } from "@/components/icons";

const NUTRITION_ARTICLE_LIMIT = 6;

export default async function NutritionPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [articlePool, profile, savedArticleRows, savedWellnessRows] = await Promise.all([
    getWellnessArticles(),
    prisma.vitalsProfile.findUnique({ where: { userId: user.id } }),
    prisma.savedArticle.findMany({ where: { userId: user.id }, select: { articleId: true } }),
    prisma.savedWellness.findMany({ where: { userId: user.id }, select: { itemId: true } }),
  ]);
  const savedIds = new Set([...savedArticleRows.map((r) => r.articleId), ...savedWellnessRows.map((r) => r.itemId)]);
  const openedIds = new Set((user.wellnessOpenedIds as string[]) ?? []);

  const nutritionArticles = articlePool.filter((a) => isNutritionArticle(a.title, a.summary)).slice(0, NUTRITION_ARTICLE_LIMIT);

  // "Wellness+" is a marketing label for the existing LimbicPRO tier here, not a separate
  // subscription — there's no dedicated Wellness+ field in the schema, and adding a whole
  // second paid tier wasn't part of this spec's Step 1 migration, so this reuses the same
  // isPro flag /pro already gates on (see app/actions/pro.ts).
  const isWellnessPlus = user.isPro;
  const goal = (profile?.wellnessGoal as WellnessGoal | undefined) ?? "General Health";

  return (
    <div className="screen-pad" style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Nutrition</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>General wellness nutrition guidance.</p>
      <WellnessDisclaimer />

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        {NUTRITION_SECTIONS.map((section, i) => (
          <div key={section.title} style={{ marginTop: i === 0 ? 0 : 18 }}>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, marginBottom: 4 }}>{section.title}</div>
            <p className="card-body" style={{ margin: 0 }}>
              {section.body}
            </p>
          </div>
        ))}
      </div>

      <div className="card elev-sm" style={{ marginBottom: 18 }}>
        <div className="card-kicker">Personalized for your goal</div>
        <p className="card-body" style={{ marginTop: 2 }}>
          Wellness+ tailors these general tips to the goal set in your Vitals profile.
        </p>

        {isWellnessPlus ? (
          <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--color-neutral-100)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-accent-700)", marginBottom: 4 }}>{goal}</div>
            <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{NUTRITION_GOAL_TIPS[goal]}</p>
          </div>
        ) : (
          <div className="nutrition-paywall" style={{ marginTop: 10 }}>
            <div className="nutrition-paywall-content">
              {WELLNESS_GOAL_OPTIONS.map((g) => (
                <div key={g} style={{ padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--color-neutral-100)", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-accent-700)", marginBottom: 4 }}>{g}</div>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5 }}>{NUTRITION_GOAL_TIPS[g]}</p>
                </div>
              ))}
            </div>
            <div className="nutrition-paywall-overlay">
              <div className="nutrition-paywall-card">
                <LockIcon size={20} />
                <p>Unlock nutrition tips personalized to your wellness goal with Wellness+.</p>
                <Link href="/pro" className="btn btn-primary">
                  → Upgrade to Wellness+
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {nutritionArticles.length > 0 && (
        <div className="card elev-sm">
          <div className="card-kicker">More on nutrition</div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
            {nutritionArticles.map((w) => (
              <WellnessListItem key={w.id} w={w} saved={savedIds.has(w.id)} opened={openedIds.has(w.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
