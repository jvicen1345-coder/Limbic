import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Exam Prep game and atlas data: script fragments spliced into generated pages by
    // scripts/exam-prep/build.py, not modules, so their top-level names look unused here.
    "scripts/exam-prep/*/*.js",
  ]),
]);

export default eslintConfig;
