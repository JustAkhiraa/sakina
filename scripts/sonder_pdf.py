#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Un PDF est-il exploitable, et par quelle voie ?

La question a poser avant de telecharger quoi que ce soit — et celle qu'on a
sautee pendant des mois. Quatre editions ont ete classees « sans source » sur
la foi d'un OCR muet, alors que trois portaient une couche texte propre que
personne n'avait regardee.

    python scripts/sonder_pdf.py "inspirations/docs trad/ur_Hisnul_Muslim.pdf"

Quatre verdicts possibles :

  · LISIBLE      — plus de 500 caracteres par page, dans la bonne ecriture.
                   On lit directement.
  · DESORDONNE   — du texte, mais en ordre visuel ou en formes de presentation.
                   scripts/fa_pdf.py reconstruit depuis les coordonnees.
  · ENCODE       — du texte, mais aux mauvais points Unicode (police heritee).
                   Le PDF s'affiche juste, donc l'OCR des pages rendues lit
                   juste : scripts/hisn_ocr.py.
  · SCAN         — moins de 50 caracteres par page. L'OCR est le seul recours,
                   et il echoue sur le nastaliq.
"""
import argparse
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ECRITURES = {
    "latin": r"[A-Za-zÀ-ÿ]",
    "arabe": r"[؀-ۿ]",
    "presentation arabe": r"[ﭐ-﻿]",
    "devanagari": r"[ऀ-ॿ]",
    "bengali": r"[ঀ-৿]",
    "cyrillique": r"[Ѐ-ӿ]",
    "CJK": r"[぀-ヿ一-鿿]",
}


def sonde(chemin: Path, pages: int = 30):
    try:
        import fitz
    except ImportError:
        sys.exit("pymupdf manquant : pip install pymupdf")
    doc = fitz.open(chemin)
    n = min(doc.page_count, pages)
    debut = max(0, n // 4)          # on evite couverture et sommaire
    txt = "".join(doc[i].get_text() for i in range(debut, min(doc.page_count, debut + n)))
    par_page = len(txt) // max(n, 1)

    parts = {}
    for nom, motif in ECRITURES.items():
        c = len(re.findall(motif, txt))
        if c:
            parts[nom] = round(100 * c / max(len(txt), 1))

    # Detection d'une police heritee, ecriture par ecriture. Un signal general
    # ne marche pas : il faut savoir ce qui est normal dans la langue visee.
    #
    # En devanagari, la voyelle ि est parmi les signes les plus frequents et
    # ब une consonne ordinaire. Si ब l'emporte sur ि, les deux points de code
    # ont ete echanges — c'est le cas de l'edition hindi, ou « ज़बान » ressort
    # « ज़िान ».
    encode = None
    if parts.get("devanagari"):
        i_matra, ba = txt.count("ि"), txt.count("ब")
        if ba > i_matra:
            encode = "devanagari : ि et ब échangés"
    if parts.get("bengali"):
        # Meme logique : হ est courant, ি l'est davantage.
        if txt.count("হ") > txt.count("ি"):
            encode = "bengali : হ et ি échangés"

    # L'arabe de presentation ne compte que s'il porte le texte *vise*. Une
    # edition bosniaque cite ses versets en arabe : c'est normal, et son
    # latin, lui, se lit directement.
    porteuse = max(parts.items(), key=lambda kv: kv[1])[0] if parts else ""
    desordre = parts.get("presentation arabe", 0) > 25 and porteuse != "latin"

    if par_page < 50:
        verdict, quoi = "SCAN", "OCR seulement — scripts/hisn_ocr.py"
    elif desordre:
        verdict, quoi = "DESORDONNE", "reconstruire — scripts/fa_pdf.py"
    elif encode:
        verdict, quoi = "ENCODE", f"{encode} — OCR des pages rendues"
    else:
        verdict, quoi = "LISIBLE", "lire directement"

    return {
        "pages": doc.page_count, "par_page": par_page,
        "ecritures": parts, "verdict": verdict, "voie": quoi,
        "extrait": re.sub(r"\s+", " ", txt[:220]),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf", nargs="+")
    a = ap.parse_args()
    for p in a.pdf:
        chemin = Path(p)
        if not chemin.exists():
            print(f"\n{chemin.name} : introuvable")
            continue
        r = sonde(chemin)
        print(f"\n── {chemin.name}")
        print(f"   {r['pages']} pages · {r['par_page']} caractères/page")
        print(f"   écritures : {r['ecritures'] or '(aucune reconnue)'}")
        print(f"   ▸ {r['verdict']} — {r['voie']}")
        if r["extrait"].strip():
            print(f"   « {r['extrait'][:150]} »")


if __name__ == "__main__":
    main()
