#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Themes, accents et skins declares sans regle CSS.

Le catalogue (js/data/catalog.js) annonce des recompenses ; les tokens
(css/tokens.css) leur donnent leurs couleurs. Rien ne verifiait que les deux
listes se correspondent, et huit accents plus huit ambiances etaient
annonces sans exister :

  · un accent sans regle retombe sur :root, c'est-a-dire l'or. « Ardoise »,
    « Cuivre » et « Argent » affichaient donc tous de l'or ;
  · une ambiance sans regle garde les tokens sombres, alors que applyTheme
    peint deja le fond avec la teinte annoncee. Les six ambiances CLAIRES
    concernees donnaient un fond clair sous un texte clair — illisible.

    python scripts/theme_gaps.py
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent

# La valeur par defaut de :root — ces deux-la n'ont pas besoin de regle.
IMPLICITES = {"data-theme": {"dark"}, "data-accent": {"gold"}}

FAMILLES = [
    ("BASE_THEMES", "id",  "data-theme",  "ambiance"),
    ("THEMES",      "key", "data-accent", "accent"),
    ("SKINS",       "id",  "data-skin",   "skin"),
]


def tableau(src, nom):
    m = re.search(r"export const " + nom + r"\s*=\s*\[", src)
    if not m:
        return ""
    i, prof = m.end() - 1, 0
    for j in range(i, len(src)):
        if src[j] == "[":
            prof += 1
        elif src[j] == "]":
            prof -= 1
            if prof == 0:
                return src[i:j + 1]
    return src[i:]


def manquants():
    cat = (ROOT / "js/data/catalog.js").read_text(encoding="utf-8")
    css = "\n".join(p.read_text(encoding="utf-8")
                    for p in sorted((ROOT / "css").glob("*.css")))
    out = []
    for nom, champ, attr, libelle in FAMILLES:
        declares = re.findall(champ + r":'([\w_]+)'", tableau(cat, nom))
        en_css = set(re.findall(attr + r'="([\w_]+)"', css))
        for d in declares:
            if d not in en_css and d not in IMPLICITES.get(attr, set()):
                out.append((libelle, attr, d))
    return out


def main():
    trous = manquants()
    if not trous:
        print("chaque thème, accent et skin déclaré a sa règle CSS")
        return 0
    for libelle, attr, d in trous:
        print(f"  {libelle:<9} {attr}=\"{d}\"  — déclaré, aucune règle CSS")
    print(f"\n{len(trous)} entrée(s) annoncée(s) sans style")
    return 1


if __name__ == "__main__":
    sys.exit(main())
