#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Texte persan de fa_hisn_muslim.pdf, reconstruit depuis les coordonnees.

Ce PDF a bien une couche texte, et elle est complete — c'est son ordre qui
est faux. Les mots sortent dans l'ordre visuel, coupes aux ruptures de
ligature (« پناهگاه » devient « پنا ه گا ه ») et en formes de presentation
arabes. L'OCR avait ete tente a la place ; il lit bien mais perd des lignes
entieres aux sauts de page, ce qui tronquait une invocation sur quatre.

La reconstruction se fait au caractere : chacun porte sa boite, on regroupe
par ligne, on lit de droite a gauche, et on garde les caracteres d'espace du
PDF plutot que de deduire les mots d'un ecart. NFKC ramene les formes de
presentation aux lettres de base.

    python scripts/fa_pdf.py --page 23
    python scripts/fa_pdf.py --rubrique "داخل شدن به توالت"
    python scripts/fa_pdf.py --tout > scripts/out/fa_texte.txt
"""
import argparse
import re
import sys
import unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
PDF = ROOT / "inspirations" / "docs trad" / "fa_hisn_muslim.pdf"
CHIFFRES = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")


def _fitz():
    try:
        import fitz
    except ImportError:
        sys.exit("pymupdf manquant : pip install pymupdf")
    return fitz


def page(doc, i, tol=4.0):
    """Une page, ligne par ligne, en ordre logique."""
    lignes = {}
    for bloc in doc[i].get_text("rawdict")["blocks"]:
        for ligne in bloc.get("lines", []):
            for span in ligne["spans"]:
                for c in span["chars"]:
                    x0, y0, x1, y1 = c["bbox"]
                    lignes.setdefault(round((y0 + y1) / 2 / tol), []).append((x0, c["c"]))
    out = []
    for cle in sorted(lignes):
        s = "".join(c for _, c in sorted(lignes[cle], key=lambda t: -t[0]))
        s = unicodedata.normalize("NFKC", s)
        # Les chiffres arabo-indiens deviennent latins, mais on ne touche pas
        # a leur ordre : selon le span, un nombre a plusieurs chiffres sort
        # tantot dans l'ordre logique (l'en-tete de page), tantot inverse par
        # le tri droite-gauche (les references de hadith). Les inverser tous
        # cassait les numeros de page. Rien de ce qu'on releve ici n'est un
        # nombre — les invocations n'en contiennent pas —, alors on laisse
        # tel quel plutot que de deviner. Les references ne sont pas fiables.
        s = s.translate(CHIFFRES)
        out.append(re.sub(r" {2,}", " ", s).strip())
    return "\n".join(l for l in out if l)


def tout(doc):
    return "\n".join(f"<<<PAGE {i}>>>\n{page(doc, i)}" for i in range(doc.page_count))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--page", type=int)
    ap.add_argument("--rubrique")
    ap.add_argument("--lignes", type=int, default=18)
    ap.add_argument("--tout", action="store_true")
    a = ap.parse_args()
    doc = _fitz().open(PDF)
    if a.tout:
        print(tout(doc))
    elif a.page is not None:
        print(page(doc, a.page))
    elif a.rubrique:
        # Le sommaire reprend les titres du corps : on ne cherche qu'apres lui.
        txt = tout(doc)
        corps = txt.find("<<<PAGE 20>>>")
        m = re.search(re.escape(a.rubrique).replace(r"\ ", r"\s*"), txt[corps:])
        if not m:
            sys.exit(f"rubrique introuvable : {a.rubrique}")
        bloc = txt[corps + m.start():]
        for l in bloc.split("\n")[:a.lignes]:
            if l and not l.startswith("<<<PAGE") and "پناهگاه مسلمان" not in l:
                print(l)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
