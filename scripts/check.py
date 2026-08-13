#!/usr/bin/env python3
"""Vérifications d'intégrité de Sakina — à lancer avant chaque commit.

    python scripts/check.py

Le projet n'a ni build ni bundler : rien ne signale un chemin cassé. Le cas
le plus sournois est la liste SHELL du service worker, car un fichier
manquant y fait échouer l'installation **en silence** — l'application perd
le hors-ligne sans qu'aucune erreur n'apparaisse.

Ce script attrape cette classe de fautes :

  1. entrées SHELL / CORPUS du service worker introuvables
  2. imports ES qui ne résolvent vers aucun fichier
  3. getElementById(...) visant un identifiant qui n'existe nulle part
  4. clés data-i18n absentes du dictionnaire
  5. traductions déclarées sans fichier de corpus, et l'inverse
  6. livres du registre sans JSON, et l'inverse

Sortie : 0 si tout va bien, 1 sinon.
"""
import json
import os
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
ERRORS: list[str] = []
NOTES: list[str] = []


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def js_files() -> list[Path]:
    return sorted(ROOT.glob("js/**/*.js"))


# ── 1. Service worker : SHELL et CORPUS ──────────────────────────────────
def check_service_worker() -> None:
    sw = read("sw.js")
    listed = 0
    for block in ("SHELL", "CORPUS"):
        m = re.search(rf"const {block}\s*=\s*\[(.*?)\];", sw, re.S)
        if not m:
            ERRORS.append(f"sw.js : liste {block} introuvable")
            continue
        for path in re.findall(r"'\./([^']+)'", m.group(1)):
            listed += 1
            if not (ROOT / path).exists():
                ERRORS.append(f"sw.js [{block}] : « {path} » n'existe pas")
    # './' seul désigne index.html, déjà couvert
    NOTES.append(f"service worker : {listed} fichiers précachés vérifiés")

    # Tout module atteignable depuis app.js doit être précaché, sinon
    # l'application se charge en ligne mais casse hors connexion.
    shell = set(re.findall(r"'\./([^']+)'", sw))
    seen: set[Path] = set()
    stack = [ROOT / "js/app.js"]
    while stack:
        f = stack.pop()
        if f in seen or not f.exists():
            continue
        seen.add(f)
        for spec in re.findall(
            r"^\s*import\s+.*?from\s+['\"](\.[^'\"]+)['\"]", f.read_text(encoding="utf-8"), re.M
        ):
            stack.append((f.parent / spec).resolve())
    for f in sorted(seen):
        rel = f.relative_to(ROOT).as_posix()
        if rel not in shell:
            ERRORS.append(f"sw.js : « {rel} » est importé mais absent de SHELL (casse le hors-ligne)")
    NOTES.append(f"graphe de modules : {len(seen)} atteignables depuis app.js")

    # Les dictionnaires de langue sont importés dynamiquement : le graphe
    # statique ne les voit pas, il faut les vérifier à part.
    langs = sorted(ROOT.glob("js/i18n/*.js"))
    for p in langs:
        rel = p.relative_to(ROOT).as_posix()
        if rel not in shell:
            ERRORS.append(f"sw.js : « {rel} » absent de SHELL (langue indisponible hors ligne)")
    NOTES.append(f"dictionnaires de langue : {len(langs)} précachés")


# ── 2. Imports ES ────────────────────────────────────────────────────────
def check_imports() -> None:
    n = 0
    for f in js_files():
        src = f.read_text(encoding="utf-8")
        for spec in re.findall(r"^\s*import\s+.*?from\s+['\"](\.[^'\"]+)['\"]", src, re.M):
            n += 1
            target = (f.parent / spec).resolve()
            if not target.exists():
                ERRORS.append(f"{f.relative_to(ROOT)} : import « {spec} » introuvable")
    NOTES.append(f"imports ES : {n} vérifiés")


# ── 3. Identifiants DOM ──────────────────────────────────────────────────
def check_dom_ids() -> None:
    html = read("index.html")
    ids = set(re.findall(r'id="([^"]+)"', html))
    for f in js_files():
        src = f.read_text(encoding="utf-8")
        ids |= set(re.findall(r"""\.id\s*=\s*['"]([\w-]+)['"]""", src))
        ids |= set(re.findall(r"""id=\\?["']([\w-]+)\\?["']""", src))

    n = 0
    for f in js_files():
        src = f.read_text(encoding="utf-8")
        for m in re.finditer(r"""(?:getElementById\(|\$\()['"]([\w-]+)['"]\)""", src):
            n += 1
            if m.group(1) not in ids:
                line = src[: m.start()].count("\n") + 1
                ERRORS.append(
                    f"{f.relative_to(ROOT)}:{line} : identifiant « {m.group(1)} » introuvable"
                )
    NOTES.append(f"identifiants DOM : {n} références vérifiées")


# ── 4. Clés i18n ─────────────────────────────────────────────────────────
def check_i18n() -> None:
    """Le français fait référence : toute clé utilisée doit y figurer, et la
    couverture des autres langues se mesure par rapport à lui."""
    def keys_of(path: Path) -> set[str]:
        return set(re.findall(r'^\s*"([\w.]+)"\s*:', path.read_text(encoding="utf-8"), re.M))

    base = ROOT / "js/i18n/fr.js"
    if not base.exists():
        ERRORS.append("js/i18n/fr.js manquant : plus aucun repli de traduction")
        return
    ref = keys_of(base)
    used = set(re.findall(r'data-i18n="([\w.]+)"', read("index.html")))
    for k in sorted(used - ref):
        ERRORS.append(f"index.html : clé i18n « {k} » absente de js/i18n/fr.js")

    partial = []
    for p in sorted(ROOT.glob("js/i18n/*.js")):
        if p.name == "fr.js":
            continue
        n = len(keys_of(p) & ref)
        if n < len(ref):
            partial.append(f"{p.stem} {n}/{len(ref)}")
    if partial:
        NOTES.append("i18n incomplètes : " + ", ".join(partial))
    NOTES.append(
        f"i18n : {len(ref)} clés en français, {len(used)} utilisées, "
        f"{len(list(ROOT.glob('js/i18n/*.js')))} langues"
    )


# ── 5. Corpus coraniques ─────────────────────────────────────────────────
def check_quran() -> None:
    reg = read("js/data/translations.js")
    declared = set(re.findall(r"code:'(\w+)'", reg))
    on_disk = {p.stem.replace("quran-", "") for p in ROOT.glob("data/quran-*.json")}
    on_disk.discard("ar")  # le texte arabe n'est pas une traduction

    for c in sorted(declared - on_disk):
        ERRORS.append(f"translations.js : « {c} » déclaré mais data/quran-{c}.json manquant")
    for c in sorted(on_disk - declared):
        NOTES.append(f"data/quran-{c}.json présent mais non déclaré dans translations.js")

    if not (ROOT / "data/quran-ar.json").exists():
        ERRORS.append("data/quran-ar.json manquant : le lecteur n'a plus de texte arabe")
    NOTES.append(f"corpus : {len(declared)} traductions déclarées")


# ── 6. Livres ────────────────────────────────────────────────────────────
def check_books() -> None:
    src = read("js/features/books.js")
    for path in re.findall(r"src:'(books/[^']+)'", src):
        if not (ROOT / path).exists():
            ERRORS.append(f"books.js : « {path} » déclaré mais absent")

    for p in sorted(ROOT.glob("books/*.json")):
        rel = f"books/{p.name}"
        if rel not in src:
            NOTES.append(f"{rel} présent mais référencé nulle part dans books.js")
        try:
            json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            ERRORS.append(f"{rel} : JSON invalide ({e})")
    NOTES.append(f"livres : {len(list(ROOT.glob('books/*.json')))} JSON validés")


def main() -> int:
    for fn in (
        check_service_worker,
        check_imports,
        check_dom_ids,
        check_i18n,
        check_quran,
        check_books,
    ):
        try:
            fn()
        except Exception as e:  # une vérification cassée ne doit pas masquer les autres
            ERRORS.append(f"{fn.__name__} a échoué : {e}")

    for n in NOTES:
        print(f"  · {n}")
    print()
    if ERRORS:
        print(f"✗ {len(ERRORS)} problème(s) :\n")
        for e in ERRORS:
            print(f"    {e}")
        return 1
    print("✓ tout est cohérent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
