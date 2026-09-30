# -*- coding: utf-8 -*-
"""Build an Exam Prep guide (study page + games + atlas) from its source folder.

    python3 scripts/exam-prep/build.py neuro              # writes content/exam-prep/<slug>*.html
    python3 scripts/exam-prep/build.py neuro --personal OUT_DIR
                                                          # standalone copy: index.html, arcade.html,
                                                          # atlas.html with relative links

See scripts/exam-prep/README.md. The HTML in content/exam-prep is generated: edit the
source files under scripts/exam-prep/<guide>/ and rebuild, never the output.
"""
import re, json, html, os, sys, importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
ENGINE = os.path.join(HERE, 'engine')

if len(sys.argv) < 2:
    sys.exit(__doc__)
GUIDE_DIR = os.path.join(HERE, sys.argv[1])
PERSONAL = None
if '--personal' in sys.argv:
    PERSONAL = os.path.abspath(sys.argv[sys.argv.index('--personal') + 1])

def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(GUIDE_DIR, name + '.py'))
    mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); return mod

def eng(name):
    return open(os.path.join(ENGINE, name), encoding='utf-8').read()

def gfile(name):
    return open(os.path.join(GUIDE_DIR, name), encoding='utf-8').read()

CFG = load('guide').CFG
T = load('topics').T
C = load('rest')
RDRAFT = load('refs').R
V = json.load(open(os.path.join(GUIDE_DIR, 'refverified.json'), encoding='utf-8'))

SLUG = CFG['slug']
BASE = '/student/exam-prep/' + SLUG
PFX = CFG['pfx_personal'] if PERSONAL else CFG['pfx_limbic']
if PERSONAL:
    ARCADE_HREF, ATLAS_HREF, HOME_HREF, BACK = 'arcade.html', 'atlas.html', 'index.html', ''
    SCOPE = CFG['scope']
else:
    ARCADE_HREF, ATLAS_HREF, HOME_HREF = BASE + '/arcade', BASE + '/atlas', BASE
    BACK = '\n  <a href="/student/exam-prep">← Limbic</a>'
    SCOPE = CFG['scope'] + ' ' + CFG['disclaimer'] + (' ' + CFG['playbook_line'] if CFG.get('playbook_line') else '')
FOOTER = CFG['footer']

def js(o):
    return json.dumps(o, ensure_ascii=False)

head = eng('head.html').replace('@@TITLE@@', CFG['title'])
if not PERSONAL:
    head = head.replace('<meta name=viewport', '<meta name="robots" content="noindex, nofollow"><meta name=viewport', 1)

# ---------- body ----------
def kp_html(k):
    tag, q, gist, watch, a = k
    return ('<div class="kp" id="kp-%s"><input type="checkbox" aria-label="Reviewed"><div>\n'
            '<div class="q"><span class="tag">%s</span>%s</div>\n'
            '<details class="bd"><summary>Break it down</summary><div class="bd-body"><p><span class="bd-l">The gist</span>%s</p><p><span class="bd-l bd-w">Watch for</span>%s</p></div></details>\n'
            '<div class="a">%s</div></div></div>\n') % (tag, tag, q, gist, watch, a.strip())

weeks = ''
for t in T:
    weeks += '\n<div class="week">\n<h3>%s</h3>\n<div class="wsub">%s</div>\n' % (t['title'], t['sub'])
    weeks += ''.join(kp_html(k) for k in t['kps'])
    weeks += '</div>\n'

opts = ''.join('<option value="%s">%s %s</option>' % (t['id'], t['id'], html.escape(t['name'])) for t in T)

def case_html(i, c):
    wk, title, scen, qs, ans, chips, cite = c
    wks = wk.split()
    return ('<article class="case" data-weeks="%s">\n<div class="case-h"><span class="cn">Case %02d</span><h3>%s</h3><span class="wks">%s</span></div>\n'
            '<p class="scen">%s</p>\n<ol class="cq">%s</ol>\n<div class="ca"><div class="ca-l">Model answer</div><ul>%s</ul></div>\n'
            '<div class="cfoot">%s %s</div>\n</article>\n') % (
        wk, i + 1, title, ''.join('<span class="wkchip">T%s</span>' % w for w in wks), scen,
        ''.join('<li>%s</li>' % q for q in qs), ''.join('<li>%s</li>' % a for a in ans),
        ''.join('<span class="cchip">%s</span>' % ch for ch in chips), cite)

cases = ''.join(case_html(i, c) for i, c in enumerate(C.CASES))
conf = ''.join('<tr><td class="name">%s</td><td>%s</td><td>%s</td><td>%s</td></tr>\n' % c for c in C.CONF)
threads = ''.join('<li><b>%s</b><span>%s</span></li>\n' % t for t in C.THREADS)
nums = ''.join('<div><b>%s</b><span>%s</span></div>\n' % n for n in C.NUMS)
rqs = ''.join('<div class="rq"><div class="rqq"><span class="rqn">%02d</span>%s</div><div class="rqa">%s</div></div>\n' % (i + 1, s[1], s[2]) for i, s in enumerate(C.SA))
gaps = ''.join('<details%s><summary>%s</summary><p>%s</p></details>\n' % (' open' if i == 0 else '', g[0], g[1]) for i, g in enumerate(C.GAPS))

body = """<div class="wrap">
<header class="mast">
  <div>
    <div class="eyebrow">%(eyebrow)s</div>
    <h1>%(h1)s</h1>
    <p class="lede">%(lede)s Numbered citations link to the reference list at the end, and open questions are flagged in amber.</p>
    <p class="scope">%(scope)s</p>
    <p class="byline"><b>%(author)s</b> · Updated %(date)s</p>
  </div>
  <div class="counts">
    <div><b>%(ntop)d</b><span>topics</span></div>
    <div><b id="c-kp">0</b><span>key points</span></div>
    <div><b id="c-q">0</b><span>practice Qs</span></div>
    <div><b id="c-f">0</b><span>cards</span></div>
  </div>
</header>

<nav class="jump" aria-label="Sections">%(back)s
  <a href="#mine">00 Your progress</a>
  <a href="#key">01 Key points</a>
  <a href="#theories">02 Side-by-side</a>
  <a href="#confused">03 Confused pairs</a>
  <a href="#connects">04 Connections</a>
  <a href="#numbers">05 Numbers</a>
  <a href="#cases">06 Cases</a>
  <a href="#quiz">07 Quiz</a>
  <a href="#cards">08 Flashcards</a>
  <a href="#review">09 Short answer</a>
  <a href="#mock">10 Mock quiz</a>
  <a href="#gaps">11 Open questions</a>
  <a href="#refs">References</a>
  <a href="%(arcade_href)s">Games</a>
  <a href="%(atlas_href)s">Atlas</a>
</nav>

<a class="arcade-link" href="%(arcade_href)s">
  <span class="al-k">Study games</span>
  <span class="al-t">%(arcade_name)s</span>
  <span class="al-d">Five quick games from this same material: Match It, Sort It, Lightning Round, Order Up and Fill the Blank.</span>
  <span class="al-go">Play →</span>
</a>

<a class="arcade-link atlas-link" href="%(atlas_href)s">
  <span class="al-k">Visual study</span>
  <span class="al-t">%(atlas_name)s</span>
  <span class="al-d">%(atlas_card)s</span>
  <span class="al-go">View →</span>
</a>
""" % dict(CFG, date=CFG['date'], ntop=len(T), back=BACK, arcade_href=ARCADE_HREF, atlas_href=ATLAS_HREF, scope=SCOPE)

# 00 progress section: reuse verbatim
body += eng('progress.html')
body += eng('keyintro.html') + weeks + '</section>\n'

body += '''
<!-- 02 -->
<section id="theories">
  <div class="sec-head"><span class="num">02</span><h2>Side-by-side tables</h2><span class="meta">%d tables</span></div>
  <p class="intro">The comparisons most likely to show up as "which one is it?" questions. <b>Blur section</b> hides everything except the row names.</p>
%s
</section>

<!-- 03 CONFUSED -->
<section id="confused">
  <div class="sec-head"><span class="num">03</span><h2>Commonly confused</h2><span class="meta">%d pairs</span></div>
  <p class="intro">Pairs that are easy to mix up. The last column gives the one detail that tells them apart.</p>
  <div class="tbl-wrap"><table class="rt">
    <colgroup><col style="width:18%%"><col style="width:27%%"><col style="width:27%%"><col style="width:28%%"></colgroup>
    <thead><tr><th>Pair</th><th>A</th><th>B</th><th>The tell</th></tr></thead>
    <tbody>
%s    </tbody></table></div>
</section>

<!-- 04 CONNECTIONS -->
<section id="connects">
  <div class="sec-head"><span class="num">04</span><h2>Connections across topics</h2><span class="meta">%d threads</span></div>
  <p class="intro">Ideas that recur across topics. Tying them together helps with application questions. These links are a synthesis of the cited material.</p>
  <ol class="threads">
%s  </ol>
</section>

<!-- 05 NUMBERS -->
<section id="numbers">
  <div class="sec-head"><span class="num">05</span><h2>Numbers to know</h2><span class="meta">%d values</span></div>
  <div class="nums">
%s  </div>
</section>

<!-- 06 CASES -->
<section id="cases">
  <div class="sec-head"><span class="num">06</span><h2>Clinical cases</h2><span class="meta">%d cases</span></div>
  <p class="intro">Short scenarios for applying the material. Model answers draw on the cited sources. Answers start blurred: work the case out loud, then tap each bullet to check it.</p>
  <div class="toolbar"><label class="sel" for="case-week">Topic <select id="case-week"><option value="all">All topics</option>%s</select></label></div>
%s</section>

<!-- 07 QUIZ -->
<section id="quiz">
  <div class="sec-head"><span class="num">07</span><h2>Practice quiz</h2><span class="meta score" id="q-score"></span></div>
  <div class="toolbar">
    <label class="sel" for="q-week">Topic
      <select id="q-week"><option value="all">All topics</option><option value="mix">Mixed topics (interleaved)</option>%s</select></label>
    <button id="q-restart" type="button">Shuffle &amp; restart</button>
  </div>
  <div class="qcard" id="q-card" aria-live="polite"></div>
</section>

<!-- 08 FLASHCARDS -->
<section id="cards">
  <div class="sec-head"><span class="num">08</span><h2>Flashcards</h2><span class="meta" id="f-pos"></span></div>
  <div class="toolbar">
    <label class="sel" for="f-week">Topic
      <select id="f-week"><option value="all">All topics</option><option value="mix">Mixed topics (interleaved)</option>%s</select></label>
    <button id="f-shuffle" type="button">Shuffle</button>
  </div>
  <div class="flash"><div class="fc" id="fc" tabindex="0" role="button" aria-label="Flashcard, press to flip">
    <div class="face front"><span class="lab" id="f-lab"></span><div class="front-t" id="f-front"></div></div>
    <div class="face back"><span class="lab">Answer</span><div class="back-t" id="f-back"></div></div>
  </div></div>
  <p class="fchint">Click or press Space to flip · ← → to move</p>
  <div class="qnav"><button id="f-prev" type="button">← Previous</button><button id="f-next" class="primary" type="button">Next →</button></div>
</section>

<!-- 09 SHORT ANSWER -->
<section id="review">
  <div class="sec-head"><span class="num">09</span><h2>Short-answer practice</h2><span class="meta">%d questions</span></div>
  <p class="intro">Short-answer questions covering each topic, with model answers drawn from the cited sources. The answers start blurred bullet by bullet. Say your answer or use <b>✎ Write my answer</b> to check it against the key terms, then tap a bullet to reveal it and tap again to re-blur.</p>
  <div class="toolbar"><button type="button" id="rq-toggle" class="sec-blur">Unblur section</button></div>
%s</section>

<!-- MOCK -->
<section id="mock">
  <div class="sec-head"><span class="num">10</span><h2>Mock quiz</h2><span class="meta">25 min · 30 pts · all topics</span></div>
  <div id="mock-box"></div>
</section>

<!-- 11 GAPS -->
<section id="gaps">
  <div class="sec-head"><span class="num">11</span><h2>Open questions</h2><span class="meta">verify</span></div>
  <p class="intro">Points the cited material doesn't settle, plus places where sources disagree.</p>
%s</section>

<section id="refs">
  <div class="sec-head"><span class="num">12</span><h2>References</h2><span class="meta">AMA style</span></div>
  <ol class="refs">@@REFS@@</ol>
</section>

<footer>
  <p>Cases, short-answer questions and items marked <span class="mine">example</span> or <span class="mine">inference</span> are worked applications of the cited material. The connections in 04 are a synthesis. %s</p>
</footer>
</div>
''' % (C.SIDE_N, C.SIDE, len(C.CONF), conf, len(C.THREADS), threads, len(C.NUMS), nums, len(C.CASES), opts, cases, opts, opts, len(C.SA), rqs, gaps, FOOTER)

# ---------- citations ----------
order = []
def cite(m):
    keys = [k.strip() for k in m.group(1).split(',')]
    keys = list(dict.fromkeys(('notes' if (k.startswith('u_') and k != 'u_egress') else k) for k in keys))
    nums = []
    for k in keys:
        if k not in order:
            order.append(k)
        nums.append(order.index(k) + 1)
    nums = sorted(set(nums))
    return '<span class="src cite">' + ', '.join('<a href="#ref-%d">%d</a>' % (n, n) for n in nums) + '</span>'
body = re.sub(r'\{\{([^}]+)\}\}', cite, body)

def linkify(s):
    s = re.sub(r'doi:(10\.\S+?)(\.?)$', lambda m: 'doi:<a href="https://doi.org/%s" target="_blank" rel="noopener">%s</a>%s' % (m.group(1), m.group(1), m.group(2)), s)
    s = re.sub(r'(?<![">])(https?://[^\s<]+)', lambda m: '<a href="%s" target="_blank" rel="noopener">%s</a>' % (m.group(1), m.group(1)), s)
    return s
refs = ''
for i, k in enumerate(order):
    if k in V:
        v = V[k]; s = v['ama']
        if not v.get('doi') and v.get('pmid'):
            s += ' PMID: <a href="https://pubmed.ncbi.nlm.nih.gov/%s/" target="_blank" rel="noopener">%s</a>' % (v['pmid'], v['pmid'])
        s = linkify(s)
        if v.get('status') == 'unverified':
            s += ' <span class="refnote">Not indexed in Crossref or PubMed; details not independently confirmed.</span>'
    else:
        s = linkify(RDRAFT[k])
    refs += '<li id="ref-%d">%s</li>' % (i + 1, s)
body = body.replace('@@REFS@@', refs)

# ---------- script ----------
script = eng('engine.js.html')

def repl_block(start_pat, end_pat, new):
    global script
    a = script.index(start_pat); b = script.index(end_pat, a) + len(end_pat)
    script = script[:a] + new + script[b:]

Qjs = 'var Q=[\n' + ',\n'.join('    ' + js(dict(w=q[0], q=q[1], o=q[2], a=q[3], e=q[4])) for q in C.Q) + '\n  ];'
repl_block('var Q=[', '\n  ];', Qjs)
Fjs = 'var F=[\n' + ',\n'.join('    ' + js(list(f)) for f in C.F) + '\n  ];'
repl_block('var F=[', '\n  ];', Fjs)
tn = '{' + ','.join("%s:%s" % (t['id'], js(t['name'])) for t in T) + '}'
repl_block('var TNAMES=', ';', 'var TNAMES=' + tn + ';')
wk = 'var WEEKS=[\n' + ',\n'.join('    {id:%s,label:%s,name:%s}' % (js(t['id']), js('Topic ' + t['id']), js(t['name'])) for t in T) + '\n  ];'
repl_block('var WEEKS=[', '\n  ];', wk)
KT = [[s[0], s[3], s[4]] for s in C.SA]
repl_block('var KT=[', '\n  ];', 'var KT=' + js(KT) + ';')
repl_block('var MTF=[', '\n  ];', 'var MTF=' + js([list(x) for x in C.MTF]) + ';')
repl_block('var MBL=[', '\n  ];', 'var MBL=' + js([list(x) for x in C.MBL]) + ';')
repl_block('var MM=[', '\n  ];', 'var MM=' + js([[m[0], m[1], [list(p) for p in m[2]]] for m in C.MM]) + ';')
repl_block('var SAPOOL=[', '];', 'var SAPOOL=' + js(C.SAPOOL) + ';')

script = script.replace('@@NTOP_WORD@@', CFG['ntop_word']).replace('@@PFX@@', PFX).replace('@@GUIDE@@', CFG['guide_label'])
assert '@@' not in script

out = head + body + '\n' + script + '\n\n</body></html>'

# ---------- games + atlas ----------
def page(template, pairs):
    t = eng(template)
    for a, b in pairs:
        t = t.replace(a, b)
    t = t.replace('href="index.html"', 'href="%s"' % HOME_HREF)
    if not PERSONAL:
        t = t.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">', 1)
    assert '@@' not in t, template
    return t

common = [('@@PFX@@', PFX), ('@@EYEBROW@@', CFG['eyebrow'])]
arcade = page('arcade.html', common + [('/*@@DATA@@*/', gfile('arcade_data.js')), ('@@ARCADE_NAME@@', CFG['arcade_name']),
    ('@@ARCADE_H1@@', CFG['arcade_h1']), ('@@ARCADE_SUB@@', CFG['arcade_sub']), ('@@GAME_MATCH@@', CFG['game_match']),
    ('@@GAME_SORT@@', CFG['game_sort']), ('@@GAME_ORDER@@', CFG['game_order'])])
wk = "var WK=[['all','All']," + ','.join("['%s','Topic %s · %s']" % (t['id'], t['id'], t['name']) for t in T) + "];"
atlas = page('atlas.html', common + [('/*@@FIGS@@*/', gfile('atlas_figs.js')), ('/*@@WK@@*/', wk),
    ('@@ATLAS_NAME@@', CFG['atlas_name']), ('@@ATLAS_SUB@@', CFG['atlas_sub'])])

if PERSONAL:
    os.makedirs(PERSONAL, exist_ok=True)
    files = {'index.html': out, 'arcade.html': arcade, 'atlas.html': atlas}
    outdir = PERSONAL
else:
    files = {SLUG + '.html': out, SLUG + '-arcade.html': arcade, SLUG + '-atlas.html': atlas}
    outdir = os.path.join(ROOT, 'content', 'exam-prep')
for name, text in files.items():
    open(os.path.join(outdir, name), 'w', encoding='utf-8').write(text)
nkp = sum(len(t['kps']) for t in T)
print('built %s: %d topics, %d key points, %d questions, %d cards, %d references -> %s' % (SLUG, len(T), nkp, len(C.Q), len(C.F), len(order), outdir))
