import { getCurrentUser } from "@/lib/session";
import { PATHOLOGIES } from "@/lib/pathologies-static";
import { PathologyVideo } from "@/components/wellness/PathologyVideo";

export default async function CommonPathologiesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const categories = Array.from(new Set(PATHOLOGIES.map((p) => p.category)));

  return (
    <div className="screen-pad" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, margin: "0 0 4px" }}>Common Pathologies</h1>
      <p style={{ fontSize: 13, color: "var(--color-neutral-700)", margin: "0 0 14px" }}>
        Plain-language explanations of conditions people commonly ask about, each with a video to help it click.
      </p>
      <div className="vitals-disclaimer">
        This is general education, not a diagnosis. Talk to a physician or a licensed physical therapist about symptoms you&rsquo;re
        experiencing.
      </div>

      {categories.map((category) => (
        <section key={category} style={{ marginTop: 22 }}>
          <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>{category}</h2>
          <div className="wellness-card-columns">
            {PATHOLOGIES.filter((p) => p.category === category).map((p) => (
              <div key={p.slug} className="wellness-assess-card">
                <div className="wellness-calc-title" style={{ margin: 0 }}>
                  {p.name}
                </div>
                <p className="wellness-calc-desc" style={{ marginTop: 6 }}>
                  {p.summary}
                </p>

                {p.explanation.map((paragraph, i) => (
                  <p key={i} className="wellness-calc-desc">
                    {paragraph}
                  </p>
                ))}

                <PathologyVideo slug={p.slug} name={p.name} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
