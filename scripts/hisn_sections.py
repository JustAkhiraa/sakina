#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Decoupe une edition de Hisn al-Muslim en sections, pour relecture humaine.

Ces editions se ressemblent toutes : un titre de rubrique en capitales, puis
les invocations numerotees. C'est un bien meilleur point d'entree que
l'ancrage sur l'arabe, qui s'extrait mal (ligatures decomposees, lettres
perdues, mots reordonnes) et ne rendait que deux reperes sur vingt-huit en
turc, contre vingt-quatre par les rubriques.

L'outil ne traduit rien et ne decide rien : il presente le texte publie pour
qu'on le lise et qu'on recopie ce qui correspond. C'est voulu — une invocation
mal appariee est pire qu'une invocation absente.

    python scripts/hisn_sections.py tr_Hisnul_Muslim.pdf
    python scripts/hisn_sections.py tr_Hisnul_Muslim.pdf abdestten evden
    python scripts/hisn_sections.py id_hisn_almuslim.pdf --mot "berlindung"
"""
import argparse
import re
import sys
import unicodedata
from pathlib import Path

import fitz

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
PDFS = ROOT / "inspirations" / "docs trad"

ARABE = re.compile(r"[؀-ۿﭐ-﷿ﹰ-﻿]")
# Un titre : au moins dix signes, tout en capitales, trois lettres d'affilee.
TITRE = re.compile(r"^[^\Wa-zß-öø-ÿ\d]*[A-ZÇĞİÖŞÜIÂÎÛÑÁÉÍÓÚ0-9'’\"()\[\]\-–,.:!?& ]{10,}$")


def aplati(s):
    """Sans diacritiques ni casse. Python abaisse « İ » en i + point
    combinant : sans NFKD, « CÂMİYE » ne rencontrerait jamais « camiye »."""
    s = unicodedata.normalize("NFKD", s.replace("ı", "i").replace("I", "i"))
    return "".join(c for c in s if not unicodedata.combining(c)).lower()


def lignes(pdf, depuis):
    doc = fitz.open(pdf)
    out = []
    for n in range(depuis, doc.page_count):
        for brut in doc[n].get_text().split("\n"):
            s = brut.strip()
            if s:
                out.append((n, s))
    doc.close()
    return out


def lisible(s):
    """Garde ce qui ressemble a de la prose.

    Il ne suffit pas d'ecarter l'arabe : l'edition indonesienne l'encode dans
    une police maison qui ressort en charabia latin (« B1א », « );B%1. »),
    repete quatre fois par ligne. Exiger un mot d'au moins trois minuscules
    ecarte ce bruit, les lettres isolees et la numerotation, sans toucher a la
    prose — les titres, tout en capitales, sont reconnus a part."""
    if len(ARABE.findall(s)) > len(s) * 0.3:
        return False
    return bool(re.search(r"[a-zà-öø-ÿçğıöşü]{3}", s))


def recolle(corps):
    """Une invocation par ligne.

    L'extraction rend parfois un mot par ligne. On rassemble tout, puis on
    redecoupe sur la numerotation de l'edition, qui borne les invocations."""
    texte = re.sub(r"\s+", " ", " ".join(corps)).strip()
    texte = re.sub(r"(?<!\d)(\d{1,3})\s*[.\-–]\s*(?=[“\"'(A-ZÀ-Ý])", r"\n\1. ", texte)
    return [l.strip() for l in texte.split("\n") if l.strip()]


def sections(lg):
    secs, cur = [], None
    for n, s in lg:
        est_titre = (TITRE.match(s) and re.search(r"[A-ZÇĞİÖŞÜ]{3}", s)
                     and "..." not in s)
        if est_titre:
            # un titre qui deborde sur deux lignes : on recolle
            if cur and not cur[2] and cur[0] == n:
                cur[1] += " " + s
                continue
            cur = [n, s, []]
            secs.append(cur)
        elif cur is not None and lisible(s):
            cur[2].append(s)
    return secs


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pdf", help="nom du fichier dans inspirations/docs trad/")
    ap.add_argument("titres", nargs="*", help="fragments de titre de rubrique")
    ap.add_argument("--mot", action="append", default=[],
                    help="cherche un mot dans le corps, pas dans les titres")
    ap.add_argument("--num", action="append", default=[], type=int,
                    help="numero d'invocation dans l'edition (le meme partout)")
    ap.add_argument("--depuis", type=int, default=0,
                    help="premiere page du corps (saute la table des matieres)")
    ap.add_argument("--lignes", type=int, default=34,
                    help="lignes affichees par rubrique")
    ap.add_argument("--brut", action="store_true",
                    help="ne pas recoller les paragraphes")
    ap.add_argument("--large", action="store_true",
                    help="ne pas tronquer les lignes")
    a = ap.parse_args()

    pdf = PDFS / a.pdf
    if not pdf.exists():
        print(f"introuvable : {pdf}")
        return 1
    lg = lignes(pdf, a.depuis)

    if a.num:
        # Toutes les editions heritent de la numerotation de l'original, ce
        # qui donne un repere fiable la ou nos mots-cles ne sont que des
        # suppositions sur la langue d'arrivee.
        entrees = recolle([s for _, s in lg if lisible(s)])
        for cible in a.num:
            trouve = [e for e in entrees if re.match(rf"{cible}\.\s", e)]
            print(f"\n{'='*74}\n── invocation {cible}")
            for e in trouve or ["   [introuvable]"]:
                print("   " + (e if a.large else e[:118]))
        return 0

    if a.mot:
        mots = [aplati(m) for m in a.mot]
        for i, (n, s) in enumerate(lg):
            if any(m in aplati(s) for m in mots):
                print(f"\n──── p{n}")
                for j in range(max(0, i - 3), min(len(lg), i + 6)):
                    if lisible(lg[j][1]):
                        print(("  > " if j == i else "    ") + lg[j][1][:118])
        return 0

    secs = sections(lg)
    if not a.titres:
        for n, titre, corps in secs:
            print(f"p{n:<4} [{len(corps):>3}] {titre[:96]}")
        print(f"\n{len(secs)} rubrique(s) — relancer avec un fragment de titre")
        return 0

    cibles = [aplati(t) for t in a.titres]
    for n, titre, corps in secs:
        if any(c in aplati(titre) for c in cibles):
            print(f"\n{'='*74}\np{n} — {titre}")
            for l in (corps if a.brut else recolle(corps))[:a.lignes]:
                print("   " + (l if a.large else l[:118]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
