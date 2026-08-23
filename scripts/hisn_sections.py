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


# Les editions persane, ourdoue et arabe numerotent en chiffres indo-arabes.
# Sans cette table, --num ne trouve rien chez elles.
CHIFFRES = str.maketrans("۰۱۲۳۴۵۶۷۸۹"
                         "٠١٢٣٤٥٦٧٨٩",
                         "01234567890123456789")


def aplati(s):
    """Sans diacritiques ni casse. Python abaisse « İ » en i + point
    combinant : sans NFKD, « CÂMİYE » ne rencontrerait jamais « camiye »."""
    s = unicodedata.normalize("NFKD", s.replace("ı", "i").replace("I", "i"))
    return "".join(c for c in s if not unicodedata.combining(c)).lower()


def lignes(source, depuis):
    """Lignes numerotees par page, depuis un PDF ou un relevé OCR.

    Les editions scannees passent par hisn_ocr.py, qui depose son texte dans
    scripts/out/. Les lire ici evite un second outil qui ferait la meme chose
    avec une autre syntaxe."""
    if source.suffix == ".txt":
        txt = source.read_text(encoding="utf-8", errors="replace")
        # UTF-8 relu en latin-1 par l'OCR : « Qurâ€™an » pour « Qur'an »
        if "â€" in txt:
            txt = txt.encode("latin-1", "ignore").decode("utf-8", "ignore")
        out, page = [], 0
        for brut in txt.split("\n"):
            s = brut.strip()
            m = re.fullmatch(r"<<<PAGE (\d+)>>>", s)
            if m:
                page = int(m.group(1))
                continue
            if s and page >= depuis:
                out.append((page, s.translate(CHIFFRES)))
        return out

    doc = fitz.open(source)
    out = []
    for n in range(depuis, doc.page_count):
        for brut in doc[n].get_text().split("\n"):
            s = brut.strip()
            if s:
                out.append((n, s.translate(CHIFFRES)))
    doc.close()
    return out


# Les langues cibles a ecriture arabe — persan, ourdou — demandent l'inverse
# du filtre latin : c'est leur texte qu'il faut garder, pas ecarter. Pose par
# --rtl, faute de quoi lisible() rejetait la totalite d'une edition persane.
RTL = False


def lisible(s):
    """Garde ce qui ressemble a de la prose.

    En alphabet latin, il ne suffit pas d'ecarter l'arabe : l'edition
    indonesienne l'encode dans une police maison qui ressort en charabia
    latin (« B1א », « );B%1. »), repete quatre fois par ligne. Exiger un mot
    d'au moins trois minuscules ecarte ce bruit, les lettres isolees et la
    numerotation, sans toucher a la prose — les titres, tout en capitales,
    sont reconnus a part.

    En ecriture arabe, la regle s'inverse : on garde les lignes qui portent
    assez de lettres arabes pour etre du texte."""
    if RTL:
        return len(ARABE.findall(s)) >= 4
    if len(ARABE.findall(s)) > len(s) * 0.3:
        return False
    return bool(re.search(r"[a-zà-öø-ÿçğıöşü]{3}", s))


def recolle(corps):
    """Une invocation par ligne.

    L'extraction rend parfois un mot par ligne. On rassemble tout, puis on
    redecoupe sur la numerotation de l'edition, qui borne les invocations."""
    texte = re.sub(r"\s+", " ", " ".join(corps)).strip()
    if RTL:
        # En ecriture arabe le numero n'est pas toujours suivi d'un point, et
        # ce qui suit est une lettre arabe ou un chevron, jamais une capitale
        # latine. L'edition persane ecrit aussi bien « ۴۴ «اللهم » que
        # « ۱- «سبحان ».
        coupe = r"(?<!\d)(\d{1,3})\s*[.\-–]?\s*(?=[«\u0600-\u06FF])"
    else:
        coupe = r"(?<!\d)(\d{1,3})\s*[.\-–]\s*(?=[“\"'(A-ZÀ-Ý])"
    texte = re.sub(coupe, lambda m: "\n" + m.group(1) + ". ", texte)
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
    ap.add_argument("pdf", help="PDF dans inspirations/docs trad/, ou relevé "
                                ".txt dans scripts/out/")
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
    ap.add_argument("--rtl", action="store_true",
                    help="édition en écriture arabe (persan, ourdou)")
    a = ap.parse_args()
    global RTL
    RTL = a.rtl

    src = (ROOT / "scripts" / "out" / a.pdf) if a.pdf.endswith(".txt") else (PDFS / a.pdf)
    if not src.exists():
        print(f"introuvable : {src}")
        return 1
    lg = lignes(src, a.depuis)

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
