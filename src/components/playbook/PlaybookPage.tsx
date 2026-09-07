import { Breadcrumb, type BreadcrumbItem } from "@/components/Breadcrumb";
import type { Playbook } from "@/lib/playbook-content";
import { PlaybookBlockView } from "@/components/playbook/PlaybookBlocks";
import { PlaybookInline } from "@/components/playbook/PlaybookInline";
import {
  PlaybookPrintDetails,
  PlaybookRecallBar,
  PlaybookRecallProvider,
  PlaybookRecallToggle,
  PlaybookSectionRecall,
} from "@/components/playbook/PlaybookRecall";
import {
  PlaybookTaughtBar,
  PlaybookTaughtProvider,
  PlaybookTaughtToggle,
} from "@/components/playbook/PlaybookTaught";
import { playbookRecallGroups } from "@/lib/playbook-recall";
import { playbookTaughtCells } from "@/lib/playbook-taught";

/** Renders a whole playbook (see lib/playbook-content.ts) — masthead, a sticky rail of
 *  section anchors, then each section's blocks in order.
 *
 *  Still a server component: the interactive parts — the checklist, recall mode's controls
 *  (PlaybookRecall.tsx) and the taught lane (PlaybookTaught.tsx) — are client components
 *  rendered from here, so the section anchors stay plain links that work before hydration and
 *  with JavaScript off. */
export function PlaybookPage({ playbook, breadcrumb }: { playbook: Playbook; breadcrumb: BreadcrumbItem[] }) {
  return (
    <PlaybookRecallProvider slug={playbook.slug} groups={playbookRecallGroups(playbook)}>
    <PlaybookTaughtProvider slug={playbook.slug} cells={playbookTaughtCells(playbook)}>
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
        <PlaybookRecallBar />
        <PlaybookTaughtBar />
        <PlaybookPrintDetails />
      </div>

      <nav className="playbook-nav" aria-label={`${playbook.name} sections`}>
        <div className="playbook-navrow">
          {playbook.sections.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.navLabel}
            </a>
          ))}
          <PlaybookRecallToggle />
          <PlaybookTaughtToggle />
        </div>
      </nav>

      <div className="playbook-wrap">
        {playbook.sections.map((section, i) => (
          <section id={section.id} key={section.id} className="playbook-section">
            <div className="playbook-sechead">
              <span className="playbook-secnum">{String(i + 1).padStart(2, "0")}</span>
              <h2>{section.title}</h2>
              {section.note && <span className="playbook-sechead-note">{section.note}</span>}
              <PlaybookSectionRecall sectionId={section.id} />
            </div>
            {section.blocks.map((block, j) => (
              <PlaybookBlockView block={block} slug={playbook.slug} sectionId={section.id} index={j} key={j} />
            ))}
          </section>
        ))}

        <footer className="playbook-footer">
          <PlaybookInline text={playbook.footer} />
        </footer>
      </div>
    </div>
    </PlaybookTaughtProvider>
    </PlaybookRecallProvider>
  );
}
