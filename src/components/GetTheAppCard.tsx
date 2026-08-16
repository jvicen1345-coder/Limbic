import { SmartphoneIcon, MonitorIcon } from "@/components/icons";

/** Profile > About you — a static how-to for installing Limbic as a home-screen/desktop
 *  app. Backed by app/manifest.ts (Android/desktop install) and the appleWebApp metadata in
 *  app/layout.tsx (iOS standalone launch) — without those, "Add to Home Screen" still makes
 *  an icon, but it opens back inside ordinary browser chrome instead of full-screen. */
export function GetTheAppCard() {
  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Get the app</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Add Limbic to your home screen or dock for a faster, full-screen experience — no app
        store needed.
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
            Click the install icon in the address bar (a small monitor with an arrow), or open
            the &#8942; menu and choose &ldquo;Install Limbic&hellip;&rdquo;
          </li>
          <li>Click &ldquo;Install&rdquo; in the confirmation prompt.</li>
        </ol>
      </div>
    </div>
  );
}
