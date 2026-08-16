#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Cherche chacun des 99 Noms dans le texte coranique.

Pourquoi : les sections « Invocation » de content/books/asma.json viennent
d'un livre publie (Al Bouraq). Les remplacer par une formule arabe de notre
composition serait inventer un texte d'adoration — exactement ce que le
projet s'interdit ailleurs.

La voie honnete est de rattacher chaque Nom a un verset ou il figure. Le
verset se sert alors depuis content/quran/quran-<langue>.json, comme les
invocations coraniques des duas : traduit d'office dans vingt-deux langues,
par des traductions publiees, sans que nous ecrivions un mot d'arabe.

Cet outil mesure ce qui est possible avant qu'on redige quoi que ce soit.

    python scripts/asma_verses.py             # couverture des 99 Noms
    python scripts/asma_verses.py --nom 55    # occurrences d'un Nom
    python scripts/asma_verses.py --absents   # ceux qui ne sont pas dans le Coran
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent

DIAC = re.compile(r"[ؐ-ًؚ-ٰٟۖ-ۭـ]")


def nu(s):
    """Arabe sans vocalisation ni variantes de graphie.

    Le Coran ecrit « الرحمٰن » avec un alif suscrit et la liste des Noms
    « الرَّحْمَنُ » avec les voyelles : sans cette reduction, aucun des deux
    ne rencontrerait l'autre."""
    s = unicodedata.normalize("NFKC", s or "")
    # Dans la graphie othmanienne, le « â » long s'ecrit souvent par un alif
    # suscrit (U+0670) plutot que par la lettre : « ٱلْخَٰلِقُ ». L'effacer comme une
    # voyelle donnait « الخلق », qui ne rencontrait plus « الخالق » de la liste
    # des Noms : vingt-deux Noms passaient pour absents du Coran alors que
    # la plupart figurent dans la sourate al-Hashr. On le convertit.
    s = s.replace("ٰ", "ا")
    s = DIAC.sub("", s)
    for a, b in (("أ", "ا"), ("إ", "ا"), ("آ", "ا"), ("ٱ", "ا"),
                 ("ى", "ي"), ("ة", "ه"), ("ؤ", "و"), ("ئ", "ي")):
        s = s.replace(a, b)
    return re.sub(r"[^ء-ي ]", "", s)


def formes(nom_ar):
    """Graphies sous lesquelles chercher un Nom.

    Un Nom se presente avec l'article dans la liste et sans lui dans bien
    des versets — « الغفور » ici, « غفور » la. On cherche les deux, la forme
    la plus longue d'abord pour ne pas compter un radical trop court."""
    base = nu(nom_ar).strip()
    out = [base]
    if base.startswith("ال") and len(base) > 4:
        out.append(base[2:])
    return out


def charge_noms():
    d = json.loads((ROOT / "content/books/asma.json").read_text(encoding="utf-8"))
    return [x for x in d["names"] if x.get("n")]        # on saute « Allah » (0)


def charge_coran():
    ar = json.loads((ROOT / "content/quran/quran-ar.json").read_text(encoding="utf-8"))
    return [(s + 1, a + 1, nu(v)) for s, sura in enumerate(ar)
            for a, v in enumerate(sura)]


def occurrences(coran, nom_ar, limite=None):
    cibles = formes(nom_ar)
    out = []
    for s, a, txt in coran:
        if any(f and f in txt for f in cibles):
            out.append((s, a))
            if limite and len(out) >= limite:
                break
    return out


def classe(coran, nom_ar, occ):
    """Trie les versets candidats du plus pertinent au moins.

    Chercher la racine seule ramene n'importe quoi : « السلام » trouve
    « Paix aux Envoyes », « الجبار » trouve « impitoyables despotes ». Ce
    n'est pas le Nom divin, c'est le mot commun.

    Trois indices que le mot designe bien Allah : l'article defini, la
    presence du mot « Allah » dans le verset, et le voisinage d'un autre des
    quatre-vingt-dix-neuf Noms — les versets qui en alignent plusieurs, comme
    la fin de la sourate al-Hashr, sont les meilleurs de tous."""
    defini = nu(nom_ar).strip()
    texte = {(s, a): t for s, a, t in coran}
    autres = [nu(y["ar"]).strip() for y in charge_noms()]
    out = []
    for s, a in occ:
        t = texte[(s, a)]
        sc = 0
        if defini in t:
            sc += 3
        if "الله" in t:
            sc += 2
        sc += min(3, sum(1 for o in autres if o != defini and o and o in t))
        # A score egal, le verset court se cite mieux sous une fiche.
        out.append((s, a, sc))
    return sorted(out, key=lambda p: (-p[2], len(texte[(p[0], p[1])])))


def main():
    noms = charge_noms()
    coran = charge_coran()
    args = sys.argv[1:]

    if "--nom" in args:
        n = int(args[args.index("--nom") + 1])
        x = next((y for y in noms if y["n"] == n), None)
        if not x:
            print(f"Nom {n} inconnu")
            return 1
        occ = occurrences(coran, x["ar"])
        print(f"{x['n']:>3}. {x['tr']} — {x['ar']}  ({x['fr']})")
        print(f"    {len(occ)} occurrence(s)\n")
        for s, a in occ[:40]:
            print(f"    {s}:{a}")
        return 0

    if "--proposer" in args:
        i = args.index("--proposer")
        deb = int(args[i + 1]) if len(args) > i + 1 and args[i + 1].isdigit() else 1
        fin = int(args[i + 2]) if len(args) > i + 2 and args[i + 2].isdigit() else deb + 24
        fr = json.loads((ROOT / "content/quran/quran-fr.json").read_text(encoding="utf-8"))
        for x in noms:
            if not (deb <= x["n"] <= fin):
                continue
            occ = occurrences(coran, x["ar"])
            print(f"\n{'─'*72}\n{x['n']:>3}. {x['tr']} — {x['fr']}")
            if not occ:
                print("     [le Nom ne figure pas comme substantif dans le Coran]")
                continue
            for s, a, sc in classe(coran, x["ar"], occ)[:3]:
                t = re.sub(r"<[^>]+>", "", fr[s - 1][a - 1])
                print(f"     {s}:{a} ({sc})  {t[:150]}")
        return 0

    trouves, absents = [], []
    for x in noms:
        occ = occurrences(coran, x["ar"])
        (trouves if occ else absents).append((x, occ))

    if "--absents" in args:
        print(f"── {len(absents)} Nom(s) hors du texte coranique\n")
        for x, _ in absents:
            print(f"  {x['n']:>3}. {x['tr']:<22} {x['ar']:<18} {x['fr']}")
        print("\n  Ces Noms viennent de la liste rapportee par at-Tirmidhi.")
        print("  Pour eux il faudra un hadith, ou rien.")
        return 0

    print(f"{len(noms)} Noms · {len(trouves)} dans le Coran · {len(absents)} hors du Coran\n")
    for x, occ in trouves:
        refs = " ".join(f"{s}:{a}" for s, a in occ[:3])
        print(f"  {x['n']:>3}. {x['tr']:<22} {len(occ):>4} occ.   {refs}")
    if absents:
        print(f"\n  {len(absents)} absent(s) — python scripts/asma_verses.py --absents")
    return 0


if __name__ == "__main__":
    sys.exit(main())
