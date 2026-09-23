#!/usr/bin/env python3
"""Look every chapter in refs.GROUPS up in PubMed and write refs.json.

Only an exact title match is accepted, so a renamed or withdrawn chapter fails loudly here
rather than being silently replaced by a neighbour with a similar title.
"""
import html, json, re, time
import refs
from sp import search

def norm(t):
    return re.sub(r"[^a-z0-9]+", " ", html.unescape(t).lower()).strip()

try:
    out = json.load(open("refs.json"))
except FileNotFoundError:
    out = {}
missing = []
for _, entries in refs.GROUPS:
    for key, title in entries:
        if title is None or (key in out and norm(out[key]["title"]) == norm(title)):
            continue
        hits = [r for r in search(" AND ".join("%s[Title]" % w for w in re.findall(r"[A-Za-z]{3,}", title)
                                  if w.lower() not in ("and", "the")) + ' AND "StatPearls"[Book]', 20, raw=True)
                if norm(r["title"]) == norm(title)]
        if not hits:
            missing.append((key, title))
        else:
            r = hits[0]
            r["title"] = html.unescape(r["title"])
            r["authors"] = [html.unescape(a) for a in r["authors"]]
            out[key] = r
            print("%-12s %s %s %s" % (key, r["year"], r["nbk"], ", ".join(r["authors"][:2])))
        time.sleep(0.4)
json.dump(out, open("refs.json", "w"), indent=1, ensure_ascii=False)
if missing:
    raise SystemExit("not found: %r" % missing)
