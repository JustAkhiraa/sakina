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


def main():
    try:
        charge = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        return 0                      # entree illisible : on ne bloque rien

    p = chemin(charge).replace("\\", "/")
    if not p or not SURVEILLE.search(p):
        return 0

    r = subprocess.run([sys.executable, str(ROOT / "scripts" / "check.py")],
                       capture_output=True, text=True, encoding="utf-8",
                       errors="replace", cwd=str(ROOT))
    if r.returncode == 0:
        return 0

    # On ne renvoie que les erreurs : les notes rendraient le retour illisible.
    sortie = (r.stdout or "") + (r.stderr or "")
    fautes = [l.rstrip() for l in sortie.splitlines()
              if l.strip().startswith(("✗", "-", "•")) or "  - " in l]
    detail = "\n".join(fautes[:12]) or sortie[-900:]
    print(json.dumps({
        "decision": "block",
        "reason": ("scripts/check.py échoue après cette édition :\n\n"
                   f"{detail}\n\nCorrigez avant de continuer."),
    }, ensure_ascii=False))
    return 0                          # le JSON porte la decision, pas le code


if __name__ == "__main__":
    sys.exit(main())
