#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Decode les entites HTML restees brutes dans les corpus coraniques.

Certaines traductions ont ete moissonnees depuis des pages web et ont garde
leurs entites. Le rendu passe par `textContent` (quran.js:213), donc le lecteur
turc ou haoussa lisait « &quot; » en toutes lettres. On decode a la source : la
page du Coran et les duas coraniques en profitent d'un coup, sans decodeur a
poser sur chaque chemin d'affichage.

Le decodage se fait sur les chaines apres analyse JSON, jamais sur le texte du
fichier : « &quot; » devenu guillemet nu au milieu d'une chaine casserait tout.

    python scripts/clean_entities.py           # etat des lieux
    python scripts/clean_entities.py --write   # corrige
"""
import html
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
CORPUS = ROOT / "content" / "quran"
ENT = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,10}|#\d{1,6}|#x[0-9a-fA-F]{1,5});")
ECRIRE = "--write" in sys.argv


def compte(x):
    if isinstance(x, str):
        return len(ENT.findall(x))
    if isinstance(x, list):
        return sum(compte(v) for v in x)
    if isinstance(x, dict):
        return sum(compte(v) for v in x.values())
    return 0


def decode(x):
    if isinstance(x, str):
        # une seule passe : « &amp;quot; » doit rester « &quot; »
        return ENT.sub(lambda m: html.unescape(m.group(0)), x)
    if isinstance(x, list):
        return [decode(v) for v in x]
    if isinstance(x, dict):
        return {k: decode(v) for k, v in x.items()}
    return x


def main():
    total = 0
    for p in sorted(CORPUS.glob("quran-*.json")):
        data = json.loads(p.read_text(encoding="utf-8"))
        n = compte(data)
        if not n:
            continue
        total += n
        print(f"{p.stem:<12} {n:>6} entite(s)")
        if ECRIRE:
            p.write_text(
                json.dumps(decode(data), ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8")

    if not total:
        print("aucune entite brute")
    elif ECRIRE:
        print(f"\n{total} entite(s) decodee(s)")
    else:
        print(f"\n{total} entite(s) — relancer avec --write")
    return 0


if __name__ == "__main__":
    sys.exit(main())
