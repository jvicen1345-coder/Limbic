#!/usr/bin/env python3
"""Build an HTML-source Exam Prep guide (a guide folder holding index.html, arcade.html
and atlas.html instead of topics.py/rest.py).

    python3 scripts/exam-prep/build_html.py cervical            # writes content/exam-prep/<slug>*.html
    python3 scripts/exam-prep/build_html.py cervical --personal OUT_DIR

The source pages are standalone study pages with relative links. The Limbic build adds
noindex, the back link, the disclaimer and absolute companion links. Both builds refuse
to run while the source contains wording that points at a class (see BANNED). Python 3
standard library only. See scripts/exam-prep/README.md.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
if len(sys.argv) < 2:
    sys.exit(__doc__)
GUIDE_DIR = os.path.join(HERE, sys.argv[1])
PERSONAL = None
if '--personal' in sys.argv:
    PERSONAL = os.path.abspath(sys.argv[sys.argv.index('--personal') + 1])

ns = {}
exec(open(os.path.join(GUIDE_DIR, 'guide.py'), encoding='utf-8').read(), ns)
CFG = ns['CFG']
SLUG = CFG['slug']
BASE = '/student/exam-prep/' + SLUG
PARTS = ['index', 'arcade', 'atlas']

# Wording that ties the text to a class rather than to published sources. Visible text
# and code comments both count: the repository is public.
BANNED = [
    r'\bthe lab\b', r'\bthis lab\b', r'\blab (?:gives|states|shows|calls|tests)\b',
    r'\blectures?\b', r'\bsyllabus\b', r'\bhandouts?\b', r'\bprofessor\b', r'\binstructor\b',
    r'\bDr\. [A-Z]', r'\bcourse(?:’s|\'s)?\b(?! of)', r'\bPT ?\d{3}\b', r'\bpt\d{3}',
    r'\bclass (?:case|notes|slides)\b', r'\bin[- ]class\b', r'\bweek \d', r'\bunpublished\b',
]


def scan(name, text):
    bad = []
    for pat in BANNED:
        for m in re.finditer(pat, text, re.I):
            bad.append('%s: %r' % (name, text[max(0, m.start() - 50):m.end() + 30]))
    return bad


def must_sub(text, old, new, count=0, name=''):
    if old not in text:
        sys.exit('build_html: %r not found in %s' % (old, name))
    return text.replace(old, new) if not count else text.replace(old, new, count)


src = {p: open(os.path.join(GUIDE_DIR, p + '.html'), encoding='utf-8').read() for p in PARTS}
problems = [b for p in PARTS for b in scan(p + '.html', src[p])]
for pfx in CFG['pfx']:
    if pfx not in src['index']:
        problems.append('storage prefix %s missing from index.html' % pfx)
if problems:
    sys.exit('build_html: fix these before building:\n  ' + '\n  '.join(problems))


def limbic(part, t):
    t, n = re.subn(r'<meta charset="?utf-?8"?>', lambda m: m.group(0) + '<meta name="robots" content="noindex, nofollow">', t, count=1, flags=re.I)
    if not n:
        sys.exit('build_html: no charset meta in %s' % part)
    if part == 'index':
        t = must_sub(t, 'href="arcade.html"', 'href="%s/arcade"' % BASE, 0, part)
        t = must_sub(t, 'href="atlas.html"', 'href="%s/atlas"' % BASE, 0, part)
        t = must_sub(t, '<nav class="jump" aria-label="Sections">',
                     '<nav class="jump" aria-label="Sections">\n  <a href="/student/exam-prep">← Limbic</a>', 1, part)
        m = re.search(r'(<p class="scope">.*?)(</p>)', t, re.S)
        if not m:
            sys.exit('build_html: no scope paragraph in index.html')
        extra = ' ' + CFG['disclaimer'] + (' ' + CFG['playbook_line'] if CFG.get('playbook_line') else '')
        t = t[:m.end(1)] + extra + t[m.end(1):]
        m = re.search(r'(<footer>\s*<p>.*?)(</p>)', t, re.S)
        if not m:
            sys.exit('build_html: no footer paragraph in index.html')
        t = t[:m.end(1)] + ' ' + CFG['footer'] + t[m.end(1):]
    else:
        t = must_sub(t, 'href="index.html"', 'href="%s"' % BASE, 0, part)
    return t


if PERSONAL:
    os.makedirs(PERSONAL, exist_ok=True)
    for p in PARTS:
        open(os.path.join(PERSONAL, p + '.html'), 'w', encoding='utf-8').write(src[p])
    print('wrote', PERSONAL)
else:
    out = os.path.join(ROOT, 'content', 'exam-prep')
    for p in PARTS:
        name = SLUG + ('' if p == 'index' else '-' + p) + '.html'
        open(os.path.join(out, name), 'w', encoding='utf-8').write(limbic(p, src[p]))
        print('wrote content/exam-prep/' + name)
