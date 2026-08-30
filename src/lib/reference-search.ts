/** Shared text matcher behind the Clinical Reference search box (see
 *  components/pro/ClinicalReferenceTabs.tsx). Every tab on that page filters a flat list of
 *  its own rows/cards, so rather than each one hand-rolling a `.toLowerCase().includes()`
 *  they all normalize the query the same way here: whitespace-separated terms, all of which
 *  have to appear somewhere in the row's own text (so "knee ottawa" finds the Ottawa Knee
 *  Rules regardless of word order). Deliberately substring, not fuzzy — a clinician typing
 *  "hgb" or "acl" wants the exact abbreviation, and fuzzy matching on data this dense
 *  returns more noise than it saves. */
export type SearchTerms = string[];

/** Split a raw query box value into the terms every match has to satisfy. An empty/blank
 *  query yields no terms, which `matchesSearch` treats as "everything matches". */
export function searchTerms(query: string): SearchTerms {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

/** True when every term appears in the joined haystack. Parts may be strings or string
 *  arrays (tag lists, drug examples) — nested arrays are flattened, empties dropped. */
export function matchesSearch(terms: SearchTerms, ...parts: (string | readonly string[] | null | undefined)[]): boolean {
  if (terms.length === 0) return true;
  const haystack = parts
    .flat()
    .filter((p): p is string => typeof p === "string" && p.length > 0)
    .join(" ")
    .toLowerCase();
  return terms.every((term) => haystack.includes(term));
}
