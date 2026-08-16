#!/usr/bin/env python3
"""Génère un corpus coranique embarquable depuis l'API de Quran.com.

    python scripts/build_quran_corpus.py ja hi bs so sw ha
    python scripts/build_quran_corpus.py --list

Le README de data/ disait « ces fichiers sont produits à partir de l'API »
sans fournir de quoi les reproduire : voilà le script manquant.

Chaque fichier est un tableau de 114 sourates, chacune un tableau de versets
dans l'ordre — même format que les corpus déjà présents. Le résultat est
validé contre js/data/surahs.js : un décompte de versets qui ne correspond
pas fait échouer l'écriture plutôt que de livrer un corpus décalé, où le
verset affiché ne serait pas celui demandé.
"""
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
API = "https://api.quran.com/api/v4"
# api.quran.com renvoie 403 sans User-Agent explicite.
UA = {"User-Agent": "Sakina/1.0 (+offline Quran corpus builder)"}

# Traduction retenue par langue. Le choix privilégie les éditions de
# référence, celles qu'un lecteur de cette langue reconnaîtra.
CHOSEN = {
    "ja": (35,  "Ryoichi Mita"),
    "hi": (122, "Maulana Azizul Haque al-Umari"),
    "bs": (126, "Besim Korkut"),
    "so": (46,  "Mahmud Muhammad Abduh"),
    "sw": (231, "Dr. Abdullah Muhammad Abu Bakr & Sheikh Nasir Khamis"),
    "ha": (32,  "Abubakar Mahmoud Gumi"),
}


def get(url: str, tries: int = 4):
    for n in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45) as r:
                return json.load(r)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as e:
            if n == tries - 1:
                raise
            time.sleep(1.5 * (n + 1))
            print(f"      … nouvelle tentative ({e})")


def expected_counts() -> list[int]:
    src = (ROOT / "js/data/surahs.js").read_text(encoding="utf-8")
    return [int(v) for v in re.findall(r"v:(\d+)", src)]


# Les traductions portent des appels de note (<sup foot_note=…>) que
# l'application n'affiche pas, et parfois des <br>.
TAG = re.compile(r"<[^>]+>")


def clean(s: str) -> str:
    return re.sub(r"\s{2,}", " ", TAG.sub(" ", s or "")).strip()


def build(code: str) -> None:
    tid, author = CHOSEN[code]
    counts = expected_counts()
    print(f"\n── {code} · {author} (id {tid})")
    out = []
    for n in range(1, 115):
        data = get(f"{API}/quran/translations/{tid}?chapter_number={n}")
        verses = [clean(v.get("text", "")) for v in data["translations"]]
        if len(verses) != counts[n - 1]:
            raise SystemExit(
                f"✗ sourate {n} : {len(verses)} versets reçus, {counts[n-1]} attendus — "
                f"corpus abandonné pour « {code} »"
            )
        out.append(verses)
        if n % 20 == 0 or n == 114:
            print(f"      {n}/114")
        time.sleep(0.12)          # on ne martèle pas l'API

    total = sum(len(s) for s in out)
    if total != 6236:
        raise SystemExit(f"✗ {total} versets au total, 6236 attendus — corpus abandonné")

    path = ROOT / f"content/quran/quran-{code}.json"
    path.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    mb = path.stat().st_size / 1_048_576
    print(f"   ✓ {path.relative_to(ROOT)} — {total} versets, {mb:.2f} Mo")


def main() -> int:
    args = sys.argv[1:]
    if not args or args[0] == "--list":
        data = get(f"{API}/resources/translations")
        for t in sorted(data["translations"], key=lambda x: (x.get("language_name") or "")):
            print(f"{t['id']:>4}  {(t.get('language_name') or ''):<12} {t.get('author_name','')}")
        return 0
    unknown = [a for a in args if a not in CHOSEN]
    if unknown:
        raise SystemExit(f"✗ langue(s) sans traduction choisie : {', '.join(unknown)}")
    for code in args:
        build(code)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
