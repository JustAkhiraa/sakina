#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Couverture des invocations, langue par langue.

Trois provenances possibles, et il faut les distinguer : une invocation
coranique est servie par le corpus, une invocation prophetique par une
edition traduite de Hisn al-Muslim, et ce qui manque retombe sur l'anglais
puis sur le francais. Le total ne dit rien tout seul.

    python scripts/duas_coverage.py
"""
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "js" / "i18n"


def blocs(src):
    out, prof, deb = [], 0, None
    for i, c in enumerate(src):
        if c == "{":
            if prof == 0:
                deb = i
            prof += 1
        elif c == "}":
            prof -= 1
            if prof == 0 and deb is not None:
                out.append(src[deb:i + 1]); deb = None
    return out


def champ(b, nom):
    m = re.search(nom + r"\s*:\s*(['\"])((?:\\.|(?!\1).)*)\1", b, re.S)
    return m.group(2) if m else ""


def main():
    src = (ROOT / "js/data/duas.js").read_text(encoding="utf-8")
    coraniques, prophetiques = [], []
    for b in blocs(src):
        i = champ(b, "id")
        if not i:
            continue
        (coraniques if champ(b, "verses") else prophetiques).append(i)

    corpus = {p.stem.split("-")[1] for p in (ROOT / "content/quran").glob("quran-*.json")}
    langues = sorted(p.stem for p in I18N.glob("*.js") if p.stem != "index")

    print(f"{len(coraniques)} coraniques · {len(prophetiques)} prophétiques\n")
    print(f"{'':4}{'corpus':>8}{'éditions':>10}{'total':>8}")
    for code in langues:
        dico = (I18N / f"{code}.js").read_text(encoding="utf-8")
        cles = set(re.findall(r'^\s*"(dut\.[\w-]+)"\s*:', dico, re.M))
        cor = len(coraniques) if (code in corpus or code == "fr") else 0
        pro = sum(1 for d in prophetiques if f"dut.{d}" in cles)
        if code == "fr":
            pro = len(prophetiques)          # le francais est la source
        tot = cor + pro
        n = len(coraniques) + len(prophetiques)
        barre = "█" * round(20 * tot / n) + "·" * (20 - round(20 * tot / n))
        print(f"{code:4}{cor:>8}{pro:>10}{tot:>6}/{n}  {barre}")


if __name__ == "__main__":
    main()
