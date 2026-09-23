#!/usr/bin/env python3
"""Find StatPearls anatomy chapters in PubMed and cache what can be confirmed about them.

  python3 sp.py 'deltoid'            # prints candidate chapters
Bookshelf pages and Europe PMC's reader sit behind bot walls from a fetcher, so the chapter
text itself cannot be read from here. What PubMed confirms is that the chapter exists, its
title, its authors, its year, and its NBK accession — enough to link it, not enough to say a
value is in it. See README.md.
"""
import json, sys, time, urllib.parse, urllib.request, re

E = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"

def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                return r.read().decode("utf-8")
        except Exception:
            time.sleep(2 ** i)
    raise SystemExit("failed: " + url)

def search(term, n=8, raw=False):
    q = term if raw else '(%s[Title]) AND "StatPearls"[Book]' % term
    ids = json.loads(get(E + "esearch.fcgi?db=pubmed&retmode=json&retmax=%d&term=%s"
                         % (n, urllib.parse.quote(q))))["esearchresult"]["idlist"]
    if not ids:
        return []
    time.sleep(0.4)
    x = get(E + "efetch.fcgi?db=pubmed&retmode=xml&id=" + ",".join(ids))
    out = []
    for doc in re.findall(r"<PubmedBookArticle>.*?</PubmedBookArticle>", x, re.S):
        pmid = re.search(r"<PMID[^>]*>(\d+)</PMID>", doc).group(1)
        nbk = (re.search(r'IdType="bookaccession">(NBK\d+)<', doc) or [None, None])[1]
        title = re.sub(r"<[^>]+>", "", re.search(r"<ArticleTitle[^>]*>(.*?)</ArticleTitle>", doc, re.S).group(1))
        auth = []
        al = re.search(r'<AuthorList Type="authors"[^>]*>(.*?)</AuthorList>', doc, re.S)
        for a in re.findall(r"<Author[^>]*>(.*?)</Author>", al.group(1) if al else "", re.S):
            ln = re.search(r"<LastName>(.*?)</LastName>", a)
            ini = re.search(r"<Initials>(.*?)</Initials>", a)
            if ln:
                auth.append(ln.group(1) + (" " + ini.group(1) if ini else ""))
        yr = re.findall(r"<Year>(\d{4})</Year>", doc)
        # the chapter's own last-update year, not the book's first edition
        cd = re.search(r"<ContributionDate>\s*<Year>(\d{4})</Year>", doc)
        out.append(dict(pmid=pmid, nbk=nbk, title=title, authors=auth,
                        year=cd.group(1) if cd else (max(yr) if yr else "")))
    return out

if __name__ == "__main__":
    for r in search(sys.argv[1]):
        print(r["year"], r["nbk"], r["pmid"], "|", r["title"], "|", ", ".join(r["authors"][:4]))
