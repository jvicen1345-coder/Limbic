import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";
import type { Playbook } from "@/lib/playbook-content";
import { PlaybookBlockView } from "@/components/playbook/PlaybookBlocks";
import { PlaybookInline } from "@/components/playbook/PlaybookInline";

/** Renders a whole playbook (see lib/playbook-content.ts) — masthead, a sticky rail of
 *  section anchors, then each section's blocks in order.
 *
 *  A server component: the only interactive parts are the checklist (its own client
 *  component) and the drill's native <details>, so the nav is plain anchors that work
 *  before hydration and with JavaScript off. */
export function PlaybookPage({ playbook, breadcrumb }: { playbook: Playbook; breadcrumb: BreadcrumbItem[] }) {
  return (
    <div className="playbook">
      <div className="playbook-wrap">
        <Breadcrumb items={breadcrumb} />

        <header className="playbook-masthead">
          <div>
            <p className="playbook-eyebrow">{playbook.eyebrow}</p>
            <h1 className="playbook-title">{playbook.title}</h1>
            <p className="playbook-summary">{playbook.summary}</p>
          </div>
          <div className="playbook-stamp">
            {playbook.stamp.map((entry) => (
              <div key={entry.label}>
                <b>{entry.value}</b> {entry.label}
              </div>
            ))}
          </div>
        </header>
      </div>

      <nav className="playbook-nav" aria-label={`${playbook.name} sections`}>
        <div className="playbook-navrow">
          {playbook.sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.navLabel}
            </a>
          ))}
        </div>
      </nav>

      <div className="playbook-wrap">
        {playbook.sections.map((section, i) => (
          <section id={section.id} key={section.id} className="playbook-section">
            <div className="playbook-sechead">
              <span className="playbook-secnum">{String(i + 1).padStart(2, "0")}</span>
              <h2>{section.title}</h2>
              {section.note && <span className="playbook-sechead-note">{section.note}</span>}
            </div>
            {section.blocks.map((block, j) => (
              <PlaybookBlockView block={block} slug={playbook.slug} key={j} />
            ))}
          </section>
        ))}

        <footer className="playbook-footer">
          <PlaybookInline text={playbook.footer} />
        </footer>
      </div>
    </div>
  );
}
