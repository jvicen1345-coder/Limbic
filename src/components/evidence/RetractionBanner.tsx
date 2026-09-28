import type { RetractionFlag } from "@/lib/retraction-check";

/** A warning on the study itself when it appears in the Retraction Watch snapshot — so a
 *  reader who arrives from the feed, search or Google sees it before the findings. No
 *  hooks, so it renders from both server and client components. */
export function RetractionBanner({ flag }: { flag: RetractionFlag }) {
  const isRetraction = /retraction/i.test(flag.status);
  return (
    <div className={`evidence-retraction${isRetraction ? " is-retraction" : ""}`} role="alert">
      <strong>{isRetraction ? "This study has been retracted." : `${flag.status} issued for this study.`}</strong>{" "}
      {isRetraction
        ? "Its findings should not be relied on."
        : "Part of what was published has been changed or questioned."}
      {flag.reason && <span className="evidence-retraction-reason"> Reason given: {flag.reason}</span>}
      {flag.noticeUrl && (
        <>
          {" "}
          <a href={flag.noticeUrl} target="_blank" rel="noopener noreferrer">
            Read the notice
          </a>
        </>
      )}
    </div>
  );
}
