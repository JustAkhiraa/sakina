#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Refuse un commit direct sur la branche principale.

Branche sur l'evenement PreToolUse de .claude/settings.json. Le travail se
fait sur une branche, la principale se met a jour par fusion : c'est ce qui
permet de relire un ensemble coherent plutot que des commits deja poses.

Le crochet ne juge que ses propres commits. Il laisse passer tout le reste,
y compris les commandes git qui ne commitent pas, et se tait completement
hors de ce depot — deux projets vivent cote a cote dans Projets/ et un
crochet charge dans la mauvaise session ne doit rien empecher.
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
PRINCIPALES = {"main", "master"}

# « git commit », seul ou dans une chaine. On ignore les essais a blanc et
# les formes qui ne creent rien.
COMMIT = re.compile(r"(^|[;&|]\s*)git\s+(?:-[^\s]+\s+)*commit\b")
INOFFENSIF = re.compile(r"--dry-run|--help")


def branche():
    try:
        r = subprocess.run(["git", "branch", "--show-current"],
                           capture_output=True, text=True, cwd=str(ROOT),
                           timeout=10)
        return r.stdout.strip()
    except Exception:
        return ""


def refus(motif):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": motif,
        }
    }, ensure_ascii=False))


def main():
    try:
        charge = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        return 0

    cmd = ((charge.get("tool_input") or {}).get("command") or "")
    if not COMMIT.search(cmd) or INOFFENSIF.search(cmd):
        return 0

    b = branche()
    if b not in PRINCIPALES:
        return 0

    refus(
        f"Commit direct sur « {b} » refusé. Le travail passe par une "
        f"branche, la principale se met à jour par fusion — c'est ce qui "
        f"permet de relire un ensemble cohérent.\n\n"
        f"    git switch -c <nom-de-branche>\n\n"
        f"puis recommencer le commit."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
