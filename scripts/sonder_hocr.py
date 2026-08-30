#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Un OCR est-il exploitable, et sur quelles preuves ?

Pendant du sonder_pdf.py : celui-ci repond quand le PDF est un SCAN et qu'il ne
reste que l'OCR. Il lit un hOCR ou un chocr Tesseract — la forme riche, ou
chaque caractere porte sa boite et sa confiance.

    python scripts/sonder_hocr.py "…/Hisnul-Muslim-Urdu_hocr.html" --langue ur

Une mesure tranche, et elle ne demande pas de savoir lire la langue : la part
des mots-outils bien formes, rapportee a ce que donne la prose de
js/i18n/<langue>.js — ecrite par des humains, donc saine par construction. Un
OCR qui ne reconnait meme pas les mots qu'il voit le plus souvent ne reconnait
rien.

Premier jet, j'avais pose « une prose saine est vers 25 % de mots-outils et
10 % de jetons courts ». C'etait une supposition, et le temoin l'a dementie :
en ourdou les mots-outils *font* deux lettres (کے، سے، کی، کا), si bien que ces
deux reperes, que je croyais universels, ne valent que pour le latin. D'ou la
reference mesuree.

Comment l'outil a ete eprouve. On lui a donne de l'ourdou authentique — la
prose de js/i18n/ur.js montee en chocr synthetique — puis l'edition reelle : il
dit EXPLOITABLE sur le premier, PULVERISE sur la seconde. Reserve : le temoin
sort du meme corpus que la reference, il prouve donc que la lecture du chocr
est juste et qu'un texte sain passe, non que le seuil est bien place. C'est
l'ecart mesure sur donnees reelles qui porte la conclusion.

Sur l'edition ourdoue de Hisn al-Muslim (archive.org, tesseract 4.1.1, urd) :
6 % de mots-outils contre 17 % pour la prose du depot, et « نہیں » trois fois
dans tout le livre. Le nastaliq n'est pas lu. L'arabe vocalise du meme fichier,
lui, sort presque juste — mais l'application l'affiche deja.
"""
import argparse
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

sys.stdout.reconfigure(encoding="utf-8")

# Les mots les plus frequents de la langue, ceux qu'un OCR sain ne rate pas.
OUTILS = {
    "ur": ["کے", "سے", "ہے", "اور", "میں", "نہیں", "کی", "کا", "کو", "پر", "ہیں"],
    "fa": ["از", "که", "را", "به", "این", "با", "است", "در", "آن", "می"],
    "ar": ["من", "في", "على", "الله", "لا", "ما", "عن", "الذي", "إن", "قال"],
    "hi": ["है", "के", "में", "और", "से", "को", "का", "की", "कि", "नहीं"],
    "bn": ["এবং", "করে", "থেকে", "জন্য", "না", "আর", "যে", "এই", "তার", "হয়"],
}

CHAINE = re.compile(r':\s*"((?:[^"\\]|\\.)+)"')
CINFO = re.compile(
    r'<span class="ocrx_cinfo" title="x_bboxes (\d+) \d+ \d+ \d+; x_conf ([\d.]+)">(.*?)</span>',
    re.S)
MOT = re.compile(
    r'<span class="ocrx_word"[^>]*title="bbox (\d+) \d+ \d+ \d+;[^"]*"[^>]*>'
    r'(.*?)(?=<span class="ocrx_word"|</span>\s*</p>|\Z)', re.S)
LIGNE = re.compile(r'(?=<span class="ocr_line")')
PAGE = re.compile(r'(?=<div class="ocr_page")')
ARABE = re.compile("[؀-ۿ]")


def lignes(chemin: Path, debut=0, fin=10 ** 9):
    """Le texte, remis dans l'ordre visuel depuis les coordonnees.

    Un .txt derive d'un hOCR a deja perdu cet ordre : en ecriture de droite a
    gauche, le mot le plus a droite vient en premier, et rien dans le fichier
    plat ne le dit.
    """
    src = chemin.read_text(encoding="utf-8", errors="ignore")
    pages = PAGE.split(src)[1:]
    for p in pages[debut:fin]:
        for bloc in LIGNE.split(p)[1:]:
            mots = []
            for x0, corps in MOT.findall(bloc):
                chars = CINFO.findall(corps)
                if not chars:
                    continue
                txt = "".join(html.unescape(c) for _, _, c in chars).strip()
                if txt:
                    mots.append((int(x0), txt))
            if not mots:
                continue
            mots.sort(key=lambda m: -m[0])
            ligne = " ".join(t for _, t in mots)
            if ligne.strip():
                yield ligne


def reference(langue: str):
    """La part de mots-outils dans de la prose saine, mesuree et non devinee.

    Le depot porte deja la reponse : ses propres traductions, ecrites par des
    humains, dans les dix-huit langues. On s'y mesure.
    """
    f = ROOT / "js" / "i18n" / (langue + ".js")
    if not f.exists():
        return None
    src = f.read_text(encoding="utf-8")
    # De la prose, pas des etiquettes : un bouton n'a pas de mots-outils et
    # tirerait la reference vers le bas.
    phrases = [m for m in CHAINE.findall(src) if len(m.split()) >= 8]
    toks = " ".join(phrases).split()
    if len(toks) < 300:
        return None
    outils = OUTILS.get(langue, [])
    return 100 * sum(toks.count(w) for w in outils) / len(toks)


def sonde(chemin: Path, langue: str):
    txt = "\n".join(lignes(chemin))
    toks = [w for w in txt.split() if ARABE.search(w) or not w.isascii()]
    n = max(len(toks), 1)
    outils = OUTILS.get(langue, [])
    pc = 100 * sum(toks.count(w) for w in outils) / n
    courts = 100 * sum(1 for w in toks if len(w) <= 2) / n
    ref = reference(langue)

    if ref is None:
        verdict = "SANS REFERENCE"
        quoi = "pas assez de prose dans js/i18n/%s.js pour comparer" % langue
    else:
        part = pc / max(ref, 0.1)
        if part >= 0.75:
            verdict, quoi = "EXPLOITABLE", "on peut relever des phrases"
        elif part >= 0.45:
            verdict, quoi = "DOUTEUX", "relire chaque phrase avant de la retenir"
        else:
            verdict = "PULVERISE"
            quoi = "ne rien en tirer — une phrase fausse est pire qu'une phrase absente"
    return {
        "jetons": len(toks), "pc_outils": pc, "pc_courts": courts, "ref": ref,
        "verdict": verdict, "voie": quoi, "texte": txt,
        "outils": {w: toks.count(w) for w in outils},
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("hocr")
    ap.add_argument("--langue", default="ur", help="parmi " + ", ".join(OUTILS))
    ap.add_argument("--ecrire", metavar="FICHIER", help="deverser le texte reconstruit")
    a = ap.parse_args()
    chemin = Path(a.hocr)
    if not chemin.exists():
        sys.exit("introuvable : %s" % chemin)
    r = sonde(chemin, a.langue)
    ref = ("%.0f %%" % r["ref"]) if r["ref"] is not None else "—"
    print("\n── %s  (%s)" % (chemin.name, a.langue))
    print("   %d jetons" % r["jetons"])
    print("   mots-outils bien formés  : %.0f %%   (la prose de js/i18n/%s.js : %s)"
          % (r["pc_outils"], a.langue, ref))
    print("   jetons de 1-2 caractères : %.0f %%" % r["pc_courts"])
    print("   ▸ %s — %s" % (r["verdict"], r["voie"]))
    print("   mots-outils :", "  ".join("%s=%d" % (w, k) for w, k in r["outils"].items()))
    if a.ecrire:
        Path(a.ecrire).write_text(r["texte"], encoding="utf-8")
        print("   texte reconstruit → %s" % a.ecrire)


if __name__ == "__main__":
    main()
