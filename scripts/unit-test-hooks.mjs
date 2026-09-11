/** Resolve @/ to src/ and add .ts/.tsx onto extensionless relative imports so
 *  `node --experimental-strip-types --test` can load the same modules Next bundles.
 *  Registered by scripts/register-unit-test-loader.mjs. */
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = path.join(process.cwd(), "src");

function existingFile(base) {
  const candidates = path.extname(base) ? [base] : [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`];
  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    if (statSync(candidate).isFile()) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const file = existingFile(path.join(SRC, specifier.slice(2)));
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  if (context.parentURL && (specifier.startsWith("./") || specifier.startsWith("../")) && !path.extname(specifier)) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const file = existingFile(path.join(parentDir, specifier));
    if (file) return { url: pathToFileURL(file).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
