import json
"""Assemble les chapitres markdown de ce dossier en books/fruits.json.

    python books/src/fruits/build.py

Les chemins sont calculés depuis l'emplacement du script : il fonctionne
quel que soit le répertoire courant.
"""
import os, sys

sys.stdout.reconfigure(encoding="utf-8")
S = os.path.dirname(os.path.abspath(__file__))          # ce dossier
OUT = os.path.join(S, "..", "..", "fruits.json")        # books/fruits.json
spec = [
    ("ch_intro.md",    "Se soigner et prévenir en islam", "Fondements"),
    ("ch_dattes.md",   "La datte",                        "Les aliments cités dans le Coran"),
    ("ch_raisin.md",   "Le raisin",                       "Les aliments cités dans le Coran"),
    ("ch_figue.md",    "La figue",                        "Les aliments cités dans le Coran"),
    ("ch_olive.md",    "L'olive et l'huile d'olive",      "Les aliments cités dans le Coran"),
    ("ch_grenade.md",  "La grenade",                      "Les aliments cités dans le Coran"),
    ("ch_banane.md",   "La banane",                       "Les aliments cités dans le Coran"),
    ("ch_jujube.md",   "La jujube",                       "Les aliments cités dans le Coran"),
    ("ch_miel.md",     "Le miel",                         "Les aliments cités dans le Coran"),
    ("ch_nigelle.md",  "La nigelle (graine noire)",       "Les remèdes de la Sunna"),
    ("ch_orge.md",     "L'orge et la talbina",            "Les remèdes de la Sunna"),
    ("ch_vinaigre.md", "Le vinaigre",                     "Les remèdes de la Sunna"),
    ("ch_zamzam.md",   "L'eau de Zamzam",                 "Les remèdes de la Sunna"),
    ("ch_sources.md",  "Sources et références",           "Références"),
]
chapters = []
for i, (fname, title, cat) in enumerate(spec, start=1):
    body = open(f"{S}/{fname}", encoding="utf-8").read().strip()
    chapters.append({"n": i, "title": title, "cat": cat, "text": body})
book = {
    "title": "Les Aliments dans le Coran et la Sunna",
    "titleAr": "الأطعمة في القرآن والسنة",
    "author": "Sakina — guide original",
    "source": "Coran, hadiths authentifiés et recherche scientifique actuelle (voir chapitre Sources)",
    "chapters": chapters,
}
json.dump(book, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("chapitres:", len(chapters))
