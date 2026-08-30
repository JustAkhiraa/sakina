#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Texte francais ecrit en dur dans le code d'affichage.

Le probleme n'a jamais ete que des traductions manquaient : c'est que rien
n'empeche d'ecrire du francais directement dans un module. Une fonction
traduit sa premiere ligne et oublie les six suivantes, personne ne le voit,
et le francais ressort six mois plus tard sous une interface japonaise.

Cet outil cherche les chaines litterales francaises dans js/core et
js/features — la ou vit l'affichage. Il ignore :

  · js/data/    les catalogues, dont le francais EST la source ;
  · js/i18n/    les dictionnaires, francais compris ;
  · les commentaires, qui ne s'affichent pas.

Il sort en erreur des qu'il en trouve une : c'est un garde-fou, pas un
rapport. check.py l'appelle.

    python scripts/i18n_leaks.py           # liste
    python scripts/i18n_leaks.py --tout    # inclut les cas tolérés
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent

# Un mot francais se reconnait a ses signes ou a son vocabulaire courant.
# On reste large : mieux vaut une fausse alerte a lever explicitement qu'un
# oubli qui traverse dix-sept langues.
DIACRITIQUES = re.compile(r"[àâäçéèêëîïôöùûüœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŒÆ]")
MOTS = re.compile(
    r"(?<![-\w])(le|la|les|un|une|des|du|de|au|aux|et|ou|est|sont|dans|pour|par|sur"
    r"|avec|sans|vous|votre|vos|votre|cette|ce|ces|plus|moins|jour|jours"
    r"|prière|prières|invocation|aucun|aucune|tout|toute|tous"
    r"|sourate|sourates|verset|versets|chapitre|chapitres|note|notes"
    r"|page|pages|copie|impossible|supprimer|ajouter|modifier|annuler"
    r"|enregistrer|rechercher|chercher|erreur|réglages|paramètres"
    r"|semaine|mois|année|heure|heures|minute|minutes|seconde|secondes)(?![-\w])",
    re.I)

# Chaines qui ressemblent a du francais sans en etre, ou qui ne s'affichent
# jamais. Chaque entree doit se justifier en une ligne.
TOLERE = {
    "fr":            "code de langue",
    "Français":      "nom d'une langue, ecrit dans cette langue",
    "français":      "idem",
    "de":            "code de langue (allemand)",
    "des":           "fragment de selecteur",
}

SORTIES = re.compile(
    r"\.(?:textContent|innerHTML|innerText|title|placeholder|value)\s*=|"
    r"\b(?:label|name|desc|sub|titre)\s*:\s*['\"]|"
    r"toast\(|confirmDlg\(")


def chaines(src):
    """Chaines litterales du fichier, avec leur ligne. Commentaires exclus."""
    # On retire d'abord les commentaires, sinon chaque explication en francais
    # ressortirait comme une fuite.
    sans = re.sub(r"/\*[\s\S]*?\*/", lambda m: "\n" * m.group().count("\n"), src)
    sans = re.sub(r"(?<!:)//[^\n]*", "", sans)
    for m in re.finditer(r"""(['"`])((?:\\.|(?!\1)[^\\])*)\1""", sans):
        val = m.group(2)
        if val.strip():
            yield sans[:m.start()].count("\n") + 1, val, m.start(), sans


def sans_interpolations(val):
    """Retire chaque ${...} en comptant les accolades.

    Un motif ne peut suivre qu'une profondeur fixee d'avance ; celui d'ici
    n'en gerait qu'une. Le gabarit des resultats halal en imbrique trois, et
    `${f.note}` restait donc dans le texte examine : « note » ressortait
    comme du francais affiche alors que c'est un acces de propriete."""
    out, i, n = [], 0, len(val)
    while i < n:
        if val[i] == "$" and i + 1 < n and val[i + 1] == "{":
            profondeur, i = 1, i + 2
            while i < n and profondeur:
                if val[i] == "{":
                    profondeur += 1
                elif val[i] == "}":
                    profondeur -= 1
                i += 1
            out.append(" ")
        else:
            out.append(val[i])
            i += 1
    return "".join(out)


def texte_affiche(val):
    """Ce qui restera a l'ecran, une fois le gabarit resolu.

    Un litteral d'affichage est le plus souvent un gabarit HTML : il faut en
    retirer ce qui n'est pas du texte avant de chercher du francais, sinon
    chaque `${t('cle')}` et chaque nom de classe CSS ressort comme une fuite.
    """
    v = sans_interpolations(val)
    v = re.sub(r"<[^>]*>", " ", v)                              # balises et attributs
    v = re.sub(r"&[a-z]+;", " ", v)                             # entites
    return v.strip()


def suspecte(val):
    v = texte_affiche(val)
    if v in TOLERE or len(v) < 3:
        return False
    if not (DIACRITIQUES.search(v) or MOTS.search(v)):
        return False
    # Une cle de dictionnaire n'est pas du texte : « duas.copied »
    if re.fullmatch(r"[\w.-]+", v) and "." in v:
        return False
    # Du CSS, une classe, un selecteur — mais la garde doit rester etroite.
    # Ecrite « tout ce qui n'est fait que de mots et d'espaces », elle
    # ecartait aussi les phrases francaises sans accent : « Aucune invocation
    # pour cette recherche » passait pour un selecteur. On ne l'applique donc
    # qu'a ce qui ne ressemble pas a de la prose, c'est-a-dire a ce qui ne
    # contient pas deux mots separes par une espace.
    prose = re.search(r"[A-Za-zÀ-ÿ]{2,}\s+[A-Za-zÀ-ÿ]{2,}", v)
    if not prose and re.fullmatch(r"[\w #.>:\[\]=-]+", v):
        return False
    return True


def fichiers():
    """Les fichiers qui affichent. La racine de js/ porte les points d'entree
    de page — app.js, privacy.js : « ils affichent peu » n'est pas « rien »,
    la page de confidentialite est entierement pilotee depuis privacy.js."""
    return sorted(list((ROOT / "js/features").glob("*.js"))
                  + list((ROOT / "js/core").glob("*.js"))
                  + list((ROOT / "js/lib").glob("*.js"))
                  + list((ROOT / "js").glob("*.js")))


def scanner(tout=False):
    """Les fuites, sous forme (chemin, ligne, texte).

    check.py avait sa propre copie de cette boucle. Elargir la liste des
    dossiers ici ne changeait donc rien a la verification, et une faute de
    test introduite dans js/privacy.js est passee inapercue. Une seule
    boucle desormais, appelee des deux cotes."""
    fuites = []
    for f in fichiers():
        src = f.read_text(encoding="utf-8")
        for ligne, val, pos, sans in chaines(src):
            if not suspecte(val):
                continue
            # Un `label:` accompagne d'un `i18n:` sur le meme enregistrement
            # est un repli declare, pas une fuite — nav.js ecrit
            # t(it.i18n)||it.label et n'affiche le francais que si la cle
            # manque, ce que check.py verifie par ailleurs.
            debut_ligne = sans.rfind("\n", 0, pos) + 1
            fin_ligne = sans.find("\n", pos)
            if "i18n:" in sans[debut_ligne:fin_ligne if fin_ligne > 0 else len(sans)]:
                continue
            # On ne retient que ce qui part vers l'ecran : le contexte proche
            # contient une affectation d'affichage ou un gabarit HTML.
            autour = sans[max(0, pos - 160):pos + 40]
            if not (SORTIES.search(autour) or "<" in autour):
                if not tout:
                    continue
            fuites.append((f.relative_to(ROOT).as_posix(), ligne, val))

    return fuites


def main():
    fuites = scanner("--tout" in sys.argv)
    for chemin, ligne, val in fuites:
        print(f"{chemin}:{ligne}  « {val[:90]} »")
    print(f"\n{len(fuites)} chaîne(s) française(s) en dur dans le code d'affichage")
    return 1 if fuites else 0


if __name__ == "__main__":
    sys.exit(main())
