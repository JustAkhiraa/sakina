#!/usr/bin/env python3
"""Noms de sourates traduits, depuis l'API de Quran.com.

    python scripts/quran_names.py

« Al-Fatiha » ne dit rien à un lecteur qui n'a jamais vu l'alphabet latin.
L'API expose, pour certaines langues, le SENS du nom de chaque sourate
(开端章, Открывающая Коран, সূচনা). On l'embarque à côté de la
translittération, qui reste l'index international.

Toutes les langues n'en ont pas : celles où l'API retombe sur l'anglais
sont écartées plutôt que de livrer « The Opener » à un lecteur hindi.

Ce script ne perd jamais une langue déjà présente. Il l'a fait une fois :
lancé alors que l'API répondait mal, il a réécrit le fichier avec les deux
langues obtenues et effacé les quinze autres, sans que rien ne le signale.
Il relit donc l'existant, fusionne, et refuse d'écrire si le résultat
appauvrit le fichier — un échec réseau ne doit pas coûter des données.
"""
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
CIBLE = ROOT / "js/data/surah-names.js"
UA = {"User-Agent": "Sakina/1.0 (+surah name builder)"}
LANGS = ["fr", "en", "es", "ru", "bs", "ar", "tr", "fa", "ur",
         "hi", "bn", "id", "ms", "zh", "ja", "so", "sw", "ha"]


def fetch(lang: str):
    url = f"https://api.quran.com/api/v4/chapters?language={lang}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45) as r:
        return [c["translated_name"]["name"] for c in json.load(r)["chapters"]]


def existant() -> dict:
    """Ce que le fichier contient deja, pour ne rien perdre en chemin."""
    if not CIBLE.exists():
        return {}
    src = CIBLE.read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r'^\s*(\w+)\s*:\s*(\[.*?\])\s*,?\s*$', src, re.M):
        try:
            noms = json.loads(m.group(2))
        except json.JSONDecodeError:
            continue
        if len(noms) == 114:
            out[m.group(1)] = noms
    return out


def main() -> int:
    avant = existant()
    print(f"fichier actuel : {len(avant)} langue(s)")

    try:
        english = fetch("en")
    except Exception as e:
        print(f"l'API ne répond pas ({e}) — rien n'est écrit")
        return 1

    apres = dict(avant)
    apres["en"] = english
    for lg in LANGS:
        if lg == "en":
            continue
        try:
            noms = fetch(lg)
        except Exception as e:
            print(f"  {lg} : échec réseau ({e}) — on garde l'existant")
            continue
        if len(noms) != 114:
            print(f"  {lg} : {len(noms)} sourates — on garde l'existant")
            continue
        # L'API renvoie l'anglais quand elle n'a pas la langue : on refuse.
        # Pour l'anglais lui-meme ce serait la bonne reponse, d'ou l'exclusion
        # de la boucle plus haut.
        if sum(1 for a, b in zip(noms, english) if a == b) > 100:
            etat = "déjà présent, conservé" if lg in avant else "ignoré"
            print(f"  {lg} : l'API retombe sur l'anglais — {etat}")
            continue
        apres[lg] = noms
        print(f"  {lg} : 114 noms — ex. « {noms[0]} », « {noms[35]} »")
        time.sleep(0.2)

    perdues = sorted(set(avant) - set(apres))
    if perdues:
        print(f"\nrefus d'écrire : {', '.join(perdues)} disparaîtrai(en)t")
        return 1

    corps = ",\n".join(f"  {lg}:{json.dumps(v, ensure_ascii=False)}"
                       for lg, v in sorted(apres.items()))
    CIBLE.write_text(
        "/* SAKINA — Sens du nom de chaque sourate, par langue.\n"
        "   Genere par scripts/quran_names.py depuis l'API de Quran.com.\n"
        "   Ne contient que les langues reellement traduites : une langue absente\n"
        "   signifie que l'API n'a pas mieux que l'anglais, et l'application\n"
        "   n'affiche alors que la translitteration et le nom arabe. */\n"
        f"export const SURAH_NAMES={{\n{corps}\n}};\n",
        encoding="utf-8")
    neuves = sorted(set(apres) - set(avant))
    print(f"\n✓ {CIBLE.relative_to(ROOT)} — {len(apres)} langues"
          + (f", nouvelles : {', '.join(neuves)}" if neuves else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
