/** A fresh, unpredictable seed per call — used to vary Home's grid shuffle across server
 *  renders (see components/HomeFeed.tsx's refreshSeed prop and app/(app)/page.tsx).
 *
 *  Deliberately not inlined at the call site: eslint-plugin-react-hooks' purity rule flags
 *  direct calls to Math.random/Date.now inside a component body, since a client component's
 *  render function can be called multiple times without committing and is expected to be
 *  idempotent. That concern doesn't apply here — page.tsx is a Server Component that
 *  re-executes fresh once per request (including on RefreshHomeFeedButton's
 *  router.refresh()) — but the lint rule can't tell the difference, so the impurity lives
 *  in this one small, clearly-named helper instead of inline in the page.
 */
export function randomSeed(): number {
  return Math.random();
}
