#!/usr/bin/env python3
"""Search Europe PMC restricted to free full text; print title/authors/ids."""
import json, sys, urllib.parse, urllib.request
q = sys.argv[1] + " AND (OPEN_ACCESS:Y OR IN_EPMC:Y)"
n = int(sys.argv[2]) if len(sys.argv) > 2 else 5
url = ("https://www.ebi.ac.uk/europepmc/webservices/rest/search?query="
       + urllib.parse.quote(q) + "&resultType=core&format=json&pageSize=%d" % n)
with urllib.request.urlopen(url, timeout=90) as r:
    res = json.load(r)["resultList"]["result"]
for x in res:
    ji = x.get("journalInfo", {})
    print("-" * 90)
    print("T:", x.get("title"))
    print("A:", (x.get("authorString") or "")[:150])
    print("J:", ji.get("journal", {}).get("title"), ji.get("yearOfPublication"),
          "| PMID", x.get("pmid"), "| PMCID", x.get("pmcid"))
