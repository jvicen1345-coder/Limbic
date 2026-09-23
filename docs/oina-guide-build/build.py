#!/usr/bin/env python3
"""Fill docs/joint-playbook-template.html with the OINA content — step 5 of the template doc.

Both template <script> blocks are never touched. Changed: the title, the masthead, the
provenance key, the nav (including a link back into Limbic), <main>, the footer, the six
localStorage keys, one CSS rule (figure label colours) that the hip and shoulder guides also
correct, and the sticky-table-header style and script from docs/playbook_sticky_headers.py.

Run resolve.py first (it needs the network); this script does not.
"""
import html, json, pathlib, re, unicodedata
import common, content as K, refs as R
import ul, ll, axial, head, relations
import sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
import playbook_sticky_headers as sticky

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
TPL = ROOT / "docs/joint-playbook-template.html"
OUT = ROOT / "content/playbooks/muscle-oina.html"
VER = "Version 1.0 &middot; September 2026"

MUSCLE_SECTIONS = ul.SECTIONS + ll.SECTIONS + axial.SECTIONS + head.SECTIONS

# Relationship rows that are also where a chapter covering the whole group is cited.
REL_REFS = {
    "Scapular upward rotation force couple": ["trapezius", "serratus"],
    "Rotator cuff (SITS)": ["cuff"],
    "Deltoid–rotator cuff force couple": ["deltoid", "cuff"],
    "Lady between two majors": ["lat", "tmajor", "pecmajor"],
    "Elbow flexor trio": ["armm"],
    "Anatomical snuffbox": ["snuffbox"],
    "Thenar eminence": ["thenar"],
    "Hypothenar eminence": ["handm"],
    "Intrinsic-plus: lumbricals and interossei": ["intrinsic"],
    "Deep six lateral rotators": ["piriformis", "gemelli", "obturator"],
    "Quadriceps": ["antthigh", "vl"],
    "Hamstrings": ["hamstring", "postthigh"],
    "Pes anserinus (Say Grace before Tea)": ["thigh"],
    "Hip adductors": ["medthigh"],
    "Triceps surae": ["calf"],
    "Anterior compartment — foot drop": ["antcomp"],
    "Lateral compartment — evertors": ["latcomp"],
    "Abdominal wall": ["abwall"],
    "Erector spinae (I Love Spaghetti)": ["back"],
    "Scalenes and the thoracic outlet": ["scalene"],
    "Suboccipital triangle": ["subocc"],
    "Jaw closers and openers": ["masseter", "latpt"],
    "Hyoid elevators and depressors": ["suprahyoid", "sternohyoid"],
    "Muscles of breathing": ["diaphragm"],
    "Abdominal canister": ["pelvicfloor"],
}

def esc(s):
    """Content strings are trusted HTML fragments; only bare ampersands need care."""
    return re.sub(r"&(?!#?\w+;)", "&amp;", s)

def squash(s):
    return " ".join(s.split())

def fold(t):
    return "".join(c for c in unicodedata.normalize("NFD", t) if not unicodedata.combining(c)).lower()

# ---------------------------------------------------------------- references and citation names
DB = json.loads((HERE / "refs.json").read_text(encoding="utf-8"))

def raw_entries():
    """Every reference entry: (group, key, authors, title, url, jo, year, note)."""
    out = []
    for group, entries in R.GROUPS:
        for key, _title in entries:
            if key == "isncsci":
                r = R.ISNCSCI
                out.append((group, key, r["authors"], r["title"], r["url"], r["jo"], r["year"], r["note"]))
            else:
                r = DB[key]
                out.append((group, key, r["authors"], r["title"],
                            "https://www.ncbi.nlm.nih.gov/books/%s/" % r["nbk"],
                            "StatPearls %s; PMID %s; %s" % (r["year"], r["pmid"], r["nbk"]),
                            r["year"], None))
    return out

def linker_words(au):
    """The template's citation linker indexes every name word of an entry — reproduced here
    so a citation name can be chosen that the linker will send to the right entry."""
    words = []
    for part in au.split(","):
        for w in part.strip().split():
            w = re.sub(r"[^A-Za-zÀ-ɏ'’\-]", "", w)
            if len(w) >= 2 and (w != w.upper() or len(w) >= 4):
                words.append(fold(w))
    return words

def surnames(au):
    """(display surname, the word the linker will match it on) for each author, in order."""
    out = []
    for a in au:
        surname = re.sub(r"\s+[A-Z]{1,4}$", "", a.strip())   # drop trailing initials
        out.append((surname, fold(re.sub(r"[^A-Za-zÀ-ɏ'’\-]", "", surname.split()[-1]))))
    return out

def order_and_name(entries, fixed):
    """The linker sends "Surname Year" to the FIRST entry in the list that carries that name and
    year in any author position. So list order decides what can be cited: an entry is citable
    only by a name no earlier entry carries. Place entries greedily — at each step the one with
    the fewest names still unclaimed — and cite each by its first unclaimed author.

    The first group (grading and the spinal cord standard) keeps its place at the top; the
    anatomy chapters are ordered by this rule. `fixed` holds the template's own study-method
    entries, which sit after all of these and must stay reachable by their first authors."""
    head_group = entries[0][0]
    placed = [e for e in entries if e[0] == head_group]
    rest = [e for e in entries if e[0] != head_group]
    claimed, names = set(), {}
    def place(e, name):
        names[e[1]] = "%s %s" % (name, e[6])
        claimed.update(w + "|" + e[6] for w in linker_words(", ".join(e[2])))
    for e in placed:
        place(e, surnames(e[2])[0][0])
    keys = {e[1]: set(w + "|" + e[6] for w in linker_words(", ".join(e[2]))) for e in rest}
    def avail(e, cl):
        return [sn for sn, w in surnames(e[2]) if w + "|" + e[6] not in cl]
    # Greedy: at each step place the entry whose names, once claimed, leave the fewest other
    # entries with nothing left to be cited by; then the one with the fewest names left.
    order = list(placed)
    while rest:
        best = None
        for e in rest:
            a = avail(e, claimed)
            if not a:
                continue
            nxt = claimed | keys[e[1]]
            damage = sum(1 for o in rest if o is not e and avail(o, claimed) and not avail(o, nxt))
            score = (damage, len(a), len(e[2]), fold(e[2][0]))
            if best is None or score < best[0]:
                best = (score, e, a)
        if best is None:
            raise SystemExit("no unambiguous citation name for %s" % ", ".join(e[1] for e in rest))
        _s, e, a = best
        place(e, a[0])
        order.append(e)
        rest.remove(e)
    for key, au, yr in fixed:
        if fold(au.split()[0]) + "|" + yr in claimed:
            raise SystemExit("a chapter shadows the template reference %s" % key)
    return order, names

ENTRIES = raw_entries()
# the two study-method references the template's planner cites, kept verbatim below
FIXED = [("pashler", "Pashler H, McDaniel M, Rohrer D, Bjork R", "2008"),
         ("dunlosky", "Dunlosky J, Rawson KA, Marsh EJ, Nathan MJ, Willingham DT", "2013")]
ENTRIES, NAMES = order_and_name(ENTRIES, FIXED)
USED = {}   # key -> the rows that cite it, for the reference entry's note

def cite(key, where=None):
    USED.setdefault(key, [])
    if where and where not in USED[key]:
        USED[key].append(where)
    return '<span class="src" data-ref="%s">%s</span>' % (key, esc(NAMES[key]))

def isncsci(text):
    """Every statement naming an ISNCSCI key muscle carries its citation."""
    if "ISNCSCI" in text and "Rupp 2021" not in text:
        text = re.sub(r"(ISNCSCI[^.]*?key muscle[^.]*?)(\.|$)", lambda m: m.group(1) + " " + cite("isncsci") + m.group(2), text, count=1)
    return text.replace(common.S("Rupp 2021"), cite("isncsci")).replace(common.S("Naqvi 2025"), cite("grading"))

# ---------------------------------------------------------------- section pieces
def sechead(num, title, note=""):
    n = '<span class="note">%s</span>' % esc(note) if note else ""
    return ('    <div class="sechead"><span class="secnum">%02d</span><h2>%s</h2>%s</div>\n'
            % (num, esc(title), n))

def lede(t):
    return '    <p class="lede">%s</p>\n' % esc(squash(t))

def callout(kind, leadtext, body):
    cls = "callout warn" if kind == "warn" else "callout"
    return '    <div class="%s"><b>%s</b> %s</div>\n' % (cls, esc(leadtext), esc(squash(body)))

STOP = {"muscle", "muscles", "group", "test", "hand", "foot", "head", "part", "with", "major",
        "minor", "longus", "brevis", "anterior", "posterior", "superior", "inferior", "medial",
        "lateral", "deep", "superficial", "the", "and", "tested"}

def imp_for(m):
    """PDF-importer keywords: the muscle's own name words, its nerve, and one generic word."""
    words = [w.lower() for w in re.findall(r"[A-Za-z]{4,}", m.name) if w.lower() not in STOP]
    nerve = re.findall(r"[A-Za-z]{5,}", re.sub(r"<[^>]+>", "", m.n))
    terms = words[:2] + [w.lower() for w in nerve[:1] if w.lower() not in words]
    if not any(len(t) >= 6 for t in terms):
        terms.append(re.findall(r"[a-z]{6,}", m.a.lower())[0])
    terms = list(dict.fromkeys(terms))[:4] + ["test"]
    return "|".join(terms)

def muscle_section(sec, num, figure=None):
    o = ['  <section id="%s">\n' % sec["id"]]
    o.append(sechead(num, sec["title"], sec.get("note", "")))
    o.append(lede(sec["lede"]))
    o.append('    <div class="tablewrap">\n      <table class="fixed">\n')
    o.append('        <colgroup><col style="width:13%"><col style="width:13%"><col style="width:12%">'
             '<col style="width:12%"><col style="width:15%"><col style="width:21%"><col style="width:14%"></colgroup>\n')
    o.append('        <thead><tr><th scope="col">Muscle</th><th scope="col">Origin</th>'
             '<th scope="col">Insertion</th><th scope="col">Nerve (roots)</th>'
             '<th scope="col">Action</th><th scope="col">Manual muscle test</th>'
             '<th scope="col">What fakes it</th></tr></thead>\n        <tbody>\n')
    n = 0
    for group, rows in sec["groups"]:
        o.append('      <tr class="group"><td colspan="7">%s</td></tr>\n' % esc(group))
        for m in rows:
            n += 1
            o.append('      <tr>\n'
                     '        <td class="name">%s %s</td>\n'
                     '        <td>%s</td>\n        <td>%s</td>\n        <td>%s</td>\n        <td>%s</td>\n'
                     '        <td data-imp="%s">%s</td>\n'
                     '        <td>%s</td>\n'
                     '      </tr>\n'
                     % (esc(m.name), cite(m.ref, m.name), esc(m.o), esc(m.i), esc(isncsci(m.n)),
                        esc(isncsci(m.a)), html.escape(m.imp or imp_for(m), quote=True),
                        esc(isncsci(m.test)), esc(isncsci(m.fake))))
    o.append('        </tbody>\n      </table>\n    </div>\n')
    if figure:
        o.append(figure)
    o.append('  </section>\n\n')
    return "".join(o), n

def relation_section(sec, num, first_col, figure=None):
    o = ['  <section id="%s">\n' % sec["id"]]
    o.append(sechead(num, sec["title"], sec.get("note", "")))
    o.append(lede(sec["lede"]))
    if figure:
        o.append(figure)
    cols = sec["cols"]
    o.append('    <div class="tablewrap">\n      <table>\n')
    o.append('        <thead><tr><th scope="col">%s</th>%s</tr></thead>\n        <tbody>\n'
             % (esc(first_col), "".join('<th scope="col">%s</th>' % esc(c) for c in cols)))
    for group, rows in sec["blocks"]:
        o.append('      <tr class="group"><td colspan="%d">%s</td></tr>\n' % (len(cols) + 1, esc(group)))
        for row in rows:
            name, cells = row[0], list(row[1:])
            assert len(cells) == len(cols), (sec["id"], name)
            if name in REL_REFS:
                cells[0] += " " + " ".join(cite(k, name) for k in REL_REFS[name])
            words = [w.lower() for w in re.findall(r"[A-Za-z]{5,}", name)][:3]
            if not any(len(w) >= 6 for w in words):
                words += [w.lower() for w in re.findall(r"[A-Za-z]{6,}", cells[0])][:1]
            imp = "|".join(list(dict.fromkeys(words))[:4] + ["muscle"])
            o.append('      <tr>\n        <td class="name">%s</td>\n' % esc(name))
            for i, c in enumerate(cells):
                attr = ' data-imp="%s"' % html.escape(imp, quote=True) if i == len(cells) - 1 else ""
                o.append('        <td%s>%s</td>\n' % (attr, esc(isncsci(c))))
            o.append('      </tr>\n')
    o.append('        </tbody>\n      </table>\n    </div>\n  </section>\n\n')
    return "".join(o)

def checklist_section(num):
    o = ['  <section id="checklist">\n']
    o.append(sechead(num, "What to know and do, in the order you use it", "check-off saves in this browser"))
    o.append(lede("""The method first — how every manual muscle test in this guide is set up and
      graded — then each group of muscles to know cold, region by region, then the three ways of
      putting them together. Tick a group off when you can give origin, insertion, nerve, action
      and the test for every muscle in it without looking."""))
    o.append('    <div class="tablewrap">\n      <table class="check-table">\n')
    o.append('        <colgroup><col style="width:4%"><col style="width:5%">'
             '<col style="width:19%"><col style="width:34%"><col style="width:38%"></colgroup>\n')
    o.append('        <thead><tr><th scope="col"></th><th scope="col">#</th>'
             '<th scope="col">Item</th><th scope="col">What it covers</th>'
             '<th scope="col">The point to know</th></tr></thead>\n        <tbody>\n')
    i = 0
    for row in K.CHECK:
        if row[0] == "PHASE":
            o.append('      <tr class="group"><td colspan="5">%s</td></tr>\n' % esc(row[1]))
            continue
        i += 1
        name, how, finding, imp = row
        o.append('      <tr>\n'
                 '        <td class="ck"><input type="checkbox" data-ck="%d" aria-label="Mark done: %s"></td>'
                 '<td class="idx">%d</td>\n'
                 '        <td class="name">%s</td>\n'
                 '        <td>%s</td>\n'
                 '        <td data-imp="%s">%s</td>\n'
                 '      </tr>\n'
                 % (i, html.escape(name, quote=True), i, esc(name), esc(how),
                    html.escape(imp, quote=True), esc(isncsci(finding))))
    o.append('        </tbody>\n      </table>\n    </div>\n')
    o.append('    <div class="progressbar"><span id="ckcount">0 / 0</span>'
             '<span class="track"><span class="fill" id="ckfill"></span></span>'
             '<span id="flagCount"></span></div>\n')
    o.append('  </section>\n\n')
    return "".join(o), i

def numbers_section(num):
    o = ['  <section id="numbers">\n']
    o.append(sechead(num, "Numbers worth knowing cold"))
    o.append(lede("""The ten key muscles of the international spinal cord injury examination are
      the one place root levels and muscles are tied together by a published standard, so they
      are the myotomes worth memorising exactly. The last three cells are counts that come up in
      almost every question about the groups they name."""))
    o.append('    <div class="numgrid">\n')
    for v, k in K.NUMBERS:
        o.append('      <div class="numcell"><span class="v">%s</span><span class="k">%s</span></div>\n'
                 % (esc(v), esc(isncsci(k))))
    o.append('    </div>\n  </section>\n\n')
    return "".join(o)

def method_section(num):
    sec = K.METHOD
    o = ['  <section id="%s">\n' % sec["id"]]
    o.append(sechead(num, sec["title"]))
    o.append(lede(sec["lede"]))
    o.append('    <div class="tablewrap">\n      <table>\n')
    o.append('        <thead><tr><th scope="col">Grade</th><th scope="col">Definition</th>'
             '<th scope="col">What earns it</th></tr></thead>\n        <tbody>\n')
    for g, d, f in sec["rows"]:
        o.append('      <tr>\n        <td class="name">%s</td>\n        <td>%s</td>\n'
                 '        <td data-imp="grade|muscle|resistance|gravity">%s</td>\n      </tr>\n'
                 % (esc(g), esc(d), esc(isncsci(f))))
    o.append('        </tbody>\n      </table>\n    </div>\n')
    o.append(callout("warn", "A weak and painful muscle has not been graded.",
                     """Pain inhibits force, so a painful contraction produces a low grade whatever
                     the muscle's real strength. Record the pain and the grade together, and do not
                     read a painful 4 as a nerve or root finding. """ + common.C()))
    o.append(callout("note", "Most substitutions change the direction, not the effort.",
                     """The substituting muscle moves the segment along its own line of pull, so the
                     movement drifts — abduction into flexion, hip flexion into lateral rotation. Watch
                     the direction and the stabilized segment; the last column of every muscle table
                     names what to watch for. """ + common.C()))
    o.append('  </section>\n\n')
    return "".join(o)

def drill_section(num, planner_html):
    o = ['  <section id="drill">\n']
    o.append(sechead(num, "Rapid drill"))
    o.append(lede("""Twenty questions across the whole body. Answer before you open one. For
      the full OINA workout, press <b>Recall all</b> in the bar at the top: every column except
      the muscle's name blanks, and the tables become the quiz."""))
    o.append(planner_html)
    o.append('    <div class="tablewrap">\n      <table>\n')
    o.append('        <thead><tr><th scope="col">Question</th><th scope="col">Answer</th>'
             '</tr></thead>\n        <tbody>\n')
    for q, a, imp in K.DRILL:
        o.append('      <tr>\n        <td class="name">%s</td>\n'
                 '        <td data-imp="%s">%s</td>\n      </tr>\n'
                 % (esc(q), html.escape(imp, quote=True), esc(isncsci(a))))
    o.append('        </tbody>\n      </table>\n    </div>\n  </section>\n\n')
    return "".join(o)

def refs_section(keep):
    o = ['  <section id="refs">\n    <h2>References</h2>\n']
    o.append(lede("""Every source named in this guide, with a link. The anatomy chapters are the
      free StatPearls entries on NCBI Bookshelf: each muscle row cites the chapter that covers it,
      so the row can be checked against a source anyone can open. Each chapter's existence, title,
      authors, year and accession were confirmed in PubMed when the guide was built; their text
      could not be machine-read, so the rows have not yet been checked against them line by line
      (see docs/oina-guide-build/README.md). The test positions are convention and appear in no
      entry below."""))
    last, head_group = None, ENTRIES[0][0]
    for group, key, au, ti, url, jo, yr, note in ENTRIES:
        if key not in USED:
            raise SystemExit("reference %s is never cited" % key)
        if group != head_group:
            # ordered so the linker can reach every chapter (see order_and_name), not by region
            group = "Anatomy chapters — StatPearls, free on NCBI Bookshelf"
        if group != last:
            if last is not None:
                o.append('    </ol>\n')
            o.append('    <h3>%s</h3>\n    <ol>\n' % esc(group))
            last = group
        nt = note or ("Cited for: %s." % "; ".join(USED[key]) if USED[key]
                      else "Free to read on NCBI Bookshelf.")
        # a stable id, so a check can confirm each citation lands on the entry it names
        o.append('      <li id="ref-%s"><span class="au">%s</span> <span class="ti">'
                 '<a href="%s" target="_blank" rel="noopener">%s</a></span>. '
                 '<span class="jo">%s</span><span class="nt">%s</span></li>\n'
                 % (key, esc(", ".join(au)), url, esc(ti), esc(jo), esc(nt)))
    o.append('    </ol>\n')
    o.append(keep)
    o.append('  </section>\n')
    return "".join(o)

# ---------------------------------------------------------------- assembly
def main():
    tpl = TPL.read_text(encoding="utf-8")

    m = re.search(r'(    <h3>What to practice</h3>.*?</div>\n)(?=\n|\s*<div class="tablewrap">)', tpl, re.S)
    if not m:
        raise SystemExit("planner block not found in template")
    planner = m.group(1)
    m = re.search(r'(    <!-- These two are cited by the practice planner.*?</ol>\n)', tpl, re.S)
    if not m:
        raise SystemExit("study-method reference group not found in template")
    keep_refs = m.group(1)
    for fixed_key, au, yr in FIXED:
        if au not in keep_refs or yr not in keep_refs:
            raise SystemExit("template study reference changed: %s" % fixed_key)

    parts, nav, num, muscles = [], [], 0, 0
    num += 1; chk, items = checklist_section(num); parts.append(chk)
    nav.append(("checklist", "%d Items" % items))
    num += 1; parts.append(numbers_section(num)); nav.append(("numbers", "Numbers"))
    num += 1; parts.append(method_section(num)); nav.append((K.METHOD["id"], K.METHOD["nav"]))
    for sec in MUSCLE_SECTIONS:
        num += 1
        fig = K.FIG_INTEROSSEI if sec["id"] == "hand" else None
        s, n = muscle_section(sec, num, fig)
        parts.append(s); muscles += n
        nav.append((sec["id"], sec["nav"]))
    firsts = {"together": "Group", "movements": "Movement", "nerves": "Nerve"}
    for sec in relations.SECTIONS:
        num += 1
        fig = K.FIG_SCAPULA if sec["id"] == "together" else None
        parts.append(relation_section(sec, num, firsts[sec["id"]], fig))
        nav.append((sec["id"], sec["nav"]))
    num += 1; parts.append(drill_section(num, planner)); nav.append(("drill", "Drill"))
    parts.append(refs_section(keep_refs)); nav.append(("refs", "Refs"))
    body = '<main id="main">\n\n' + "".join(parts) + "\n  </main>"

    out = re.sub(r'<main id="main">.*?</main>', lambda _: body, tpl, count=1, flags=re.S)

    # ---- head, masthead, provenance key, nav
    title = "Muscle OINA &amp; Manual Muscle Testing"
    for old, new in [
        ("<title>JOINT Examination Playbook</title>", "<title>Muscle OINA and Manual Muscle Testing</title>"),
        ("<h1>JOINT Examination Playbook</h1>", "<h1>%s</h1>" % title),
        ('<p class="eyebrow">Discipline &middot; scope of the guide <span class="ver">Version 1.0 &middot; MONTH YEAR</span></p>',
         '<p class="eyebrow">Anatomy &middot; every muscle, head to foot <span class="ver">%s</span></p>' % VER),
        ("""<p>One paragraph on what this guide is. Keep the last sentence:
      <b>This is a study aid for examination preparation, not a clinical reference</b> - check any
      value against current literature before it weights a decision about a patient.</p>""",
         """<p>Origin, insertion, nerve and action for %d muscles and muscle groups, each with
      the manual muscle test that grades it and the substitution that fakes it — then the same
      muscles organised the way they are actually discussed: the named groups and force couples
      they work in, every joint movement with its prime movers and antagonists, and every motor
      nerve with the picture its loss produces. Press <b>Recall all</b> to turn every table into
      an OINA quiz.
      <b>This is a study aid for examination preparation, not a clinical reference</b> - check any
      value against current literature before it weights a decision about a patient.</p>""" % muscles),
        ("""<span><b>How to read a value.</b> Unmarked means traced to a source you can read for free, with the citation beside it.</span>""",
         """<span><b>How to read a value.</b> Unmarked anatomy is standard descriptive anatomy; the free chapter cited beside each muscle's name is the source to check it against.</span>"""),
    ]:
        if old not in out:
            raise SystemExit("template text not found: " + old[:60])
        out = out.replace(old, new)

    # a way back into Limbic: the guide is a standalone document with none of the app's chrome
    # (the other guides carry the same link; the template does not)
    back = '<div class="navrow">\n    <button class="recall-toggle"'
    if back not in out:
        raise SystemExit("nav row not found in template")
    out = out.replace(back, '<div class="navrow">\n'
                      '    <a href="/student/playbooks" title="Back to Limbic Playbooks">&larr; Limbic</a>\n'
                      '    <span class="navdiv" aria-hidden="true"></span>\n'
                      '    <button class="recall-toggle"', 1)

    # a presentation fill= loses to a CSS rule, so the template's figure text rule repaints
    # every coloured label; the hip and shoulder guides carry this same correction
    css = "figure text{font-family:var(--font-body); font-size:12px; fill:currentColor}"
    if css not in out:
        raise SystemExit("figure text rule not found in template")
    out = out.replace(css, "figure text:not([fill]){font-family:var(--font-body); font-size:12px; fill:currentColor}\n"
                      "figure text[fill]{font-family:var(--font-body); font-size:12px}", 1)

    navlinks = "".join('    <a href="#%s">%s</a>\n' % (sid, label) for sid, label in nav)
    out = re.sub(r'(<div class="navlinks">\n).*?(    </div>\n)',
                 lambda m: m.group(1) + navlinks + m.group(2), out, count=1, flags=re.S)

    # ---- footer
    out = re.sub(r'<footer>.*?</footer>', lambda _: """<footer>
    <b>About this guide.</b> <span class="ver" style="margin:0 8px 0 0; padding:0; border:0">%s</span>
    The organisation, the "what fakes it" column, the relationship tables, the drill and both
    diagrams are original to this guide. The origins, insertions, innervations and actions are
    standard descriptive anatomy written for this guide, each row citing the free StatPearls
    chapter that covers that muscle so it can be checked; they have not yet been checked against
    those chapters line by line. Where standard texts disagree — root levels for supinator, the
    long toe flexors and the plantar intrinsics, the nerve to pectineus, the split supply of
    flexor pollicis brevis — the row is marked <b>Contested</b> and says how. The 0&ndash;5 grades
    and the ten key muscles are quoted from the international spinal cord injury standard
    (Rupp 2021). Manual muscle test positions, stabilization points and grading modifiers follow
    the widely taught conventions of the standard muscle-testing texts, are marked
    <b>Convention</b>, and are not quoted from any source. The build record is in
    docs/oina-guide-build/.
    Verify against current literature before letting any of it weight a clinical decision.
  </footer>""" % VER, out, count=1, flags=re.S)

    # ---- storage keys: shared origin, so these must not collide with another guide
    out = out.replace("JOINT-", "oina-")
    if "JOINT" in out:
        raise SystemExit("template placeholder left in the page")

    out = sticky.apply(out)   # sticky table headers, shared by every guide
    OUT.write_text(out, encoding="utf-8")
    sections = len(re.findall(r'<section id="', body))
    print("wrote %s  (%d bytes, %d sections, %d checklist items, %d muscle rows, %d references)"
          % (OUT.relative_to(ROOT), len(out), sections, items, muscles,
             len(ENTRIES) + len(FIXED)))

if __name__ == "__main__":
    main()
