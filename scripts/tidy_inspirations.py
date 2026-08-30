#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Range inspirations/docs trad/ : doublons, editions redondantes, formats.

Le dossier a ete rempli en telechargeant tout ce que proposait IslamHouse,
d'ou des copies « (1) », des .doc a cote des .pdf, et des editions de luxe
qui pesent cent fois le fichier utile pour le meme contenu.

Trois familles sont ecartees, chacune pour une raison differente :

  · doublon      octet pour octet identique a un autre — aucune information
  · lourd        meme livre, meme langue, mais dix fois plus gros : ce sont
                 les editions haute definition ou les couvertures, inutiles
                 pour extraire du texte
  · format       .doc ou .docx quand le .pdf du meme nom existe

Rien n'est supprime : tout part dans _ecartes/, avec un rapport. C'est a
vous de vider ce dossier une fois le tri verifie.

    python scripts/tidy_inspirations.py            # simulation
    python scripts/tidy_inspirations.py --appliquer
"""
import hashlib
import re
import shutil
import sys
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "inspirations" / "docs trad"
OUT = DOCS / "_ecartes"

# Le fichier de reference pour chaque langue : celui qu'hisn_ocr.py et
# hisn_extract.py vont lire. Tout autre exemplaire du meme livre est du
# surplus.
GARDES = {
    "bs_Hisnul_muslim.pdf", "en_Hisn_El_Muslim.pdf", "es_Muslim_bastion.pdf",
    "fa_hisn_muslim.pdf", "ha_garkuwan_musulmi.pdf", "id_hisn_almuslim.pdf",
    "ja_Hisn_Almuslim.pdf", "ms_hisn_muslim.pdf",
    "risala_bn_hisn_almuslim.pdf", "risala_hi_hisnul-muslim_4.0.pdf",
    "risala_zh_hisn_new.pdf", "ru_Dua_iz_korana_i_sunny.pdf",
    "so_Xisnul_Muslim.pdf", "sw_Kinga_Ya_Muislamu.pdf",
    "tr_Hisnul_Muslim.pdf", "ur_Hisnul_Muslim.pdf",
}

# Racine du nom, une fois retires « (1) », « 2 », « _1436 », « _cover »…
SUFFIXES = re.compile(r"(\s*\(\d+\)|_\d{3,4}(_\d)?|_cover|\d)$", re.I)


def racine(p):
    return SUFFIXES.sub("", p.stem).lower().replace("-", "_")


def sha(p, limite=8 << 20):
    h = hashlib.sha256()
    with p.open("rb") as f:
        lu = 0
        while lu < limite:
            b = f.read(1 << 20)
            if not b:
                break
            h.update(b)
            lu += len(b)
    return h.hexdigest(), p.stat().st_size


def main():
    if not DOCS.is_dir():
        sys.exit(f"{DOCS} introuvable")
    appliquer = "--appliquer" in sys.argv

    fichiers = [p for p in DOCS.iterdir() if p.is_file()]
    ecartes = {}          # chemin -> (famille, raison)

    # 1 ── doublons exacts
    par_sha = defaultdict(list)
    for p in fichiers:
        par_sha[sha(p)].append(p)
    for groupe in par_sha.values():
        if len(groupe) < 2:
            continue
        # on garde le nom de reference, sinon le plus court
        groupe.sort(key=lambda p: (p.name not in GARDES, len(p.name)))
        for p in groupe[1:]:
            ecartes[p] = ("doublon", f"identique a {groupe[0].name}")

    # 2 ── meme livre, exemplaire plus lourd
    par_racine = defaultdict(list)
    for p in fichiers:
        if p not in ecartes:
            par_racine[racine(p)].append(p)
    for groupe in par_racine.values():
        pdfs = [p for p in groupe if p.suffix.lower() == ".pdf"]
        if len(pdfs) < 2:
            continue
        pdfs.sort(key=lambda p: (p.name not in GARDES, p.stat().st_size))
        ref = pdfs[0]
        for p in pdfs[1:]:
            if p.stat().st_size > ref.stat().st_size * 3:
                mo = p.stat().st_size / 1e6
                ecartes[p] = ("lourd", f"{mo:.0f} Mo pour le meme livre que {ref.name}")

    # 3 ── .doc/.docx doublant un .pdf
    pdfs = {racine(p) for p in fichiers if p.suffix.lower() == ".pdf"}
    for p in fichiers:
        if p in ecartes or p.suffix.lower() not in (".doc", ".docx"):
            continue
        if racine(p) in pdfs:
            ecartes[p] = ("format", "le PDF du meme livre est present")

    # ── rapport
    total = sum(p.stat().st_size for p in ecartes)
    restants = [p for p in fichiers if p not in ecartes]
    print(f"{len(fichiers)} fichiers · {len(ecartes)} a ecarter "
          f"({total/1e6:.0f} Mo) · {len(restants)} conserves\n")
    for famille in ("doublon", "lourd", "format"):
        lot = [(p, r) for p, (f, r) in ecartes.items() if f == famille]
        if not lot:
            continue
        print(f"── {famille} ({len(lot)})")
        for p, r in sorted(lot):
            print(f"   {p.name[:52]:<52} {r}")
        print()

    manque = sorted(GARDES - {p.name for p in restants})
    if manque:
        print("── references attendues et absentes")
        for m in manque:
            print(f"   {m}")
        print()

    if not appliquer:
        print("simulation — relancer avec --appliquer pour deplacer dans _ecartes/")
        return 0

    OUT.mkdir(exist_ok=True)
    for p in ecartes:
        shutil.move(str(p), str(OUT / p.name))
    print(f"{len(ecartes)} fichier(s) deplaces dans {OUT.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
