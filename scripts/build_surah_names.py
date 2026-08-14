#!/usr/bin/env python3
"""Noms de sourates traduits, depuis l'API de Quran.com.

    python scripts/build_surah_names.py

« Al-Fatiha » ne dit rien à un lecteur qui n'a jamais vu l'alphabet latin.
L'API expose, pour certaines langues, le SENS du nom de chaque sourate
(开端章, Открывающая Коран, সূচনা). On l'embarque à côté de la
translittération, qui reste l'index international.

Toutes les langues n'en ont pas : celles où l'API retombe sur l'anglais
sont écartées ici plutôt que de livrer « The Opener » à un lecteur hindi.
Le fichier produit ne contient donc que les langues réellement servies.
"""
import json
import sys
import time
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "Sakina/1.0 (+surah name builder)"}
LANGS = ["fr", "en", "es", "ru", "bs", "ar", "tr", "fa", "ur",
         "hi", "bn", "id", "ms", "zh", "ja", "so", "sw", "ha"]


def fetch(lang: str):
    url = f"https://api.quran.com/api/v4/chapters?language={lang}"
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45) as r:
        return json.load(r)["chapters"]


def main() -> int:
    english = [c["translated_name"]["name"] for c in fetch("en")]
    out = {}
    for lg in LANGS:
        if lg == "en":
            continue
        names = [c["translated_name"]["name"] for c in fetch(lg)]
        if len(names) != 114:
            print(f"  {lg} : {len(names)} sourates — ignoré")
            continue
        # L'API renvoie l'anglais quand elle n'a pas la langue : on refuse.
        same = sum(1 for a, b in zip(names, english) if a == b)
        if same > 100:
            print(f"  {lg} : l'API retombe sur l'anglais — ignoré")
            continue
        out[lg] = names
        print(f"  {lg} : 114 noms — ex. « {names[0]} », « {names[35]} »")
        time.sleep(0.2)

    path = ROOT / "js/data/surah-names.js"
    body = ",\n".join(
        f"  {lg}:{json.dumps(v, ensure_ascii=False)}" for lg, v in sorted(out.items())
    )
    path.write_text(
        "/* SAKINA — Sens du nom de chaque sourate, par langue.\n"
        "   Genere par scripts/build_surah_names.py depuis l'API de Quran.com.\n"
        "   Ne contient que les langues reellement traduites : une langue absente\n"
        "   signifie que l'API n'a pas mieux que l'anglais, et l'application\n"
        "   n'affiche alors que la translitteration et le nom arabe. */\n"
        f"export const SURAH_NAMES={{\n{body}\n}};\n",
        encoding="utf-8",
    )
    mb = path.stat().st_size / 1024
    print(f"\n✓ {path.relative_to(ROOT)} — {len(out)} langues, {mb:.0f} Ko")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
