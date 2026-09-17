/** Registers the @/ and extensionless-relative resolver used by `npm run test:unit`.
 *  node:test does not honor tsconfig paths, and outcome-benchmarks.ts is server-only, so
 *  the patient-progress helper is imported from tests through this loader instead of
 *  through Next's bundler. */
import { register } from "node:module";

register("./unit-test-hooks.mjs", import.meta.url);

