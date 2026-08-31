#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Traduction hindi d'une rubrique de Hisn al-Muslim, edition hindi.

Le PDF porte une couche texte, mais sa police mappe ses glyphes sur de mauvais
points Unicode : ि ressort en ब et reciproquement, si bien que « जिसने »
devient « बजसने ». Le document *s'affiche* pourtant correctement — l'OCR des
pages rendues lit donc juste, et c'est lui qu'on emploie ici.

L'arabe ressort en charabia a l'OCR ; sans importance, il est deja affiche
dans l'application. Les traductions hindi, elles, sont propres et toujours
entre guillemets droits.

    python scripts/hi_rubrique.py "जागने के अज़कार"
    python scripts/hi_rubrique.py --mot "क्षमा"
"""
import argparse
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
OCR = ROOT / "scripts" / "out" / "hisn_ocr_hi.txt"

DEV = re.compile(r"[ऀ-ॿ]")
# Les notes de bas de page portent une reference de hadith ; elles ne font pas
# partie de l'invocation et s'intercalent au milieu d'une phrase.
NOTE = re.compile(r"(सुनन|सहीह|मुसनद|देखिए|हदीस संख्या|इब्न-ए-माजा|अबू दाऊद"
                  r"|तिरमिज़ी|बुखारी|मुस्लिम|नसई|अलबानी|बग़वी|इरवा|फ़त्ह)")


def texte() -> str:
    if not OCR.exists():
        sys.exit(f"{OCR.name} absent — lancer scripts/hisn_ocr.py hi")
    return OCR.read_text(encoding="utf-8")


def blocs(fragment: str, combien: int = 4, saut: int = 0):
    """Les passages hindi cites, autour d'un fragment donne."""
    s = re.sub(r"\s+", " ", texte())
    ms = list(re.finditer(re.escape(fragment), s))
    if len(ms) <= saut:
        return None, []
    seg = s[ms[saut].start(): ms[saut].start() + 4600]
    trouves = []
    for b in re.findall(r'"([^"]{15,1100})"', seg):
        b = re.sub(r"\s+", " ", b).strip()
        if len(DEV.findall(b)) < len(b) * 0.5:
            continue
        # Une note glissee au milieu coupe la phrase : on la signale plutot que
        # de la retirer en silence, le relecteur decide.
        trouves.append(b)
        if len(trouves) >= combien:
            break
    return ms[saut].start(), trouves


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("fragment", nargs="?")
    ap.add_argument("--mot")
    ap.add_argument("-n", type=int, default=4)
    ap.add_argument("--saut", type=int, default=0)
    ap.add_argument("--brut", action="store_true",
                    help="le voisinage tel quel, pour lire soi-meme")
    a = ap.parse_args()
    cible = a.fragment or a.mot
    if not cible:
        ap.print_help()
        return
    pos, res = blocs(cible, a.n, a.saut)
    if pos is None:
        sys.exit(f"introuvable : {cible}")
    if a.brut:
        # L'extraction par guillemets prend le premier bloc venu, qui n'est pas
        # toujours la traduction : les notes s'intercalent. On lit soi-meme.
        s = re.sub(r"\s+", " ", texte())
        print(s[max(0, pos - 200): pos + 1400])
        return
    for i, b in enumerate(res, 1):
        alerte = "  ⚠ note intercalée" if NOTE.search(b) else ""
        print(f"\n[{i}]{alerte}\n{b}")


if __name__ == "__main__":
    main()
