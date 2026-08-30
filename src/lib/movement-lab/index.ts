/**
 * Limbic Movement Lab — the single entry point every consumer imports from.
 *
 * The bank is split into one file per region under `exercises/` purely so each file stays
 * reviewable, and the aggregation/query layer lives in `catalog.ts` so `protocols.ts` can
 * look exercises up without importing this module back (see catalog.ts's own header on why
 * that cycle is worth avoiding). Nothing outside this directory should import a region file,
 * `catalog.ts`, or `protocols.ts` directly — everything comes through here.
 */

export * from "@/lib/movement-lab/types";
export * from "@/lib/movement-lab/catalog";
export * from "@/lib/movement-lab/protocols";
