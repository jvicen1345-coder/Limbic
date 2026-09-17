#!/usr/bin/env python3
"""Adversarial check: every number the guide attributes to a source must appear in that
source's downloaded text. Catches transcription drift, which is the failure mode a re-read
never finds."""
import pathlib, re, subprocess, sys
D = pathlib.Path(__file__).resolve().parent

# Source text is not committed — it is third-party full text, half a megabyte of it, and
# re-fetching is both cheaper in the tree and a check in itself that the source is still
# openly readable. getdoc.py caches to these filenames.
FILES = {"Rupp 2021": ("rupp2021.txt", "PMC8152171"),
         "Moore 2018": ("moore2018.txt", "PMC6023606"),
         "Morimoto 2024": ("PMC10999014.txt", "PMC10999014"),
         "Pusnik 2026": ("mas.txt", "PMC13332714"),
         "Salti 2026": ("PMC13466990.txt", "PMC13466990"),
         "Tarnutzer 2026": ("PMC12979088.txt", "PMC12979088")}

def load(name):
    fn, pmcid = FILES[name]
    f = D / fn
    if not f.exists():
        print("fetching %s (%s)..." % (name, pmcid))
        out = subprocess.run([sys.executable, str(D / "getdoc.py"), pmcid],
                             capture_output=True, text=True)
        if out.returncode or len(out.stdout) < 5000:
            sys.exit("could not fetch %s — check network, then re-run" % pmcid)
        f.write_text(out.stdout, encoding="utf-8")
    return f.read_text(encoding="utf-8", errors="replace")

SRC = {k: load(k) for k in FILES}
# abstract-only sources: the abstract as Europe PMC returned it
SRC["Bohannon 1987"] = ("We each independently graded the elbow flexor muscle spasticity of 30 "
  "patients with intracranial lesions. We agreed on 86.7% of our ratings. The Kendall's tau "
  "correlation between our grades was .847")
SRC["Brott 1989"] = ("We designed a 15-item neurologic examination stroke scale. interrater "
  "reliability mean kappa = 0.69 test-retest reliability 0.66-0.77 scale-lesion size r = 0.68, "
  "scale-outcome r = 0.79 the most interrater reliable item (pupillary response) had low validity")

CLAIMS = [
 ("Rupp 2021", ["28 dermatomes", "1 cm of skin", "safety pin", "rounded end",
                "0 = Absent", "1 = Altered", "2 = Normal or intact", "112",
                "0 = Total paralysis", "3 = Active movement, full ROM against gravity",
                "at least 3", "C5-T1", "L2-S1", "deep anal pressure",
                "considered as optional: joint movement appreciation and position sense",
                "graded using the same sensory scale provided (absent, impaired, normal)",
                "unable to correctly report joint movement on large movements of the joint"]),
 ("Moore 2018", ["ICC = 0.95", "0.953", "MDC 95 of 7", "4.66", "6.7", "MDC 95 of 5",
                 "2.49", "4.9%", "11.8%", "21.5%", "28.8%", "17.3%", "6.5%",
                 "0.18 m/s", "0.25 m/s", "0.46 m/s", "maximum total score is 30",
                 "less than 20 minutes", "Sixty-eight percent", "may be used",
                 "time to complete", "annual basis"]),
 ("Morimoto 2024", ["50.8%", "41.5-60.1", "99%", "97.7-100", "0.467-0.571",
                    "1+: Reflex small", "2+: Brisk", "3+: Reflex enhanced",
                    "4+: Reflex enhanced", "0: Reflex absent"]),
 ("Pusnik 2026", ["23 children", "0.91", "0.99", "0.80", "0.89", "moderate positive correlation"]),
 ("Salti 2026", ["38% of individuals with right-hemisphere damage", "18%",
                 "Catherine Bergego Scale", "Behavioural Inattention"]),
 ("Tarnutzer 2026", ["oculocephalic", "head-on-body rotations"]),
 ("Bohannon 1987", ["86.7%", ".847", "30 patients", "elbow flexor"]),
 ("Brott 1989", ["15-item", "0.69", "pupillary response) had low validity"]),
]

def norm(t):
    return re.sub(r"\s+", " ", t.replace("‐", "-").replace("‑", "-")
                  .replace("‒", "-").replace("–", "-").replace("—", "-")
                  .replace("−", "-").replace("’", "'"))

bad = 0
for src, needles in CLAIMS:
    hay = norm(SRC[src])
    for n in needles:
        if norm(n) not in hay:
            print("MISSING in %-15s: %s" % (src, n)); bad += 1
print("\n%d claim strings checked, %d not found in the cited source"
      % (sum(len(n) for _, n in CLAIMS), bad))
sys.exit(1 if bad else 0)
