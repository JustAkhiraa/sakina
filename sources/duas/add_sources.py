#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Remplace la reference libre des invocations par une reference structuree.

Le champ `ref:` etait une phrase francaise figee — « Coran, Taha (20:25-28) »,
« Abu Dawud & Tirmidhi » — affichee telle quelle a tout le monde, y compris
sous une interface japonaise. Traduire trente-sept phrases n'aurait rien
resolu de durable ; le vocabulaire, lui, est ferme : sept recueils et une
formule coranique.

On ajoute donc `sources: [...]` a chaque invocation. L'application recompose
la reference dans la langue lue : le nom de sourate vient de SURAH_NAMES, deja
traduit dans dix-sept langues, et les recueils d'un petit dictionnaire hds.*.
`ref:` reste en place comme trace de l'original.

    python sources/duas/add_sources.py [--write]
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent.parent
CIBLE = ROOT / "js" / "data" / "duas.js"

# id -> recueils. Les invocations purement coraniques n'en ont pas : leur
# reference se compose du seul renvoi `verses:`.
SOURCES = {
 "se-suffire-du-licite":        ["tirmidhi"],
 "demande-par-le-nom-supreme":  ["abudawud"],
 "au-reveil-standard":          ["bukhari", "muslim"],
 "gratitude-pour-la-sante":     ["tirmidhi"],
 "reveil-la-nuit-tahajjud":     ["bukhari"],
 "debloquer-une-situation":     ["ibnhibban"],
 "protection-totale-3":         ["abudawud", "tirmidhi"],
 "dhikr-hautement-recompense":  ["muslim"],
 "istikhara-consultation-divin": ["bukhari"],
 "avant-le-repas":              ["abudawud"],
 "apres-le-repas":              ["abudawud", "tirmidhi"],
 "doua-du-voyage":              ["muslim"],
 "entrer-a-la-mosquee":         ["muslim"],
 "sortir-de-la-mosquee":        ["muslim"],
 "avant-les-ablutions":         ["abudawud"],
 "apres-les-ablutions":         ["muslim"],
 "apres-chaque-priere":         ["muslim"],
 "en-cas-de-douleur":           ["muslim"],
 "en-sortant-de-la-maison":     ["abudawud", "tirmidhi"],
 "en-entrant-dans-la-maison":   ["abudawud"],
 "avant-d-entrer-aux-toilettes": ["bukhari", "muslim"],
 "en-sortant-des-toilettes":    ["abudawud", "tirmidhi", "ibnmajah"],
 "apres-les-2-rak-ahs-en-commu": ["ibnabishayba"],
 "la-main-sur-le-front-de-l-ep": ["abudawud", "ibnmajah"],
 "avant-les-rapports-intimes":  ["bukhari", "muslim"],
 "la-talbiya":                  ["bukhari", "muslim"],
 "sur-safa-et-marwa-3":         ["muslim"],
 "en-voyant-la-ka-ba":          ["bayhaqi"],
 "en-arrivant-a-safa":          ["muslim"],
 # Le verset se recite a cet endroit precis d'apres Abu Dawud : ce n'est pas
 # le verset qui vient de lui, mais l'usage. D'ou srcHow.
 "entre-le-coin-yemenite-et-la": ["abudawud"],
}
COMMENT = {"entre-le-coin-yemenite-et-la": "recited"}


def main():
    src = CIBLE.read_text(encoding="utf-8")
    faits, absents = 0, []

    for did, recueils in SOURCES.items():
        # on se pose sur le ref: du bloc portant cet id
        motif = re.compile(
            r"(id:\s*['\"]" + re.escape(did) + r"['\"][\s\S]{0,2500}?ref:\s*(['\"])(?:\\.|(?!\2).)*\2)")
        m = motif.search(src)
        if not m:
            absents.append(did)
            continue
        if re.search(r"sources:\s*\[", m.group(1)):
            continue
        liste = ",".join(f"'{r}'" for r in recueils)
        ajout = f",sources:[{liste}]"
        if did in COMMENT:
            ajout += f",srcHow:'{COMMENT[did]}'"
        src = src[:m.end(1)] + ajout + src[m.end(1):]
        faits += 1

    print(f"{faits} invocation(s) structurée(s)")
    if absents:
        print("introuvables :", ", ".join(absents))
    if "--write" in sys.argv:
        CIBLE.write_text(src, encoding="utf-8")
        print("écrit")
    else:
        print("relancer avec --write")


if __name__ == "__main__":
    main()
