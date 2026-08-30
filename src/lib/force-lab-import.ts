import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
// Same MODEL constant convention as lib/pre-visit-brief.ts and every other AI-powered lib
// file in this codebase — the spec this was built from named "claude-opus-4-5", which
// isn't a real model id; claude-opus-5 is this app's one standing choice for every
// clinical-AI feature, vision included.
const MODEL = "claude-opus-5";

/** Strips a ```json ... ``` (or bare ```) code fence, same defensive parse as
 *  lib/pre-visit-brief.ts's own stripCodeFence — the extraction prompt below says "return
 *  only valid JSON" but a vision response is exactly as likely to wrap it in a fence as a
 *  text-only one. */
function stripCodeFence(text: string): string {
  const fenced = text.trim().match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1] : text;
}

export interface ParsedForceLabScreenshot {
  muscleGroup?: string;
  rightPeak?: number;
  leftPeak?: number;
  rightTimeToPeak?: number;
  leftTimeToPeak?: number;
  difference?: number;
  percentDiff?: number;
  unit?: string;
  confidence: number;
  rawText?: string;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type ImageMediaType = (typeof IMAGE_TYPES)[number];

/** Import Screenshot tab's extraction step (see parseScreenshot in
 *  app/actions/force-lab.ts, the only caller) — reads an ActiveForce result-screen
 *  screenshot and returns the values Force Lab's manual-entry form fields would otherwise
 *  need typed in by hand. Returns null on any failure (unsupported media type, rate limit,
 *  a non-JSON or non-text response) rather than throwing, same "don't crash the page, show
 *  a plain retry state" reasoning as every other AI call in this app — the caller's own
 *  fallback text is "Could not read screenshot. Please enter values manually." */
export async function parseForceLabScreenshot(imageBase64: string, mediaType: string): Promise<ParsedForceLabScreenshot | null> {
  if (!IMAGE_TYPES.includes(mediaType as ImageMediaType)) return null;

  try {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      output_config: { effort: "low" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as ImageMediaType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `This is a screenshot from the ActiveForce handheld dynamometer app. Extract the following values and return them as JSON:

- muscleGroup: the muscle group being tested as shown at the top of the screen
- rightPeak: the peak force value for the Right side as a number
- leftPeak: the peak force value for the Left side as a number
- rightTimeToPeak: the time to peak value for the Right side in seconds as a number
- leftTimeToPeak: the time to peak value for the Left side in seconds as a number
- difference: the Difference value shown as a number
- percentDiff: the Percent Diff value shown as a number without the percent sign
- unit: the unit of measurement shown — either "lbs" or "kg"
- confidence: your confidence in the extraction from 0.0 to 1.0
- rawText: any text you can read from the image

Return only valid JSON. If a value is not visible return null for that field.`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") return null;
    const parsed = JSON.parse(stripCodeFence(content.text));
    if (typeof parsed !== "object" || parsed === null || typeof parsed.confidence !== "number") return null;
    return parsed as ParsedForceLabScreenshot;
  } catch (error) {
    console.error("Force Lab screenshot parse failed:", error);
    return null;
  }
}
