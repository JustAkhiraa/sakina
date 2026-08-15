#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extraction des traductions publiees de Hisn al-Muslim.

Pourquoi ce script existe
-------------------------
29 des 37 duas de Sakina viennent du hadith, pas du Coran : elles n'ont donc
pas de traduction dans les corpus coraniques embarques. Les traduire depuis
le francais donnerait la traduction d'une traduction — ce qu'on refuse. Il
faut aller la chercher dans une edition publiee de Hisn al-Muslim.

Les editions fournies (inspirations/docs trad/) :

    bs_Hisnul_muslim.pdf        bosniaque   texte extractible
    ha_garkuwan_musulmi.pdf     haoussa     texte extractible
    ja_Hisn_Almuslim.pdf        japonais    texte extractible
    so_Xisnul_Muslim.pdf        somali      texte extractible
    en_Hisn_El_Muslim.pdf       anglais     scan image — OCR requis
    sw_Kinga_Ya_Muislamu.pdf    swahili     scan image — OCR requis

Comment on ancre
----------------
Toutes ces editions sont bilingues : arabe + langue locale. L'arabe est donc
la cle commune. Mais l'extraction PDF le degrade beaucoup (ligatures
decomposees, lettres perdues, ordre bouscule dans le mot), si bien qu'une
recherche exacte ne trouve presque rien — 9 duas sur 28 pour le bosniaque,
0 pour le japonais.

On compare donc des *sacs de consonnes* sur fenetre glissante : on reduit
l'arabe a son squelette consonantique (harakat, hamzas et tatweel enleves,
formes de presentation ramenees aux lettres de base) puis on mesure le
recouvrement. Cela tolere a la fois les lettres manquantes et le desordre.
Resultat : plus aucun echec, et 25 ancrages sur 26 au-dela de 85 % pour le
bosniaque comme pour le haoussa.

Garde de confiance
------------------
Coller la mauvaise traduction sur une invocation est pire que la laisser en
francais. On n'accepte donc un ancrage que s'il est long (>= 30 consonnes),
quasi parfait (>= 0.95) et nettement meilleur que le deuxieme candidat non
adjacent (marge >= 0.06). Sans marge, une formule courte et repandue comme
« Bismillah » s'accroche a peu pres n'importe ou dans le livre.

Ce qui reste a resoudre
-----------------------
Hisn al-Muslim porte deux numerotations paralleles — les 132 chapitres et
les ~267 duas — ecrites au meme format (« 13- »). L'extraction texte les
confond, ce qui empeche pour l'instant d'utiliser le numero de chapitre
comme cle de repli la ou l'arabe est trop court ou trop banal (entree a la
mosquee, avant les ablutions, en sortant des toilettes…). Les distinguer
demande de regarder la mise en page (police, position) plutot que le texte
brut : fitz.get_text("dict") donne taille et graisse, un entete de chapitre
etant compose plus gros que le corps.

Usage
-----
    python scripts/extract_hisn.py            # rapport des ancrages surs
    python scripts/extract_hisn.py --all      # inclut les ancrages ecartes
"""
import argparse
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF requis :  pip install pymupdf")

ROOT = Path(__file__).resolve().parent.parent
PDFS = ROOT / "inspirations" / "docs trad"

BOOKS = [
    ("bs", "bs_Hisnul_muslim.pdf"),
    ("ha", "ha_garkuwan_musulmi.pdf"),
    ("ja", "ja_Hisn_Almuslim.pdf"),
    ("so", "so_Xisnul_Muslim.pdf"),
]

MIN_LEN, MIN_SCORE, MIN_MARGIN = 30, 0.95, 0.06

DIAC = re.compile(r"[ؐ-ًؚ-ٰٟۖ-ۭـ]")
ARABIC = re.compile(r"[؀-ۿﭐ-﷿ﹰ-﻿]")


def norm_ar(s):
    """Squelette consonantique : seul invariant qui survit a l'extraction."""
    s = unicodedata.normalize("NFKC", s)          # formes de presentation
    s = DIAC.sub("", s)                            # harakat, tatweel
    s = (s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
           .replace("ٱ", "ا").replace("ى", "ي").replace("ة", "ه")
           .replace("ؤ", "و").replace("ئ", "ي"))
    return re.sub(r"[^ء-ي]", "", s)


# ── Lecture des duas ────────────────────────────────────────────────────
def _read_js_string(s, i):
    q, i, out = s[i], i + 1, []
    while i < len(s):
        c = s[i]
        if c == "\\":
            out.append(s[i + 1]); i += 2; continue
        if c == q:
            return "".join(out)
        out.append(c); i += 1
    raise ValueError("chaine JS non terminee")


def _field(block, key):
    j = block.find(key + ":")
    while j >= 0:
        if j == 0 or block[j - 1] in " ,{\n":
            k = j + len(key) + 1
            while k < len(block) and block[k] in " \t":
                k += 1
            if k < len(block) and block[k] in "\"'":
                return _read_js_string(block, k)
            return None
        j = block.find(key + ":", j + 1)
    return None


def hadith_duas():
    """Les duas sans champ `verses` : celles qui viennent du hadith."""
    src = (ROOT / "js/data/duas.js").read_text(encoding="utf-8")
    blocks, depth, start = [], 0, None
    for i, c in enumerate(src):
        if c == "{":
            if depth == 0:
                start = i
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0 and start is not None:
                blocks.append(src[start:i + 1]); start = None
    out = []
    for b in blocks:
        did = _field(b, "id")
        if did and not _field(b, "verses"):
            out.append({"id": did, "arabic": _field(b, "arabic") or "",
                        "ref": _field(b, "ref") or ""})
    return out


# ── Ancrage ─────────────────────────────────────────────────────────────
def load_lines(path):
    doc = fitz.open(path)
    lines = []
    for pno in range(doc.page_count):
        for raw in doc[pno].get_text().split("\n"):
            s = raw.strip()
            if s:
                lines.append((pno, s, norm_ar(s)))
    doc.close()
    return lines


def candidates(lines, key, span=6):
    """Score de recouvrement pour chaque fenetre, meilleur d'abord."""
    want, n, out = Counter(key), len(key), []
    for i in range(len(lines)):
        buf = ""
        for j in range(i, min(i + span, len(lines))):
            buf += lines[j][2]
            if len(buf) > n * 2.2:
                break
            if len(buf) >= n * 0.7:
                out.append((sum((want & Counter(buf)).values()) / n, i))
                break
    out.sort(reverse=True)
    return out


def anchor(lines, arabic):
    """Rend (score, marge, index) ou None si l'ancrage n'est pas sur."""
    key = norm_ar(arabic)[:50]
    if len(key) < MIN_LEN:
        return None, f"arabe trop court ({len(key)} consonnes)"
    cand = candidates(lines, key)
    if not cand:
        return None, "aucun candidat"
    top, at = cand[0]
    rival = next((s for s, i in cand[1:] if abs(i - at) > 12), 0.0)
    margin = top - rival
    if top < MIN_SCORE:
        return None, f"score {top:.2f} < {MIN_SCORE}"
    if margin < MIN_MARGIN:
        return None, f"marge {margin:.2f} — ancrage ambigu"
    return (round(top, 3), round(margin, 3), at), None


def local_context(lines, at, before=2, after=15):
    """Lignes en langue locale autour de l'ancrage : l'arabe est ecarte."""
    out = []
    for i in range(max(0, at - before), min(len(lines), at + after)):
        s = lines[i][1]
        if len(ARABIC.findall(s)) > len(s) * 0.4:
            continue
        if re.search(r"[A-Za-z぀-ヿ一-鿿]", s):
            out.append(s)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--all", action="store_true",
                    help="inclut les ancrages ecartes par la garde")
    args = ap.parse_args()

    duas = hadith_duas()
    print(f"{len(duas)} duas hadithiques\n")

    kept, why = {}, {}
    for lang, name in BOOKS:
        path = PDFS / name
        if not path.exists():
            print(f"  {lang}: {name} absent — ignore")
            continue
        lines = load_lines(path)
        n = 0
        for d in duas:
            res, reason = anchor(lines, d["arabic"])
            if res is None:
                why.setdefault(d["id"], []).append(f"{lang}: {reason}")
                continue
            score, margin, at = res
            kept.setdefault(d["id"], {})[lang] = {
                "score": score, "margin": margin, "page": lines[at][0],
                "context": local_context(lines, at)}
            n += 1
        print(f"  {lang}: {n}/{len(duas)} ancrages surs")

    total = sum(len(v) for v in kept.values())
    print(f"\n{total} ancrages retenus, {len(kept)} duas touchees")

    out = ROOT / "scripts" / "hisn_anchors.json"
    out.write_text(json.dumps(kept, ensure_ascii=False, indent=1),
                   encoding="utf-8")
    print(f"ecrit : {out.relative_to(ROOT)}")

    if args.all:
        print("\n── ecartes ──")
        for did in sorted(why):
            if did not in kept:
                print(f"  {did}")
                for r in why[did]:
                    print(f"      {r}")


if __name__ == "__main__":
    main()
