#!/usr/bin/env python3
"""Sticky table headers for the served guides in content/playbooks/.

Every guide's stylesheet (from docs/joint-playbook-template.html) already makes `thead th`
sticky, but every table sits in a `.tablewrap` with `overflow-x:auto`. A sticky element sticks
to its nearest scroll container, so the headers stuck to the wrapper — which never scrolls
vertically — and scrolled away with the rows.

This adds one <style> and one <script>, and nothing else: above the 860px breakpoint (below it
every table is a stack of cards with no header row), a wrapper whose table fits without
sideways scrolling is switched to `overflow-x:clip`, which is not a scroll container, and its
header pins just under the sticky nav until the table ends. The nav's height changes as its
links wrap, so the script measures it into --navh. A table that does need sideways scrolling is
left exactly as it was, so nothing can be clipped off; fit is re-measured on resize.

Both blocks sit between marker comments, so applying is idempotent and removal is exact:

    python3 docs/playbook_sticky_headers.py content/playbooks/hip-examination.html ...

The OINA and neurologic builds call apply() on their output; the hand-built guides are
patched in place by the command above. The guides' text is never touched.
"""
import pathlib, re, sys

START, END = "<!-- sticky-table-headers -->", "<!-- /sticky-table-headers -->"

STYLE = START + """
<style>
@media screen and (min-width:861px){
  .tablewrap[data-stick]{overflow-x:clip}
  .tablewrap[data-stick] thead th{top:var(--navh, 0px)}
}
</style>
""" + END

SCRIPT = START + """
<script>
(function(){
  var nav = document.querySelector('nav');
  var wraps = document.querySelectorAll('.tablewrap');
  var queued = false;
  function fit(){
    queued = false;
    if(nav) document.documentElement.style.setProperty('--navh', nav.offsetHeight + 'px');
    wraps.forEach(function(w){ w.removeAttribute('data-stick'); });
    // measure every wrapper while it can still scroll, then let only those that fit stick
    var fits = Array.prototype.map.call(wraps, function(w){ return w.scrollWidth <= w.clientWidth + 1; });
    wraps.forEach(function(w, i){ if(fits[i]) w.setAttribute('data-stick', ''); });
  }
  function queue(){ if(!queued){ queued = true; requestAnimationFrame(fit); } }
  fit();
  window.addEventListener('resize', queue);
  if(nav && window.ResizeObserver) new ResizeObserver(queue).observe(nav);
})();
</script>
""" + END

BLOCK = re.compile(re.escape(START) + r".*?" + re.escape(END) + r"\n?", re.S)


def apply(html):
    """Return the document with exactly one copy of the style and the script."""
    html = BLOCK.sub("", html)
    if html.count("</head>") != 1 or html.count("</body>") != 1:
        raise SystemExit("expected exactly one </head> and one </body>")
    html = html.replace("</head>", STYLE + "\n</head>", 1)
    return html.replace("</body>", SCRIPT + "\n</body>", 1)


if __name__ == "__main__":
    for name in sys.argv[1:]:
        p = pathlib.Path(name)
        before = p.read_text(encoding="utf-8")
        after = apply(before)
        if after != before:
            p.write_text(after, encoding="utf-8")
        print("%s %s" % ("patched" if after != before else "unchanged", name))
