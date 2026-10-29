import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

/**
 * Turns a reader's own words into the words the playbooks actually use, so cross-playbook
 * search can answer a query the corpus never phrases that way.
 *
 * This is the layer that earns its place on a measured failure. "knee gives way" appears
 * nowhere in the knee guide — the guide calls that instability — so BM25 answered it with
 * three *shoulder* rows about the arm giving way, which is correct retrieval and a useless
 * result. Expanding to the vocabulary the document uses (instability, pivot shift, Lachman)
 * fixes it, where no amount of re-weighting could.
 *
 * It expands rather than rewrites. The returned terms are added to the reader's own, weighted
 * below them (see EXPANSION_WEIGHT in lib/playbook-search.ts), because the queries this
 * corpus answers best are exact ones — a test name, a decimal value, an abbreviation — and a
 * layer that replaced the query would break those to fix the paraphrases. It also only runs
 * when lexical search could not cover the query as typed, so an exact query never pays the
 * latency or the risk.
 *
 * Failure is not an error state here: an outage, a rate limit or a malformed response all
 * return no terms, and search carries on lexically. That is the same contract
 * lib/ai-pubmed-query.ts documents for the PubMed query generator — degrade rather than
 * break the page — and it is why the single catch below is deliberate rather than lazy:
 * every failure mode has the identical remedy, so there is nothing for a typed error chain
 * to decide.
 */

const client = new Anthropic();

const ExpansionSchema = z.object({
  terms: z
    .array(z.string())
    .describe(
      "Between 3 and 10 single words or two-word phrases that would appear verbatim in a " +
        "musculoskeletal physical therapy examination reference discussing this query. " +
        "Prefer the formal term a textbook uses over the lay phrasing, and include the " +
        "names of the specific tests or structures involved. No explanations, no sentences."
    ),
});

/** How many terms to accept back. The model is asked for 3–10; this is the hard ceiling in
 *  case it returns more, since every extra term is extra scoring work and extra chance of
 *  pulling in an unrelated region. */
const MAX_TERMS = 10;

const SYSTEM =
  "You expand a physical therapy student's search query into the vocabulary that a " +
  "musculoskeletal examination reference would actually use, so a keyword search over such " +
  "a reference can find the relevant passage.\n\n" +
  "The documents being searched are regional examination guides — shoulder, knee, hip, " +
  "ankle, neurologic, joint mobilization, and muscle origin/insertion/nerve/action — written " +
  "in clinical language: named special tests, named structures, sensitivity and specificity " +
  "values, grading scales.\n\n" +
  "Return the terms those documents would use for what the reader is asking about. If the " +
  "reader describes a symptom in lay terms, give the clinical name for it and the tests that " +
  "assess it. If the reader names a structure, give the tests and findings associated with " +
  "it. Do not restate the reader's own words, do not explain anything, and do not invent " +
  "test names you are not confident exist.";

/**
 * Asks for the document's words for this query. Returns `[]` on any failure, and on any
 * response that parsed but carried nothing usable.
 */
export async function expandPlaybookQuery(query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const message = await client.messages.parse({
      model: "claude-opus-5-5",
      // Thinking cannot be disabled on this model, so the ceiling has to leave room for it
      // as well as for the short array. A truncated response fails the parse and falls
      // through to the empty return below, which costs the reader nothing but the expansion.
      max_tokens: 4096,
      output_config: {
        // A vocabulary lookup is not a reasoning task, and this call sits in the latency
        // path of a search box.
        effort: "low",
        format: zodOutputFormat(ExpansionSchema),
      },
      system: SYSTEM,
      messages: [{ role: "user", content: trimmed }],
    });

    const terms = message.parsed_output?.terms ?? [];
    const seen = new Set<string>();
    for (const term of terms) {
      const clean = term.trim().toLowerCase();
      // Drop anything that is not a term: an empty string, a sentence the model wrote
      // despite being asked not to, or a word the reader already typed.
      if (!clean || clean.length > 40 || clean.split(/\s+/).length > 3) continue;
      seen.add(clean);
      if (seen.size >= MAX_TERMS) break;
    }
    return [...seen];
  } catch {
    return [];
  }
}
