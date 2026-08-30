#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lit un EPUB : sommaire, chapitre, recherche.

Un EPUB est une archive ZIP de XHTML, avec un manifeste qui donne l'ordre
de lecture. Le texte y est celui que l'editeur a compose — pas de colonnes
a demeler, pas de police maison qui rend l'arabe en charabia, pas d'OCR.
Quand une edition existe dans les deux formats, c'est celle-ci qu'il faut
prendre.

Rien a installer : zipfile et html.parser suffisent.

    python scripts/epub_read.py livre.epub                 # sommaire
    python scripts/epub_read.py livre.epub --chap 12       # un chapitre
    python scripts/epub_read.py livre.epub --mot "wudhu"   # recherche
    python scripts/epub_read.py livre.epub --brut          # tout le texte

Le fichier est cherche dans inspirations/docs trad/, ou pris tel quel si le
chemin est absolu.
"""
import argparse
import html
import re
import sys
import unicodedata
import zipfile
from pathlib import Path
from xml.etree import ElementTree

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "inspirations" / "docs trad"

BLOCS = ("p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "br", "tr")


def aplati(s):
    """Sans diacritiques ni casse, pour une recherche indulgente."""
    s = unicodedata.normalize("NFKD", s.replace("ı", "i").replace("I", "i"))
    return "".join(c for c in s if not unicodedata.combining(c)).lower()


def _texte(xhtml):
    """Texte d'un document XHTML, un bloc par ligne.

    On ne passe pas par un parseur XML : beaucoup d'EPUB contiennent du
    HTML mal ferme qui le ferait echouer. Une reduction par expressions
    regulieres suffit ici, on ne cherche qu'a lire."""
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", xhtml, flags=re.S | re.I)
    s = re.sub(rf"</?(?:{'|'.join(BLOCS)})\b[^>]*>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", "", s)
    s = html.unescape(s)
    lignes = [re.sub(r"[ \t ]+", " ", l).strip() for l in s.split("\n")]
    return [l for l in lignes if l]


def _ordre(z):
    """Documents dans l'ordre de lecture, d'apres le manifeste OPF.

    A defaut de manifeste lisible, on retombe sur l'ordre alphabetique des
    fichiers XHTML — imparfait mais souvent juste, les editeurs numerotant
    leurs chapitres."""
    try:
        cont = z.read("META-INF/container.xml").decode("utf-8", "replace")
        opf = re.search(r'full-path="([^"]+)"', cont).group(1)
        base = opf.rsplit("/", 1)[0] + "/" if "/" in opf else ""
        arbre = ElementTree.fromstring(z.read(opf))
        ns = {"o": "http://www.idpf.org/2007/opf"}
        chemins = {i.get("id"): i.get("href")
                   for i in arbre.iter() if i.tag.endswith("}item")}
        suite = [chemins.get(r.get("idref"))
                 for r in arbre.iter() if r.tag.endswith("}itemref")]
        return [base + h for h in suite if h]
    except Exception:
        return sorted(n for n in z.namelist()
                      if n.lower().endswith((".xhtml", ".html", ".htm")))


def chapitres(chemin):
    """[(numero, nom du fichier, lignes)] dans l'ordre de lecture."""
    out = []
    with zipfile.ZipFile(chemin) as z:
        noms = set(z.namelist())
        for i, doc in enumerate(_ordre(z)):
            if doc not in noms:
                continue
            lignes = _texte(z.read(doc).decode("utf-8", "replace"))
            if lignes:
                out.append((i, doc, lignes))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("epub", help="fichier dans inspirations/docs trad/, ou chemin complet")
    ap.add_argument("--chap", type=int, action="append", default=[],
                    help="numéro de document à afficher")
    ap.add_argument("--mot", action="append", default=[],
                    help="cherche un mot dans tout le livre")
    ap.add_argument("--brut", action="store_true", help="tout le texte")
    ap.add_argument("--lignes", type=int, default=60)
    a = ap.parse_args()

    p = Path(a.epub)
    if not p.is_absolute():
        p = DOCS / a.epub
    if not p.exists():
        print(f"introuvable : {p}")
        return 1

    docs = chapitres(p)
    if not docs:
        print("aucun texte lisible — archive vide ou chiffrée ?")
        return 1

    if a.mot:
        cibles = [aplati(m) for m in a.mot]
        for num, doc, lignes in docs:
            for i, l in enumerate(lignes):
                if any(c in aplati(l) for c in cibles):
                    print(f"\n──── doc {num} · {doc.split('/')[-1]}")
                    for j in range(max(0, i - 2), min(len(lignes), i + 4)):
                        print(("  > " if j == i else "    ") + lignes[j][:118])
        return 0

    if a.chap or a.brut:
        voulus = docs if a.brut else [d for d in docs if d[0] in a.chap]
        for num, doc, lignes in voulus:
            print(f"\n{'='*74}\ndoc {num} · {doc.split('/')[-1]}  ({len(lignes)} lignes)")
            for l in lignes[:None if a.brut else a.lignes]:
                print("   " + l[:118])
        return 0

    total = sum(len(l) for _, _, l in docs)
    print(f"{p.name} — {len(docs)} document(s), {total} lignes\n")
    for num, doc, lignes in docs:
        titre = next((l for l in lignes if len(l) > 3), "")
        print(f"  {num:>3}  [{len(lignes):>4}]  {doc.split('/')[-1][:34]:<34} {titre[:52]}")
    print("\n  --chap N pour lire · --mot « … » pour chercher")
    return 0


if __name__ == "__main__":
    sys.exit(main())
