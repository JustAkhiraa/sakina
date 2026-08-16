#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verset et questions pour chacun des 99 Noms — notre contenu.

Pourquoi ce fichier existe
--------------------------
Les sections « Invocation » et « Introspection » de content/books/asma.json
viennent d'un livre publie : « Les Essentiels — Les 99 Noms d'Allah », Souad
El Mansouri, editions Al Bouraq. Les diffuser en dix-sept langues serait les
rediffuser en dix-sept langues, et retraduire leur francais irait contre la
regle que le projet s'applique partout ailleurs.

Ce qu'on met a la place
-----------------------
· `verse` — un renvoi coranique, pas un texte. Le verset est servi depuis
  content/quran/quran-<langue>.json, comme les invocations coraniques des
  duas : traduit d'office dans vingt-deux langues, par des traductions
  publiees, sans que nous ecrivions un mot d'arabe. Aucune formule
  d'adoration n'est composee ici — inventer un texte de priere serait pire
  que de citer celui d'un autre.

· `ask` — deux questions, les notres. Courtes, concretes, tournees vers
  l'action. Elles s'adressent a un lecteur musulman : on ne lui explique pas
  ce qu'est l'invocation, on lui donne de quoi travailler.

Le verset est choisi a la main, apres lecture. scripts/asma_verses.py
propose des candidats et les classe, il ne decide pas : « السلام » trouve
aussi « Paix aux Envoyes », et « الجبار » trouve « impitoyables despotes ».

    python sources/books/asma/noms.py          # etat d'avancement
    python sources/books/asma/noms.py --write  # ecrit content/books/asma.json
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent.parent.parent
CIBLE = ROOT / "content" / "books" / "asma.json"

# n : (verset, [question, question])
NOMS = {

1: ("17:110", [
    "Allah se laisse appeler par ce Nom comme par le Nom d'Allah lui-même. Lequel me vient spontanément quand je L'invoque, et pourquoi celui-là ?",
    "Je choisis aujourd'hui une personne envers qui ma patience s'épuise, et je lui accorde ce que j'attends d'Allah pour moi.",
]),
2: ("4:110", [
    "Ce verset lie la miséricorde au fait de reconnaître son tort. Qu'est-ce que je n'ai pas encore reconnu ?",
    "Je nomme une faute précise, je demande pardon pour elle aujourd'hui, et je décide de ce que je change.",
]),
3: ("20:114", [
    "Si la royauté véritable appartient à Allah seul, sur quoi est-ce que je me crois souverain sans l'être ?",
    "Je repère une chose que je tiens pour acquise — santé, temps, revenu — et je la traite aujourd'hui comme un prêt.",
]),
4: ("62:1", [
    "Tout ce qui est dans les cieux et sur terre Le glorifie. Qu'est-ce qui, dans ma journée, ne Le glorifie pas encore ?",
    "Je choisis une tâche ordinaire et je la fais aujourd'hui avec l'intention qu'elle devienne adoration.",
]),
5: ("59:23", [
    "La paix vient de Lui, elle ne se fabrique pas. Où est-ce que je la cherche ailleurs ?",
    "Je désigne une inquiétude que je remâche, et je la Lui remets aujourd'hui, une fois, sans y revenir.",
]),
6: ("59:23", [
    "Il donne la sécurité. Qu'est-ce que je protège avec anxiété, comme si cela ne dépendait que de moi ?",
    "Je rassure aujourd'hui quelqu'un qui a peur — d'un mot, d'un geste, d'une présence.",
]),
7: ("59:23", [
    "Rien ne Lui échappe et rien ne se fait sans qu'Il le veille. Cela me pèse-t-il ou me repose-t-il ?",
    "Je fais aujourd'hui, seul et sans témoin, un bien que personne ne saura.",
]),
8: ("3:6", [
    "Sa puissance ne se discute pas. À quelle puissance humaine est-ce que j'accorde plus de poids qu'elle n'en a ?",
    "Je repère une crainte du jugement des gens, et je fais aujourd'hui ce qui est juste malgré elle.",
]),
9: ("59:23", [
    "Il contraint ce que nul ne peut plier, et Il redresse ce qui est brisé. Qu'est-ce qui est brisé chez moi ?",
    "Je porte aujourd'hui devant Lui une chose que je n'arrive pas à réparer par mes propres forces.",
]),
10: ("59:23", [
    "La grandeur ne revient qu'à Lui. Sur quoi est-ce que je me hausse devant les autres ?",
    "Je reconnais aujourd'hui un tort devant quelqu'un que je considère comme mon inférieur.",
]),
11: ("6:102", [
    "Il est le Créateur de toute chose. Est-ce que je regarde encore ce qui m'entoure, ou est-ce que je ne le vois plus ?",
    "Je m'arrête aujourd'hui une minute devant une chose créée — un visage, un arbre, le ciel — et je la regarde vraiment.",
]),
12: ("59:24", [
    "Il produit sans modèle, à partir de rien. Qu'est-ce que je crois impossible à recommencer dans ma vie ?",
    "Je reprends aujourd'hui une chose que j'avais abandonnée, ne serait-ce que par un premier geste.",
]),

}


def main():
    d = json.loads(CIBLE.read_text(encoding="utf-8"))
    total = sum(1 for x in d["names"] if x.get("n"))
    faits = len(NOMS)

    if "--write" not in sys.argv:
        print(f"{faits}/{total} Nom(s) réécrits avec notre contenu")
        manque = [x["n"] for x in d["names"] if x.get("n") and x["n"] not in NOMS]
        if manque:
            print(f"restent : {manque[0]}–{manque[-1]} ({len(manque)})")
        print("\nrelancer avec --write pour écrire content/books/asma.json")
        return 0

    for x in d["names"]:
        n = x.get("n")
        if n not in NOMS:
            continue
        verset, questions = NOMS[n]
        x["verse"] = verset
        x["ask"] = questions
        x.pop("inv", None)          # Al Bouraq — remplace
        x.pop("intro", None)        # Al Bouraq — remplace

    # La mention de source disparait avec le contenu qu'elle couvrait.
    if all(x["n"] in NOMS for x in d["names"] if x.get("n")):
        d.pop("invocationSource", None)

    CIBLE.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n",
                     encoding="utf-8")
    print(f"content/books/asma.json — {faits} Nom(s) réécrits")
    return 0


if __name__ == "__main__":
    sys.exit(main())
