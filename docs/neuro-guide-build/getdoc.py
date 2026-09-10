#!/usr/bin/env python3
"""Full text of a PMC article: Europe PMC XML if exposed, else the PMC HTML page."""
import re, subprocess, sys, urllib.request
def clean(s):
    s = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", " ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"&#x2013;|&#8211;|&ndash;", "-", s)
    s = re.sub(r"&#x2264;|&le;", "<=", s)
    s = re.sub(r"&#x2265;|&ge;", ">=", s)
    s = re.sub(r"&nbsp;|&#xa0;", " ", s)
    s = re.sub(r"&amp;", "&", s)
    s = re.sub(r"&#x[0-9A-Fa-f]+;|&[a-zA-Z]+;", " ", s)
    s = re.sub(r"[ \t]+", " ", s)
    return re.sub(r"\n\s*\n+", "\n", s)
pmcid = sys.argv[1]
try:
    with urllib.request.urlopen(
        f"https://www.ebi.ac.uk/europepmc/webservices/rest/{pmcid}/fullTextXML", timeout=120) as r:
        print(clean(r.read().decode("utf-8", "replace"))); sys.exit(0)
except Exception:
    pass
html = subprocess.run(["curl", "-sS", "--max-time", "60", "-A", "Mozilla/5.0 (research)",
                       f"https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/"],
                      capture_output=True, text=True).stdout
print(clean(html))
