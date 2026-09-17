#!/usr/bin/env python3
"""Fill docs/joint-playbook-template.html with content.py — step 5 of the template doc.

The template's <style> and both <script> blocks are never touched; only the title, the
masthead, the nav, <main>, the footer and the six localStorage keys change.
"""
import html, pathlib, re
import content as K

ROOT = pathlib.Path(__file__).resolve().parents[2]
TPL = ROOT / "docs/joint-playbook-template.html"
OUT = ROOT / "content/playbooks/neuro-examination.html"
VER = "Version 1.0 &middot; September 2026"

def esc(s):
    """Content strings are trusted HTML fragments; only bare ampersands need care."""
    return re.sub(r"&(?!#?\w+;)", "&amp;", s)

# ---------------------------------------------------------------- section pieces
def sechead(num, title, note=""):
    n = '<span class="note">%s</span>' % esc(note) if note else ""
    return ('    <div class="sechead"><span class="secnum">%02d</span><h2>%s</h2>%s</div>\n'
            % (num, esc(title), n))

def lede(t):
    return '    <p class="lede">%s</p>\n' % esc(" ".join(t.split()))

def callout(kind, leadtext, body):
    cls = "callout warn" if kind == "callout-warn" else "callout"
    return ('    <div class="%s"><b>%s</b> %s</div>\n'
            % (cls, esc(leadtext), esc(" ".join(body.split()))))

def checklist_section(num):
    o = ['  <section id="checklist">\n']
    o.append(sechead(num, "The examination, in the order it is performed",
                     "check-off saves in this browser"))
    o.append(lede("""Thirty-nine competencies, ordered by dependency rather than by anatomy: each
      phase decides whether the next one can be believed. Cognition is screened before sensation
      because an inattentive patient cannot give a reliable sensory exam; sensation precedes
      coordination because a proprioceptive loss fails every coordination test for reasons that
      have nothing to do with the cerebellum. Work down it, and the findings arrive already
      interpretable."""))
    o.append('    <div class="tablewrap">\n      <table class="check-table">\n')
    o.append('        <colgroup><col style="width:4%"><col style="width:5%">'
             '<col style="width:19%"><col style="width:34%"><col style="width:38%"></colgroup>\n')
    o.append('        <thead><tr><th scope="col"></th><th scope="col">#</th>'
             '<th scope="col">Competency</th><th scope="col">How it is performed</th>'
             '<th scope="col">Finding</th></tr></thead>\n        <tbody>\n')
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
                    html.escape(imp, quote=True), esc(finding)))
    o.append('        </tbody>\n      </table>\n    </div>\n')
    o.append('    <div class="progressbar"><span id="ckcount">0 / 0</span>'
             '<span class="track"><span class="fill" id="ckfill"></span></span>'
             '<span id="flagCount"></span></div>\n')
    o.append('  </section>\n\n')
    return "".join(o), i

def numbers_section(num):
    o = ['  <section id="numbers">\n']
    o.append(sechead(num, "Numbers worth knowing cold"))
    o.append(lede("""Every cell here is traced to a source you can open, and the citation beside
      it says which. Where the number a reader expects to find is missing — the coma scale
      totals, the orthostatic threshold, the cognitive screen's cutoff — it is missing because
      it could not be traced, and the section that covers it says so in place."""))
    o.append('    <div class="numgrid">\n')
    for v, k in K.NUMBERS:
        o.append('      <div class="numcell"><span class="v">%s</span><span class="k">%s</span></div>\n'
                 % (esc(v), esc(k)))
    o.append('    </div>\n  </section>\n\n')
    return "".join(o)

def content_section(sec, num):
    o = ['  <section id="%s">\n' % sec["id"]]
    o.append(sechead(num, sec["title"], sec.get("note", "")))
    o.append(lede(sec["lede"]))
    for block in sec["blocks"]:
        if block[0] == "table":
            _, cols, rows = block
            o.append('    <div class="tablewrap">\n      <table>\n')
            o.append('        <thead><tr><th scope="col">Item</th><th scope="col">%s</th>'
                     '<th scope="col">%s</th></tr></thead>\n        <tbody>\n'
                     % (esc(cols[0]), esc(cols[1])))
            for name, how, finding, imp in rows:
                o.append('      <tr>\n        <td class="name">%s</td>\n        <td>%s</td>\n'
                         '        <td data-imp="%s">%s</td>\n      </tr>\n'
                         % (esc(name), esc(how), html.escape(imp, quote=True), esc(finding)))
            o.append('        </tbody>\n      </table>\n    </div>\n')
        elif block[0] == "figure":
            o.append(block[1])
        else:
            o.append(callout(block[0], block[1], block[2]))
    o.append('  </section>\n\n')
    return "".join(o)

def drill_section(num, planner_html):
    o = ['  <section id="drill">\n']
    o.append(sechead(num, "Rapid drill"))
    o.append(lede("""Twenty-two questions over the whole examination. Answer before you open one —
      the answer is hidden until clicked, and the point of the format is the attempt, not the
      reading."""))
    o.append(planner_html)
    o.append('    <div class="tablewrap">\n      <table>\n')
    o.append('        <thead><tr><th scope="col">Question</th><th scope="col">Answer</th>'
             '</tr></thead>\n        <tbody>\n')
    for q, a, imp in K.DRILL:
        o.append('      <tr>\n        <td class="name">%s</td>\n'
                 '        <td data-imp="%s">%s</td>\n      </tr>\n'
                 % (esc(q), html.escape(imp, quote=True), esc(a)))
    o.append('        </tbody>\n      </table>\n    </div>\n  </section>\n\n')
    return "".join(o)

def refs_section(keep):
    o = ['  <section id="refs">\n    <h2>References</h2>\n']
    o.append(lede("""Every source named in this guide, with a link. All are free to read or carry
      a freely readable abstract holding the values quoted here. A value marked as convention
      appears in no entry below, because nothing stands behind it — and a value flagged as
      having no traceable source appears in none either, because it was searched for and not
      found. The build record is in docs/neuro-guide-build/sources.md."""))
    for group, entries in K.REFS:
        o.append('    <h3>%s</h3>\n    <ol>\n' % esc(group))
        for au, ti, url, jo, nt in entries:
            o.append('      <li><span class="au">%s</span> <span class="ti">'
                     '<a href="%s" target="_blank" rel="noopener">%s</a></span>. '
                     '<span class="jo">%s</span><span class="nt">%s</span></li>\n'
                     % (esc(au), url, esc(ti), esc(jo), esc(nt)))
        o.append('    </ol>\n')
    o.append(keep)
    o.append('  </section>\n')
    return "".join(o)

# ---------------------------------------------------------------- assembly
def main():
    tpl = TPL.read_text(encoding="utf-8")

    # the practice planner and its two study-method citations are template machinery: lift
    # them out of the template's drill section and put them back unchanged.
    m = re.search(r'(    <h3>What to practice</h3>.*?</div>\n)(?=\n|\s*<div class="tablewrap">)',
                  tpl, re.S)
    if not m:
        raise SystemExit("planner block not found in template")
    planner = m.group(1)

    m = re.search(r'(    <!-- These two are cited by the practice planner.*?</ol>\n)', tpl, re.S)
    if not m:
        raise SystemExit("study-method reference group not found in template")
    keep_refs = m.group(1)

    # ---- main
    parts, num = [], 0
    num += 1; chk, items = checklist_section(num); parts.append(chk)
    num += 1; parts.append(numbers_section(num))
    for sec in K.SECTIONS:
        num += 1; parts.append(content_section(sec, num))
    num += 1; parts.append(drill_section(num, planner))
    parts.append(refs_section(keep_refs))
    body = "<main id=\"main\">\n\n" + "".join(parts) + "\n  </main>"

    out = re.sub(r'<main id="main">.*?</main>', lambda _: body, tpl, count=1, flags=re.S)

    # ---- head, masthead, nav
    out = out.replace("<title>JOINT Examination Playbook</title>",
                      "<title>Neurologic Examination Playbook</title>")
    out = out.replace("<h1>JOINT Examination Playbook</h1>",
                      "<h1>Neurologic Examination Playbook</h1>")
    out = out.replace(
        '<p class="eyebrow">Discipline &middot; scope of the guide <span class="ver">Version 1.0 &middot; MONTH YEAR</span></p>',
        '<p class="eyebrow">Neurologic physical therapy &middot; the adult neurologic screen '
        '<span class="ver">%s</span></p>' % VER)
    out = out.replace(
        """<p>One paragraph on what this guide is. Keep the last sentence:
      <b>This is a study aid for examination preparation, not a clinical reference</b> - check any
      value against current literature before it weights a decision about a patient.</p>""",
        """<p>The adult neurologic examination in the order it is performed, where the order is
      set by dependency: each phase decides whether the next one can be believed. Every value
      says where it came from &mdash; what a freely readable paper actually measured, what is
      only convention, and what could not be traced to anything at all, which in this
      examination is a great deal.
      <b>This is a study aid for examination preparation, not a clinical reference</b> - check any
      value against current literature before it weights a decision about a patient.</p>""")

    navlinks = ['    <a href="#checklist">%d Items</a>\n' % items,
                '    <a href="#numbers">Numbers</a>\n']
    for sec in K.SECTIONS:
        navlinks.append('    <a href="#%s">%s</a>\n' % (sec["id"], esc(sec["nav"])))
    navlinks.append('    <a href="#drill">Drill</a>\n    <a href="#refs">Refs</a>\n')
    out = re.sub(r'(<div class="navlinks">\n).*?(    </div>\n)',
                 lambda m: m.group(1) + "".join(navlinks) + m.group(2), out, count=1, flags=re.S)

    # ---- footer
    out = re.sub(
        r'<footer>.*?</footer>',
        lambda _: """<footer>
    <b>About this guide.</b> <span class="ver" style="margin:0 8px 0 0; padding:0; border:0">%s</span>
    The examination order, the phase structure, the localization table and every "what fakes a
    result" note are original to this guide. The scored values are not: the sensory and motor
    scoring is quoted from the international standards for classifying spinal cord injury
    (Rupp 2021), the outcome-measure recommendations and their reliability, SEM, MDC and
    ceiling figures from the Academy of Neurologic Physical Therapy's core outcome measures
    guideline (Moore 2018), the reflex scale and the Babinski accuracy figures from Morimoto
    2024, the Modified Ashworth reliability from Bohannon 1987 and Pu&scaron;nik 2026, the
    neglect prevalence from Salti 2026, and the stroke-scale reliability-versus-validity
    finding from Brott 1989.
    Much of the classical neurologic examination is taught everywhere and measured nowhere, and
    this guide marks those values <b>Convention</b> rather than dressing them as evidence.
    Where a number could not be traced to any freely readable source at all &mdash; the coma
    scale totals, the orthostatic threshold, the cognitive screen cutoffs, the tuning fork
    frequency, the named stages of motor recovery &mdash; it is flagged in place instead of
    filled in. The full build record, including what was read and rejected, is in
    docs/neuro-guide-build/sources.md.
    Verify against current literature before letting any of it weight a clinical decision.
  </footer>""" % VER, out, count=1, flags=re.S)

    # ---- storage keys: shared origin, so these must not collide with another guide
    out = out.replace("JOINT-", "neuro-")

    OUT.write_text(out, encoding="utf-8")
    print("wrote %s  (%d bytes, %d checklist items)" % (OUT, len(out), items))

if __name__ == "__main__":
    main()
