import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getWellnessArticles } from "@/lib/articles";
import { NUTRITION_SECTIONS, NUTRITION_GOAL_TIPS, NUTRITION_QUICK_TIPS, nutritionTipForDate, isNutritionArticle } from "@/lib/nutrition-content";
import { todayDateKey } from "@/lib/wordle-words";
import type { WellnessGoal } from "@/lib/vitals";
import { WellnessDisclaimer } from "@/components/vitals/WellnessDisclaimer";
import { LockIcon, ExternalLinkIcon } from "@/components/icons";
import type { WellnessArticle } from "@/lib/types";
import { MacroCalculatorCard } from "@/components/metrics/MacroCalculatorCard";
import { NUTRITION_SOURCES } from "@/lib/nutrition-macros";

const NUTRITION_ARTICLE_LIMIT = 6;

/** Zips NUTRITION_SECTIONS (content, unchanged) with this page's own card metadata (label +
 *  border color) by position — the lib data stays presentation-agnostic, same reasoning as
 *  keeping icon components out of lib/games.ts. Order must match NUTRITION_SECTIONS exactly. */
const CARD_META = [
  { label: "HYDRATION", className: "nutrition-card-hydration" },
  { label: "MACRONUTRIENTS", className: "nutrition-card-macros" },
  { label: "WORKOUT NUTRITION", className: "nutrition-card-workout" },
  { label: "ANTI-INFLAMMATORY", className: "nutrition-card-antiinflammatory" },
  { label: "RECOVERY", className: "nutrition-card-recovery" },
];

export default async function NutritionPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [articlePool, profile] = await Promise.all([
    getWellnessArticles(),
    prisma.vitalsProfile.findUnique({ where: { userId: user.id } }),
  ]);

  const nutritionArticles = articlePool.filter((a) => isNutritionArticle(a.title, a.summary)).slice(0, NUTRITION_ARTICLE_LIMIT);

  // "Wellness+" is a marketing label for the existing LimbicPRO tier here, not a separate
  // subscription — there's no dedicated Wellness+ field in the schema, and adding a whole
  // second paid tier wasn't part of this spec's Step 1 migration, so this reuses the same
  // isPro flag /pro already gates on (see app/actions/pro.ts).
  const isWellnessPlus = user.isPro || user.studentTier !== "none";
  const goal = profile?.wellnessGoal as WellnessGoal | undefined;

  const dailyTip = nutritionTipForDate(todayDateKey());

  return (
    <div className="screen-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <div className="nutrition-header">
        <h1 className="nutrition-title">Nutrition</h1>
        <p className="nutrition-subtitle">General wellness nutrition guidance</p>
        <WellnessDisclaimer />
      </div>

      <div className="nutrition-tip-card">
        <div className="nutrition-section-label">Today&rsquo;s Nutrition Tip</div>
        <p className="nutrition-tip-text">{dailyTip}</p>
      </div>

      <div className="nutrition-quicktips-row">
        {NUTRITION_QUICK_TIPS.map((tip) => (
          <div key={tip.text} className="nutrition-quicktip-pill">
            <span className={`nutrition-quicktip-dot nutrition-quicktip-dot-${tip.kind}`} />
            {tip.text}
          </div>
        ))}
      </div>

      <div className="nutrition-section-label" style={{ marginBottom: 12 }}>
        Macro Calculator
      </div>
      <div style={{ marginBottom: 24 }}>
        <MacroCalculatorCard
          initialAge={profile?.age ?? null}
          initialWeightLbs={profile?.weightLbs ?? null}
          initialHeightFeet={profile?.heightFeet ?? null}
          initialHeightInches={profile?.heightInches ?? null}
          initialSex={profile?.biologicalSex ?? null}
          initialActivityLevel={profile?.activityLevel ?? null}
          initialGoal={profile?.wellnessGoal ?? null}
        />
      </div>

      <div className="nutrition-cards-grid">
        {NUTRITION_SECTIONS.map((section, i) => (
          <div key={section.title} className={`nutrition-content-card ${CARD_META[i].className}`}>
            <div className="nutrition-section-label">{CARD_META[i].label}</div>
            <div className="nutrition-content-card-title">{section.title}</div>
            <p className="nutrition-content-card-body">{section.body}</p>
          </div>
        ))}
      </div>

      {isWellnessPlus ? (
        <div className="nutrition-goal-card">
          <div className="nutrition-section-label">Personalized for Your Goal</div>
          {goal ? (
            <>
              <div className="nutrition-goal-value">Your Goal: {goal}</div>
              <div style={{ marginBottom: 4 }}>
                {NUTRITION_GOAL_TIPS[goal].map((tip) => (
                  <div key={tip} className="vitals-insight-item">
                    <span className="vitals-insight-dot" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
              <Link href="/wellness/metrics" className="btn btn-secondary" style={{ marginTop: 14 }}>
                → Update your goal
              </Link>
            </>
          ) : (
            <>
              <p className="card-body" style={{ margin: "0 0 14px" }}>
                Set up your Vitals profile to unlock personalized guidance.
              </p>
              <Link href="/wellness/metrics" className="btn btn-secondary">
                → Go to Vitals
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="nutrition-paywall" style={{ marginBottom: 22 }}>
          <div className="nutrition-paywall-content">
            <div className="nutrition-goal-card" style={{ marginBottom: 0 }}>
              <div className="nutrition-section-label">Personalized for Your Goal</div>
              <div className="nutrition-goal-value">Your Goal: General Health</div>
              {NUTRITION_GOAL_TIPS["General Health"].map((tip) => (
                <div key={tip} className="vitals-insight-item">
                  <span className="vitals-insight-dot" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="nutrition-paywall-overlay">
            <div className="nutrition-paywall-card">
              <LockIcon size={20} />
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 16, marginTop: 6 }}>Unlock personalized nutrition guidance</div>
              <p>Based on your wellness goal — available with Wellness+</p>
              <Link href="/pro" className="btn btn-primary">
                Upgrade to Wellness+
              </Link>
            </div>
          </div>
        </div>
      )}

      {nutritionArticles.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="nutrition-section-label">From the Feed</div>
          <div className="nutrition-articles-row">
            {nutritionArticles.map((a) => (
              <NutritionArticleCard key={a.id} article={a} />
            ))}
          </div>
        </div>
      )}

      <div className="nutrition-section-label">Nutrition Sources</div>
      <div className="wellness-sources-grid">
        {NUTRITION_SOURCES.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="wellness-source-card">
            <div className="wellness-source-card-title">
              {source.title}
              <ExternalLinkIcon size={12} />
            </div>
            <p className="wellness-source-card-desc">{source.description}</p>
            <span className="wellness-source-card-domain">{source.domain}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function NutritionArticleCard({ article }: { article: WellnessArticle }) {
  const href = article.sourceUrl ?? `/wellness/${article.id}`;
  const isExternal = !!article.sourceUrl;
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="card elev-sm card-hoverable nutrition-article-card"
    >
      <div className="card-title" style={{ fontSize: 15 }}>
        {article.title}
      </div>
      <div className="card-meta">
        <span>
          {article.source} · {article.readMins} min
        </span>
      </div>
    </Link>
  );
}
