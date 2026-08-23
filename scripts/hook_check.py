#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Lance check.py apres une edition, et rend la main en signalant les fautes.

Branche sur l'evenement PostToolUse de .claude/settings.json. Le projet n'a
ni build ni bundler : rien ne signale une regression au moment ou on l'ecrit.
Trois fois de suite la meme classe de faute est passee — des cles jamais
lues, des livres absents de leur table de traduction, des themes annonces
sans style — et n'a ete vue que des semaines plus tard, a l'ecran.

Ce crochet ramene la verification a l'instant de l'edition.

Il ne se declenche que sur ce que check.py sait verifier ; une edition de
script ou de documentation ne coute rien. Exit 2 signale la faute a
l'appelant, exit 0 reste silencieux.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

# Le JSON rendu porte des guillemets francais : sans cela Windows
# l'ecrirait en cp1252 et l'appelant le relirait de travers. On ne
# depend pas de PYTHONIOENCODING, que la commande peut oublier.
sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent

# Ce que check.py couvre reellement. Inutile de tourner sur le reste.
SURVEILLE = re.compile(r"(^|/)(js/.+\.js|css/.+\.css|index\.html|sw\.js)$")


def chemin(charge):
    """Le fichier touche, quel que soit le champ ou l'outil le range."""
    for source in (charge.get("tool_response") or {}, charge.get("tool_input") or {}):
        for cle in ("filePath", "file_path", "path"):
            if source.get(cle):
                return str(source[cle])
    return ""


def dans_ce_projet(p):
    """Le fichier touche appartient-il bien au projet de ce script ?

    Deux projets tournent en parallele sur cette machine, et un crochet
    charge dans la mauvaise session ne doit rien faire. Le script se situe
    par rapport a lui-meme, pas par rapport au repertoire courant : c'est la
    seule ancre qu'on ne peut pas se tromper.
    """
    try:
        Path(p).resolve().relative_to(ROOT)
        return True
    except (ValueError, OSError):
        return False


def main():
    try:
        charge = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        return 0                      # entree illisible : on ne bloque rien

    brut = chemin(charge)
    p = brut.replace("\\", "/")
    if not p or not SURVEILLE.search(p):
        return 0
    # Chemin absolu venu d'ailleurs : ce n'est pas notre affaire.
    if Path(p).is_absolute() and not dans_ce_projet(brut):
        return 0

    r = subprocess.run([sys.executable, str(ROOT / "scripts" / "check.py")],
                       capture_output=True, text=True, encoding="utf-8",
                       errors="replace", cwd=str(ROOT))
    if r.returncode == 0:
        return 0

    # check.py liste ses notes, puis une ligne « ✗ N probleme(s) », puis les
    # fautes. On ne renvoie que ce qui suit cette ligne : les notes noieraient
    # le message, et deviner un prefixe par faute s'est revele fragile.
    sortie = (r.stdout or "") + (r.stderr or "")
    lignes_sortie = sortie.splitlines()
    debut = next((k for k, l in enumerate(lignes_sortie)
                  if l.lstrip().startswith("✗")), None)
    fautes = ([l.strip() for l in lignes_sortie[debut + 1:] if l.strip()]
              if debut is not None else [])
    detail = chr(10).join(fautes[:12]) or sortie[-900:]
    print(json.dumps({
        "decision": "block",
        "reason": ("scripts/check.py échoue après cette édition :\n\n"
                   f"{detail}\n\nCorrigez avant de continuer."),
    }, ensure_ascii=False))
    return 0                          # le JSON porte la decision, pas le code


if __name__ == "__main__":
    sys.exit(main())
