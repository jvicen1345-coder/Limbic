#!/usr/bin/env python3
"""Mimic the guide's own citation linker and report anything that would not resolve.

Mirrors the logic in the template's <script>: index every reference entry by every name
word + year, then match each .src span's "Surname YYYY" against that index.
"""
import pathlib, re, sys, unicodedata

def fold(t):
    return "".join(c for c in unicodedata.normalize("NFD", t)
                   if unicodedata.category(c) != "Mn").lower()

D = pathlib.Path(__file__).resolve().parent
path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else (
    D.parents[1] / "content/playbooks/neuro-examination.html")
s = path.read_text(encoding="utf-8")
refs = re.search(r'<section id="refs">(.*?)</section>', s, re.S).group(1)

by_key, by_sur = {}, {}
entries = re.findall(r'<li>(.*?)</li>', refs, re.S)
for i, li in enumerate(entries):
    au = re.search(r'<span class="au">(.*?)</span>', li, re.S)
    jo = re.search(r'<span class="jo">(.*?)</span>', li, re.S)
    if not au or not jo:
        print("REF %d MISSING .au or .jo" % (i + 1)); continue
    yr = re.search(r'(19|20)\d{2}', re.sub(r"<[^>]+>", "", jo.group(1)))
    yr = yr.group(0) if yr else None
    names = []
    for part in re.sub(r"<[^>]+>", "", au.group(1)).split(","):
        for w in part.split():
            w = re.sub(r"[^A-Za-zÀ-ɏ'’\-]", "", w)
            if len(w) >= 2 and (w != w.upper() or len(w) >= 4):
                names.append(fold(w))
    for nm in names:
        if yr:
            by_key.setdefault(nm + "|" + yr, i + 1)
        by_sur[nm] = None if nm in by_sur and by_sur[nm] != i + 1 else i + 1

UP, LO = "A-ZÀ-ɏ", "A-Za-zÀ-ɏ'’\\-"
AUTHOR = re.compile("([%s][%s]+(?:\\s*&\\s*[%s][%s]+)?)(\\s+)((?:19|20)\\d{2})" % (UP, LO, UP, LO))
NOSRC = re.compile(r"no traceable source|not checked against|could not be traced", re.I)
STAT = re.compile(r"\bSn\b|\bSp\b|\+LR|\bDOR\b|\bICC\b")

linked, unlinked, flagged, statified = 0, [], 0, 0
for span in re.findall(r'<span class="src">(.*?)</span>', s, re.S):
    txt = re.sub(r"<[^>]+>", "", span)
    if STAT.search(txt) and not AUTHOR.search(txt):
        statified += 1; continue
    if NOSRC.search(txt):
        flagged += 1; continue
    hits = list(AUTHOR.finditer(txt))
    if not hits:
        word = re.search(r"[A-ZÀ-Þ][A-Za-zÀ-ÿ'’\-]+", txt)
        if word and by_sur.get(fold(word.group(0))):
            linked += 1
        else:
            unlinked.append(txt.strip() + "  (no year, no unique surname)")
        continue
    for m in hits:
        first = re.split(r"\s*&\s*", m.group(1))[0]
        if by_key.get(fold(first) + "|" + m.group(3)):
            linked += 1
        else:
            unlinked.append(m.group(0))

used = set()
for span in re.findall(r'<span class="src">(.*?)</span>', s, re.S):
    txt = re.sub(r"<[^>]+>", "", span)
    for m in AUTHOR.finditer(txt):
        k = fold(re.split(r"\s*&\s*", m.group(1))[0]) + "|" + m.group(3)
        if k in by_key:
            used.add(by_key[k])
orphans = [i + 1 for i in range(len(entries)) if i + 1 not in used]

print("references      :", len(entries))
print("linked          :", linked, "(e2e requires > 100)")
print("unlinked        :", unlinked or "none")
print("flagged nosrc   :", flagged)
print("styled as stat  :", statified)
print("orphan refs     :", orphans or "none")
sys.exit(1 if unlinked or orphans or linked <= 100 else 0)
