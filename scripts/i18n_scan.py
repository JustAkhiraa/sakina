#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Inventaire de tout ce qui est traduisible dans Sakina.

Le probleme que ce script resout
--------------------------------
Il n'y a jamais eu de liste. Les 1 244 cles de js/i18n/<langue>.js sont bien
regroupees, mais elles ne sont qu'une moitie de l'histoire : le texte source
francais, lui, vit disperse dans les donnees — additifs, duas, routines,
themes, sons, chapitres de livres — et les traductions s'y greffent par
`tf('cle', texteFrancais)`. Le repli est silencieux par construction : une
cle absente affiche le francais sans que rien ne le signale.

C'est pour cela qu'il « manquait toujours des trucs ». On ne peut pas
traduire ce qu'on n'a pas denombre.

Ce script denombre. Il parcourt les trois gisements — le HTML, les appels
t()/tf() dans le code, et les champs traduisibles des donnees declares
ci-dessous — et produit un inventaire unique : chaque cle, son texte
francais, et d'ou elle vient.

    python scripts/i18n_scan.py                 # couverture par langue
    python scripts/i18n_scan.py --missing ja    # ce qui manque en japonais
    python scripts/i18n_scan.py --orphans       # cles traduites mais inutilisees
    python scripts/i18n_scan.py --write         # ecrit scripts/out/i18n_inventory.json

Ajouter une source de texte
---------------------------
Tout est dans SOURCES ci-dessous. Une entree declare un fichier, comment y
lire les enregistrements, et le gabarit de cle. Rien d'autre a toucher :
le scan, le rapport et check.py suivent.
"""
import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "js" / "i18n"
OUT = ROOT / "scripts" / "out"

LANGS = ["en", "es", "ru", "bs", "ar", "tr", "fa", "ur", "hi", "bn",
         "id", "ms", "zh", "ja", "so", "sw", "ha"]


def slug(s):
    """Meme calcul que dans halal.js, routines.js et books.js."""
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return re.sub(r"-{2,}", "-", s)[:34]


# ── Gisement 3 : les champs traduisibles des donnees ─────────────────────
# (fichier, tableau exporte, champ-identifiant, champ-texte, gabarit de cle
#  [, motif d'exclusion])
# Le tableau doit etre nomme : catalog.js en porte dix-sept, et une regle
# posee sur le fichier entier les attraperait tous — c'est ainsi qu'un nom
# de son s'est retrouve indexe comme un theme.
#
# Le sixieme element est facultatif : un motif cherche dans l'enregistrement.
# S'il correspond, le texte est deja servi autrement a l'execution et n'a pas
# a etre traduit dans les dictionnaires. Une invocation portant « verses: »
# est rendue depuis content/quran/quran-<langue>.json (duas.js:41) ; la
# reclamer en turc revenait a demander une traduction qui existe deja, et
# c'est ce qui faisait dire a l'inventaire qu'il « manque toujours des trucs ».
SOURCES = [
    ("js/data/additives.js", "ADDITIVES",  "code",  "name",        "add.{cle}"),
    ("js/data/additives.js", "ADDITIVES",  "code",  "note",        "adn.{slug}"),

    ("js/data/duas.js",      "DUAS",       "id",    "title",       "dua.{cle}.t"),
    ("js/data/duas.js",      "DUAS",       "id",    "occasion",    "dua.{cle}.o"),
    ("js/data/duas.js",      "DUAS",       "id",    "translation", "dut.{cle}",
                                                    r"verses\s*:\s*['\"]"),
    ("js/data/duas.js",      "DUAS",       "catId", "cat",         "duacat.{cle}"),

    ("js/data/routines.js",  "ROUTINES",   "id",    "name",        "rt.{cle}.n"),
    ("js/data/routines.js",  "ROUTINES",   "id",    "desc",        "rt.{cle}.d"),
    ("js/data/routines.js",  "ROUTINES",   None,    "title",       "rtx.{slug}"),
    ("js/data/routines.js",  "ROUTINES",   None,    "note",        "rtn.{slug}"),

    ("js/data/catalog.js",   "BASE_THEMES","id",    "name",        "bth.{cle}"),
    ("js/data/catalog.js",   "SKINS",      "id",    "name",        "skn.{cle}"),
    ("js/data/catalog.js",   "SKINS",      "id",    "desc",        "skd.{cle}"),
    ("js/data/catalog.js",   "THEMES",     "key",   "name",        "thm.{cle}"),
    ("js/data/catalog.js",   "SOUNDS",     "id",    "name",        "snd.{cle}"),
    ("js/data/catalog.js",   "AVATARS",    "id",    "name",        "avt.{cle}"),
    ("js/data/catalog.js",   "TITLES",     "id",    "name",        "ttl.{cle}"),
    ("js/data/catalog.js",   "CALC_METHODS","id",   "name",        "cm.{cle}.n"),
    ("js/data/catalog.js",   "CALC_METHODS","id",   "desc",        "cm.{cle}.d"),
    ("js/data/catalog.js",   "LANG_REGIONS","id",   "label",       "reg.{cle}"),
    ("js/data/catalog.js",   "MADHABS",    "id",    "name",        "mdh.{cle}"),
]

# Les sigles institutionnels et les noms propres n'ont pas de cle : tf()
# retombe alors sur le catalogue, et c'est voulu.
SANS_CLE = {"cm.12.n", "cm.2.n", "cm.13.n", "cm.20.n", "cm.17.n", "cm.15.d"}

# Gabarits construits en JS a partir d'un identifiant : on les reconnait
# pour ne pas les confondre avec des cles statiques manquantes.
DYNAMIQUES = re.compile(
    r"^(add|adn|dua|dut|duacat|rt|rtx|rtn|bth|skn|skd|thm|snd|avt|ttl|cm|reg"
    r"|mdh|hds|pr|hij|bkc|bkg|bks|bkv|bk|gd|crit)\.")


def dico(code):
    """Les cles declarees dans un dictionnaire de langue."""
    src = (I18N / f"{code}.js").read_text(encoding="utf-8")
    return set(re.findall(r'^\s*"([\w.-]+)"\s*:', src, re.M))


def sans_objet(code, cle):
    """Cette cle a-t-elle un sens dans cette langue ?

    Le sens d'une invocation n'a pas a etre traduit en arabe : le texte
    arabe est deja affiche au-dessus, et duas.js n'affiche donc aucune
    ligne de traduction dans cette langue. Les compter comme manquantes
    reviendrait a reclamer une traduction de l'arabe vers l'arabe."""
    return code == "ar" and cle.startswith("dut.")


def cles_html():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    # -title et -aria comptent autant que le reste : ils ne se voient pas,
    # ce qui est bien la raison pour laquelle ils avaient echappe aux passes
    # de traduction precedentes.
    return {k: "index.html"
            for k in re.findall(
                r'data-i18n(?:-html|-ph|-title|-aria)?="([\w.-]+)"', html)}


def cles_code():
    """Appels t('cle') / tf('cle', …) / tfSrc('cle', …) a cle litterale."""
    out = {}
    appel = re.compile(r"(?<![\w.$])(?:t|tf|tfSrc)\(\s*['\"]([\w.-]+)['\"]")
    for f in sorted(ROOT.glob("js/**/*.js")):
        # i18n.js documente son propre usage — ses t('cle') d'exemple ne
        # sont pas des cles.
        if f.parent.name == "i18n" or f.name == "i18n.js":
            continue
        rel = f.relative_to(ROOT).as_posix()
        for k in appel.findall(f.read_text(encoding="utf-8")):
            out.setdefault(k, rel)
    return out


def _chaines_js(src):
    """Objets de premier niveau d'un module de donnees, en texte brut."""
    blocs, prof, debut = [], 0, None
    for i, c in enumerate(src):
        if c == "{":
            if prof == 0:
                debut = i
            prof += 1
        elif c == "}":
            prof -= 1
            if prof == 0 and debut is not None:
                blocs.append(src[debut:i + 1]); debut = None
    return blocs


def _champ(bloc, nom):
    m = re.search(nom + r"\s*:\s*(['\"])((?:\\.|(?!\1).)*)\1", bloc, re.S)
    return m.group(2).replace("\\'", "'").replace('\\"', '"') if m else None


def _tableau(src, nom):
    """Le contenu du tableau « export const NOM=[ … ]; »."""
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


def cles_donnees():
    out = {}
    cache = {}
    for regle in SOURCES:
        fichier, tableau, cle_champ, val_champ, gabarit = regle[:5]
        exclu = re.compile(regle[5]) if len(regle) > 5 else None
        p = ROOT / fichier
        if not p.exists():
            continue
        if fichier not in cache:
            cache[fichier] = p.read_text(encoding="utf-8")
        corps = _tableau(cache[fichier], tableau)
        for bloc in _chaines_js(corps):
            if exclu and exclu.search(bloc):
                continue                     # servi ailleurs a l'execution
            val = _champ(bloc, val_champ)
            if not val:
                continue
            ident = _champ(bloc, cle_champ) if cle_champ else None
            if cle_champ and ident is None:
                # identifiant numerique : cm.12.n et consorts
                m = re.search(cle_champ + r"\s*:\s*(\d+)", bloc)
                ident = m.group(1) if m else None
                if ident is None:
                    continue
            k = gabarit.format(cle=ident or "", slug=slug(val))
            if k in SANS_CLE:
                continue
            out.setdefault(k, (fichier, val))
    return out


def livres_traduisibles():
    """Seuls les guides que nous avons ecrits. Riyad as-Salihin, la Citadelle
    et les 99 Noms sont des traductions publiees : leurs 371 titres de
    chapitres ne sont pas a nous, et les compter fausserait la couverture."""
    src = (ROOT / "js/features/books.js").read_text(encoding="utf-8")
    noms = set()
    for bloc in re.findall(r"\{[^{}]*?translatable\s*:\s*true[^{}]*?\}", src, re.S):
        m = re.search(r"src\s*:\s*'content/books/([\w.-]+)'", bloc)
        if m:
            noms.add(m.group(1))
    # le bloc d'un livre contient des sous-objets : on repasse en large
    for m in re.finditer(r"src:'content/books/([\w.-]+)',translatable:true", src):
        noms.add(m.group(1))
    return noms


def cles_livres():
    out = {}
    permis = livres_traduisibles()
    for p in sorted((ROOT / "content" / "books").glob("*.json")):
        if re.search(r"\.[a-z]{2}\.json$", p.name) or p.name not in permis:
            continue
        try:
            d = json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            continue
        for c in d.get("chapters", []):
            if c.get("title"):
                out.setdefault(f"bkc.{slug(c['title'])}", (p.name, c["title"]))
            if c.get("cat"):
                out.setdefault(f"bkg.{slug(c['cat'])}", (p.name, c["cat"]))
    return out


def inventaire():
    inv = {}
    for k, ou in cles_html().items():
        inv[k] = {"source": ou, "fr": None}
    for k, ou in cles_code().items():
        inv.setdefault(k, {"source": ou, "fr": None})
    for k, (ou, fr) in {**cles_donnees(), **cles_livres()}.items():
        inv[k] = {"source": ou, "fr": fr}
    fr = dico("fr")
    for k, v in inv.items():
        # Certaines familles ont leur francais dans les donnees et non dans
        # fr.js : c'est le cas des traductions d'invocations, ou le texte
        # francais est l'original et tfSrc() s'y arrete. Les compter comme
        # manquantes reviendrait a reclamer une traduction du francais vers
        # le francais.
        v["source_fr"] = "donnees" if v["fr"] else "dictionnaire"
        v["dans_fr"] = bool(v["fr"]) or k in fr
    return inv


def main():
    args = sys.argv[1:]
    inv = inventaire()
    fr = dico("fr")

    if "--orphans" in args:
        utilisees = set(inv)
        orph = sorted(k for k in fr
                      if k not in utilisees and not DYNAMIQUES.match(k))
        print(f"{len(orph)} cle(s) traduites que rien n'utilise\n")
        for k in orph:
            print(f"   {k}")
        return 0

    cible = next((a[10:] for a in args if a.startswith("--missing=")), None)
    if cible is None and "--missing" in args:
        i = args.index("--missing")
        cible = args[i + 1] if i + 1 < len(args) else None
    if cible:
        d = dico(cible)
        attendu = {k: v for k, v in inv.items() if not sans_objet(cible, k)}
        manque = sorted(k for k, v in attendu.items()
                        if k not in d and not (cible == "fr" and v["fr"]))
        print(f"── {cible} : {len(manque)} cle(s) a traduire sur {len(attendu)}\n")
        for k in manque:
            src = inv[k]["fr"] or fr.get(k) or ""
            print(f"{k}\n    {src[:110]}")
        return 0

    if "--write" in args:
        OUT.mkdir(exist_ok=True)
        f = OUT / "i18n_inventory.json"
        f.write_text(json.dumps(inv, ensure_ascii=False, indent=1,
                                sort_keys=True), encoding="utf-8")
        print(f"{len(inv)} cles ecrites dans {f.relative_to(ROOT)}")
        return 0

    # ── rapport de couverture
    par_source = defaultdict(int)
    for v in inv.values():
        par_source[v["source"]] += 1
    print(f"inventaire : {len(inv)} cles traduisibles\n")
    print("── d'ou elles viennent")
    for s, n in sorted(par_source.items(), key=lambda x: -x[1])[:12]:
        print(f"   {n:>5}  {s}")

    hors_fr = sorted(k for k, v in inv.items() if not v["dans_fr"])
    if hors_fr:
        print(f"\n── {len(hors_fr)} cle(s) utilisees mais absentes de fr.js")
        for k in hors_fr[:15]:
            print(f"   {k}   ({inv[k]['source']})")

    print("\n── couverture")
    for code in ["fr"] + LANGS:
        d = dico(code)
        # Le francais est couvert des que le texte existe, qu'il soit dans
        # fr.js ou directement dans les donnees.
        attendu = {k for k in inv if not sans_objet(code, k)}
        n = sum(1 for k in attendu
                if k in d or (code == "fr" and inv[k]["fr"]))
        pct = 100 * n / max(1, len(attendu))
        barre = "█" * int(pct / 5) + "·" * (20 - int(pct / 5))
        note = "" if len(attendu) == len(inv) else f"  (sur {len(attendu)})"
        print(f"   {code}  {barre} {pct:5.1f}%  {len(attendu)-n:>4} manquante(s){note}")
    return 1 if hors_fr else 0


if __name__ == "__main__":
    sys.exit(main())
