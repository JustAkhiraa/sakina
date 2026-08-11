"""Assemble les chapitres markdown de ce dossier en books/miracles.json.

    python books/src/miracles/build.py

Les chemins sont calculés depuis l'emplacement du script : il fonctionne
quel que soit le répertoire courant.
"""
import json, os, sys

sys.stdout.reconfigure(encoding="utf-8")
S = os.path.dirname(os.path.abspath(__file__))          # ce dossier
OUT = os.path.join(S, "..", "..", "miracles.json")      # books/miracles.json

spec = [
    ("m01_defi.md",         "Le défi lancé par le Coran",             "Le point de départ"),
    ("m02_bayani.md",       "L'inimitabilité de la parole",           "Le miracle du texte"),
    ("m03_ummi.md",         "Un messager qui ne lisait pas",          "Le miracle du texte"),
    ("m04_coherence.md",    "Vingt-trois ans sans contradiction",     "Le miracle du texte"),
    ("m05_preservation.md", "Un texte préservé",                      "Le miracle du texte"),
    ("m06_rum.md",          "La prophétie de Rome",                   "Les annonces accomplies"),
    ("m06b_annonces.md",    "Abû Lahab, Badr et les bracelets de Khosrô","Les annonces accomplies"),
    ("m07_methode.md",      "Comment lire les versets de la création","Les signes dans la création"),
    ("m07b_comptages.md",   "Les comptages : refaites le calcul",     "Les signes dans la création"),
    ("m08_ciel.md",         "Le ciel et l'origine de l'univers",      "Les signes dans la création"),
    ("m09_terre.md",        "La terre, les montagnes et les mers",    "Les signes dans la création"),
    ("m10_humain.md",       "La création de l'être humain",           "Les signes dans la création"),
    ("m11b_vivant.md",      "L'abeille, la mouche et les vents",        "Les signes dans la création"),
    ("m11_histoire.md",     "Pharaon, Saba et les cités disparues",   "Les signes dans la création"),
    ("m12_sunna.md",        "Les signes accordés au Prophète ﷺ",      "Les miracles de la Sunna"),
    ("m13_sources.md",      "Sources et références",                  "Références"),
]

chapters = []
for i, (fname, title, cat) in enumerate(spec, start=1):
    body = open(f"{S}/{fname}", encoding="utf-8").read().strip()
    chapters.append({"n": i, "title": title, "cat": cat, "text": body})

book = {
    "title": "Les Miracles du Coran",
    "titleAr": "معجزات القرآن",
    "author": "Sakina — guide original",
    "source": "Coran, hadiths authentifiés, travaux classiques de l'i'jâz et sources scientifiques et historiques publiées (voir chapitre Sources)",
    "chapters": chapters,
}

json.dump(book, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("chapitres:", len(chapters))
cur = None
for c in chapters:
    if c["cat"] != cur:
        cur = c["cat"]; print(f"\n== {cur} ==")
    print(f"  {c['n']:2d}. {c['title']:42s} {len(c['text']):5d} car.")
print("\ntotal:", sum(len(c['text']) for c in chapters), "caracteres")
