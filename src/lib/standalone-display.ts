/** True when Limbic is running as an installed home-screen/desktop app rather than a
 *  browser tab. `display-mode: standalone` covers Android Chrome and desktop Chrome/Edge;
 *  iOS Safari does not report that media query and needs `navigator.standalone` instead.
 *
 *  Presentation-only — callers must not persist this as `User.getTheAppDismissed`. Someone
 *  who later opens the site in a normal tab should still see the Get the App card. */
export function isStandaloneDisplay(
  win: Pick<Window, "matchMedia" | "navigator"> = window,
): boolean {
  try {
    if (win.matchMedia("(display-mode: standalone)").matches) return true;
  } catch {
    // jsdom / incomplete stubs — fall through to the iOS property.
  }
  return Boolean((win.navigator as Navigator & { standalone?: boolean }).standalone);
}
