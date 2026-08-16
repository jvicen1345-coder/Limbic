import { SmartphoneIcon, MonitorIcon } from "@/components/icons";
import { GetTheAppToggle } from "@/components/GetTheAppToggle";

/** Profile > About you — a static how-to for installing Limbic as a home-screen/desktop
 *  app. Backed by app/manifest.ts (Android/desktop install) and the appleWebApp metadata in
 *  app/layout.tsx (iOS standalone launch) — without those, "Add to Home Screen" still makes
 *  an icon, but it opens back inside ordinary browser chrome instead of full-screen.
 *
 *  Also the target of the shortcut icon next to Refresh on Home (see HomeFeed.tsx, which
 *  links to /profile#get-the-app) — the id/scrollMarginTop below are what make that land
 *  here instead of just the top of Profile. */
export function GetTheAppCard({ dismissed }: { dismissed: boolean }) {
  return (
    <div className="card elev-sm" id="get-the-app" style={{ marginBottom: 18, scrollMarginTop: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div className="card-kicker">Get the app</div>
        <GetTheAppToggle dismissed={dismissed} />
      </div>

      {dismissed ? (
        <p className="card-body" style={{ marginTop: 2 }}>
          Instructions hidden — flip the switch above if you ever need them again.
        </p>
      ) : (
        <>
          <p className="card-body" style={{ marginTop: 2 }}>
            Add Limbic to your home screen or dock for a faster, full-screen experience — no
            app store needed.
          </p>

          <div>
            <div className="howto-platform-label">
              <SmartphoneIcon size={15} />
              iPhone &amp; iPad (Safari)
            </div>
            <ol className="howto-steps">
              <li>Open limbic.center in Safari — this only works from Safari, not Chrome.</li>
              <li>Tap the Share icon (the square with an arrow) in the toolbar.</li>
              <li>Scroll down and tap &ldquo;Add to Home Screen.&rdquo;</li>
              <li>Tap &ldquo;Add&rdquo; in the top right.</li>
            </ol>
          </div>

          <div>
            <div className="howto-platform-label">
              <SmartphoneIcon size={15} />
              Android (Chrome)
            </div>
            <ol className="howto-steps">
              <li>Open limbic.center in Chrome.</li>
              <li>Tap the &#8942; menu in the top right.</li>
              <li>Tap &ldquo;Add to Home screen&rdquo; or &ldquo;Install app.&rdquo;</li>
              <li>Confirm by tapping &ldquo;Install&rdquo; or &ldquo;Add.&rdquo;</li>
            </ol>
          </div>

          <div>
            <div className="howto-platform-label">
              <MonitorIcon size={15} />
              Desktop (Chrome or Edge)
            </div>
            <ol className="howto-steps">
              <li>Open limbic.center in Chrome or Edge.</li>
              <li>
                Click the install icon in the address bar (a small monitor with an arrow), or
                open the &#8942; menu and choose &ldquo;Install Limbic&hellip;&rdquo;
              </li>
              <li>Click &ldquo;Install&rdquo; in the confirmation prompt.</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
