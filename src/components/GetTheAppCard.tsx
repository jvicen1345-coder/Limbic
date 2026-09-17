"use client";

import { useState, useSyncExternalStore } from "react";
import { SmartphoneIcon, MonitorIcon } from "@/components/icons";
import { CollapsibleCard } from "@/components/CollapsibleCard";
import { GetTheAppToggle } from "@/components/GetTheAppToggle";
import { isStandaloneDisplay, subscribeStandaloneDisplay } from "@/lib/standalone-display";

function getStandaloneSnapshot() {
  return isStandaloneDisplay();
}

function getStandaloneServerSnapshot() {
  return false;
}

/** Profile > About you — a how-to for installing Limbic as a home-screen/desktop app,
 *  with a dismiss switch so someone who already installed (or never will) can collapse it.
 *  Backed by app/manifest.ts (Android/desktop install) and the appleWebApp metadata in
 *  app/layout.tsx (iOS standalone launch) — without those, "Add to Home Screen" still makes
 *  an icon, but it opens back inside ordinary browser chrome instead of full-screen.
 *
 *  Also the target of the shortcut icon next to Refresh on Home (see HomeFeed.tsx, which
 *  links to /profile#get-the-app) — the id/scrollMarginTop below are what make that land
 *  here instead of just the top of Profile.
 *
 *  Installed-app auto-hide is presentation-only: display-mode / navigator.standalone is
 *  read through useSyncExternalStore with a false server snapshot (same shape as
 *  PlaybookChecklist) so the server and the first client render agree, then the installed
 *  value settles after hydration — no mismatch, no setState in an effect, and no write to
 *  User.getTheAppDismissed. */
export function GetTheAppCard({
  name,
  dismissed = false,
}: {
  name?: string;
  dismissed?: boolean;
} = {}) {
  const [optimisticDismissed, setOptimisticDismissed] = useState(dismissed);
  const installed = useSyncExternalStore(
    subscribeStandaloneDisplay,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot,
  );

  const className = installed ? "get-the-app-card get-the-app-card--installed" : "get-the-app-card";

  return (
    <CollapsibleCard
      title="Get the app"
      name={name}
      className={className}
      style={{ marginBottom: 18, scrollMarginTop: 24 }}
    >
      <div id="get-the-app">
        <div className="get-the-app-card-toolbar">
          <p className="card-body get-the-app-card-copy">
            {optimisticDismissed
              ? "You've added Limbic. Turn this back on if you still want install instructions."
              : "Add Limbic to your home screen or dock for a faster, full-screen experience — no app store needed."}
          </p>
          <GetTheAppToggle dismissed={dismissed} onOptimisticChange={setOptimisticDismissed} />
        </div>

        {!optimisticDismissed && <GetTheAppInstructions />}
      </div>
    </CollapsibleCard>
  );
}

function GetTheAppInstructions() {
  return (
    <div className="get-the-app-howto">
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
