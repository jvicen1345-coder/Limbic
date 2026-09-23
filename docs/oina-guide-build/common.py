# -*- coding: utf-8 -*-
"""Shared helpers for the OINA guide's content files. See README.md.

Provenance markers, as in every guide built from docs/joint-playbook-template.html:
  <span class="src">Author Year</span>     the free chapter or paper to check the row against
  <span class="prov c">Convention</span>   taught everywhere, tested by nobody
  <span class="prov x">Contested</span>    the standard texts disagree; the row says how
"""

def C():
    return '<span class="prov c">Convention</span>'

def X():
    return '<span class="prov x">Contested</span>'

def S(t):
    return '<span class="src">%s</span>' % t


class M:
    """One muscle row.

    ref   key into refs.CATALOG — the StatPearls chapter the row is checked against; build.py
          turns it into the inline "Surname Year" citation in the muscle's name cell.
    o/i/n/a  origin, insertion, nerve (with roots), action.
    test  the manual muscle test, or the clinical test where no graded MMT exists.
    fake  what fakes the result — substitution, compensation, a positioning error.
    """
    def __init__(self, name, ref, o, i, n, a, test, fake, imp=None):
        self.name, self.ref = name, ref
        self.o, self.i, self.n, self.a = o, i, n, a
        self.test, self.fake = test, fake
        self.imp = imp


def T(pos, stab, move, g=None):
    """A manual muscle test in the order the hands do it."""
    s = "<b>Position:</b> %s <b>Stabilize:</b> %s <b>Test:</b> %s" % (pos, stab, move)
    if g:
        s += " <b>Grade 2:</b> %s" % g
    return s + " " + C()
