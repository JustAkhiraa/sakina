#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ajoute des cles d'interface dans tous les dictionnaires de langue.

Ajouter une chaine a l'interface veut dire toucher dix-huit fichiers. Fait a
la main, on en oublie un, et la langue oubliee retombe silencieusement sur
l'anglais — c'est exactement le genre de manque que l'inventaire finit par
signaler bien plus tard.

Un module d'apport declare un dictionnaire LOTS :

    LOTS = {"ma.cle": {"fr": "…", "en": "…", …}}

et cet outil le distribue. Une cle deja presente dans un fichier n'est jamais
ecrasee : on n'efface pas une traduction relue.

    python scripts/i18n_add.py sources/ui/nom_du_lot.py
"""
import importlib.util
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "js" / "i18n"


def charge(chemin):
    spec = importlib.util.spec_from_file_location("lot", chemin)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.LOTS


def applique(lots, remplace=False):
    langues = sorted(p.stem for p in I18N.glob("*.js") if p.stem != "index")
    total = 0
    for code in langues:
        p = I18N / f"{code}.js"
        src = p.read_text(encoding="utf-8")
        ajouts = []
        for cle, par_langue in lots.items():
            val = par_langue.get(code)
            if val is None:
                continue
            ligne = f"  {json.dumps(cle)}: {json.dumps(val, ensure_ascii=False)},"
            if f'"{cle}"' in src:
                if not remplace:
                    continue
                # on reecrit la ligne sur place, sans deplacer la cle
                nouveau = re.sub(rf'^\s*"{re.escape(cle)}"\s*:.*$', ligne,
                                 src, count=1, flags=re.M)
                if nouveau != src:
                    src = nouveau
                    total += 1
                continue
            ajouts.append(ligne)
        if ajouts:
            src = re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src)
            total += len(ajouts)
        p.write_text(src, encoding="utf-8")
        manque = [c for c in lots if not lots[c].get(code)]
        etat = f"+{len(ajouts)}"
        if manque:
            etat += f"  (sans traduction : {', '.join(manque)})"
        print(f"  {code:<3} {etat}")
    print(f"\n{total} clé(s) écrite(s)")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    remplace = "--remplace" in sys.argv
    for chemin in sys.argv[1:]:
        if chemin.startswith("--"):
            continue
        p = Path(chemin)
        if not p.is_absolute():
            p = ROOT / p
        print(f"── {p.name}{'  (réécriture)' if remplace else ''}")
        applique(charge(p), remplace)
    return 0


if __name__ == "__main__":
    sys.exit(main())
