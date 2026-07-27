import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const client = new Anthropic();

const QuerySchema = z.object({
  query: z
    .string()
    .describe(
      "A single well-formed PubMed search query using field tags such as [Title/Abstract] " +
        "or [MeSH Terms] and boolean operators (AND/OR/NOT). No explanation, just the query."
    ),
});

/** Turns a clinician's plain-language description ("hip fractures in elderly patients,
 *  post-surgical") into a proper PubMed query. Cheap, single-turn, no tools/streaming
 *  needed — falls back to the raw description if the API call fails for any reason, so a
 *  transient outage degrades to a plain-text PubMed search rather than breaking the page. */
export async function generatePubmedQuery(description: string): Promise<string> {
  try {
    const message = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 512,
      output_config: {
        effort: "low",
        format: zodOutputFormat(QuerySchema),
      },
      system:
        "You translate a physical therapist's plain-language description of a topic into a " +
        "single, well-formed PubMed search query using field tags and boolean operators. Keep " +
        "it focused on physical therapy / rehabilitation literature specifically — add " +
        '("physical therapy"[Title/Abstract] OR "physiotherapy"[Title/Abstract] OR ' +
        'rehabilitation[Title/Abstract]) as an AND clause unless the description is already ' +
        "clearly scoped to that literature.",
      messages: [{ role: "user", content: description }],
    });
    return message.parsed_output?.query || description;
  } catch {
    return description;
  }
}
