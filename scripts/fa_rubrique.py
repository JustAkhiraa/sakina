#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Traduction persane d'une rubrique de Hisn al-Muslim, edition persane.

L'edition met l'arabe d'abord, puis la traduction persane entre » «. Cet
outil isole une rubrique — du titre jusqu'au titre suivant — et n'en rend
que les blocs persans, notes de bas de page ecartees.

Le texte vient de scripts/fa_pdf.py (couche texte reconstruite), pas de
l'OCR : celui-ci perdait des lignes entieres aux sauts de page.

    python scripts/fa_rubrique.py "داخل شدن به توالت"
    python scripts/fa_rubrique.py --liste
"""
import argparse
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / "scripts" / "out" / "fa_texte.txt"

ARABE_LOURD = re.compile(r"[\u0617-\u061A\u064B-\u0652\u0670\uFB50-\uFDFF]")
NOTE = re.compile(r"^\s*\d+\s*-?\s*(هر\s*کس|البخاری|مسلم|الترمذی|أبو|آبو|ابن|أحمد|احمد|نگا"
                  r"|صحیح|أهل|الحاکم|النسائی|الحدیث|مالک|الدارمی)")
TITRE = re.compile(r"^\s*(دعا[ي یی]?|أذك\s*ار|آذ\s*کار|اذكار|ذكر|ذکر|آنچه|آنجه|تكبير"
                   r"|تکبیر|شيوه|شیوه)\b")


def texte() -> str:
    if not CACHE.exists():
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        out = subprocess.run([sys.executable, str(ROOT / "scripts" / "fa_pdf.py"), "--tout"],
                             capture_output=True, text=True, encoding="utf-8")
        CACHE.write_text(out.stdout, encoding="utf-8")
    return CACHE.read_text(encoding="utf-8")


def sans_espace(s: str) -> str:
    return re.sub(r"[\s\u200c]+", "", unicodedata.normalize("NFKC", s))


def corps(t: str) -> list[str]:
    """Le sommaire reprend les titres du corps : on ne garde que le corps."""
    return t[t.find("<<<PAGE 20>>>"):].split("\n")


def rubrique(motif: str):
    lignes = corps(texte())
    cible = sans_espace(motif)
    debut = next((i for i, l in enumerate(lignes) if cible in sans_espace(l)), None)
    if debut is None:
        return None, []
    fin = next((i for i in range(debut + 1, len(lignes)) if TITRE.match(lignes[i].strip())),
               len(lignes))
    # Le persan de l'edition met ses propres incises entre » «, si bien qu'un
    # decoupage sur ces guillemets coupe l'invocation en morceaux : « هیچ
    # معبودی به جز الله »به حق« وجود ندارد » rendait trois blocs dont deux
    # vides de sens. On classe donc ligne par ligne — l'arabe porte ses
    # diacritiques et ses formes de presentation, le persan non — et on
    # recolle les lignes persanes consecutives.
    blocs, courant = [], []
    for l in lignes[debut + 1:fin]:
        l = l.strip()
        if not l or l.startswith("<<<PAGE") or "پناهگاه مسلمان" in l or NOTE.match(l):
            continue
        entree = re.match(r"^(\d{1,3})\s*-\s*$", l)
        if entree:                       # numero d'entree isole sur sa ligne
            continue
        l = re.sub(r"^\d{1,3}\s*-\s*", "", l)
        if len(ARABE_LOURD.findall(l)) >= max(2, len(l) * 0.04):
            if courant:
                blocs.append(" ".join(courant)); courant = []
            continue
        courant.append(l)
    if courant:
        blocs.append(" ".join(courant))
    propres = []
    for b in blocs:
        b = re.sub(r"\s+", " ", b).strip()
        b = re.sub(r"^[»«\s.]+|[»«\s]+$", "", b).strip()
        if len(b) >= 12:
            propres.append(b)
    return lignes[debut].strip(), propres


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("motif", nargs="?")
    ap.add_argument("--liste", action="store_true")
    a = ap.parse_args()
    if a.liste:
        for l in corps(texte()):
            if TITRE.match(l.strip()) and 8 < len(l.strip()) < 70:
                print(l.strip())
        return
    if not a.motif:
        ap.print_help(); return
    titre, blocs = rubrique(a.motif)
    if titre is None:
        sys.exit(f"rubrique introuvable : {a.motif}")
    print(f"── {titre}")
    for i, b in enumerate(blocs):
        print(f"\n[{i+1}] {b}")


if __name__ == "__main__":
    main()
