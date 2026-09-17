#!/usr/bin/env python3
"""Look a paper up in Europe PMC and print what can actually be cited from it."""
import json, sys, textwrap, urllib.parse, urllib.request

def get(query, n=3):
    url = ("https://www.ebi.ac.uk/europepmc/webservices/rest/search?query="
           + urllib.parse.quote(query) + "&resultType=core&format=json&pageSize=%d" % n)
    with urllib.request.urlopen(url, timeout=60) as r:
        return json.load(r)["resultList"]["result"]

for r in get(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 3):
    ji = r.get("journalInfo", {})
    free = "FREE" if (r.get("isOpenAccess") == "Y" or r.get("inEPMC") == "Y" or r.get("inPMC") == "Y") else "abstract only"
    print("=" * 100)
    print("TITLE  :", r.get("title"))
    print("AUTHORS:", r.get("authorString"))
    print("JOURNAL:", ji.get("journal", {}).get("title"), ji.get("yearOfPublication"),
          ";%s(%s):%s" % (ji.get("volume"), ji.get("issue"), r.get("pageInfo")))
    print("IDS    : PMID", r.get("pmid"), "| PMCID", r.get("pmcid"), "| DOI", r.get("doi"))
    print("ACCESS :", free)
    ab = r.get("abstractText") or "(NO ABSTRACT INDEXED)"
    print("-" * 100)
    print(textwrap.fill(ab.replace("<h4>", " [").replace("</h4>", "] "), 100))
