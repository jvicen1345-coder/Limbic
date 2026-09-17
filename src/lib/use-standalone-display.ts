import { useSyncExternalStore } from "react";
import { isStandaloneDisplay, subscribeStandaloneDisplay } from "./standalone-display";

function getSnapshot() {
  return isStandaloneDisplay();
}

/** Always false on the server and during hydration so markup matches. The real
 *  display-mode / navigator.standalone value settles after hydration.
 *
 *  iOS Safari may briefly paint Get-the-App UI before `navigator.standalone` is read —
 *  that is the hydration-safe tradeoff, not a bug to paper over. */
function getServerSnapshot() {
  return false;
}

/** Client-only. False during SSR/hydration; true once running as an installed app. */
export function useStandaloneDisplay(): boolean {
  return useSyncExternalStore(subscribeStandaloneDisplay, getSnapshot, getServerSnapshot);
}
