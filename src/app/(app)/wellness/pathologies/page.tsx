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
          <div className="assess-page-layout">
            {PATHOLOGIES.filter((p) => p.category === category).map((p, i) => [
              <div key={p.slug} className="wellness-assess-card assess-test-card">
                <div className="wellness-exercise-header">
                  <span className="wellness-exercise-number">{i + 1}</span>
                  <div className="wellness-calc-title" style={{ margin: 0 }}>
                    {p.name}
                  </div>
                </div>
                <p className="wellness-calc-desc">{p.summary}</p>

                <div className="wellness-assess-steps-label">What It Is</div>
                <p className="wellness-calc-desc">{p.explanation[0]}</p>

                <div className="wellness-assess-steps-label">Symptoms &amp; What Helps</div>
                <p className="wellness-calc-desc">{p.explanation[1]}</p>

                <p className="wellness-calc-caution">{p.explanation[2]}</p>
              </div>,

              <div key={`${p.slug}-video`} className="assess-video-cell">
                {i === 0 && <div className="assess-right-panel-heading">Video References</div>}
                <div className="assess-video-card">
                  <div className="assess-video-title">{p.name}</div>
                  <PathologyVideo slug={p.slug} name={p.name} />
                </div>
              </div>,
            ])}
          </div>
        </section>
      ))}
    </div>
  );
}
