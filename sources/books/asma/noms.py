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
13: ("59:24", [
    "Il a donné à chaque être sa forme propre. Qu'est-ce que je reproche à la mienne ?",
    "Je repère aujourd'hui une chose que je critique chez quelqu'un et qu'il n'a pas choisie, et je me tais.",
]),
14: ("20:82", [
    "Le pardon est promis à qui se repent, croit, agit bien, puis tient le cap. Où est-ce que je m'arrête en chemin ?",
    "Je reprends aujourd'hui un repentir que j'avais formulé sans rien changer ensuite, et je change une chose.",
]),
15: ("38:65", [
    "Rien ne résiste à Sa domination. À quoi est-ce que je me soumets qui ne le mérite pas ?",
    "Je nomme une habitude qui me commande, et je lui désobéis une fois aujourd'hui.",
]),
16: ("3:8", [
    "Ce verset demande la constance après la guidée. Qu'est-ce qui menace la mienne en ce moment ?",
    "Je fais aujourd'hui un don que personne n'attend de moi et dont je n'attends rien.",
]),
17: ("51:58", [
    "La subsistance vient de Lui, pas de mon effort seul. Mon effort est-il devenu ma confiance ?",
    "Je partage aujourd'hui une part de ce que j'ai reçu, avant d'en avoir de trop.",
]),
18: ("34:26", [
    "Il ouvre ce qui est fermé et tranche ce qui est embrouillé. Quelle situation ai-je cessé de Lui présenter ?",
    "Je reprends aujourd'hui une porte que je croyais close — une démarche, une demande, une réconciliation.",
]),
19: ("2:32", [
    "Les anges reconnaissent ne savoir que ce qui leur fut enseigné. Où est-ce que je confonds mon avis et le savoir ?",
    "Je dis aujourd'hui « je ne sais pas » là où j'aurais improvisé une réponse.",
]),
20: ("2:245", [
    "Il resserre autant qu'Il étend, et les deux sont une faveur. Est-ce que je le crois quand Il resserre ?",
    "Je repère un manque actuel et j'y cherche aujourd'hui une chose que l'abondance m'aurait cachée.",
]),
21: ("2:245", [
    "Il étend Ses faveurs sans compter. Est-ce que je reçois large et donne étroit ?",
    "Je donne aujourd'hui plus que ce qui m'est demandé, une seule fois, sans le dire.",
]),
22: ("56:3", [
    "Ce Jour abaissera les uns et élèvera les autres. Sur quel classement d'ici-bas est-ce que je m'appuie ?",
    "Je renonce aujourd'hui à une occasion de me faire valoir.",
]),
23: ("58:11", [
    "Il élève en rang ceux qui croient et ceux à qui le savoir fut donné. Qu'ai-je appris cette semaine ?",
    "J'apprends aujourd'hui une chose précise de ma religion, et je la mets en pratique une fois.",
]),
24: ("3:26", [
    "L'honneur vient de Lui et ne s'arrache pas. Auprès de qui est-ce que je cherche à être considéré ?",
    "Je fais aujourd'hui honneur à quelqu'un que personne ne remarque.",
]),
25: ("3:26", [
    "Il abaisse qui Il veut. Qu'est-ce qui, chez moi, appelle cet abaissement ?",
    "Je repère un mépris que je porte à quelqu'un, et je le laisse tomber aujourd'hui.",
]),
26: ("2:127", [
    "Abraham et Ismaël bâtissent, puis demandent que ce soit accepté. Est-ce que je demande cela de mes actes ?",
    "Après ma prochaine prière, je demande aujourd'hui qu'elle soit acceptée — avant de passer à autre chose.",
]),
27: ("42:11", [
    "Rien ne Lui ressemble, et pourtant Il voit tout de moi. Qu'est-ce que je fais quand je me crois seul ?",
    "Je choisis aujourd'hui un moment où personne ne me voit, et j'y agis comme si l'on me voyait.",
]),
28: ("6:114", [
    "Chercherais-je un autre juge que Lui ? À quel tribunal est-ce que je porte mes affaires en premier ?",
    "Je repère un différend que j'entretiens, et je cherche aujourd'hui ce que le droit y dit, non ce qui m'arrange.",
]),
29: ("16:90", [
    "Il ordonne l'équité et la bienfaisance — l'une est due, l'autre est en plus. Laquelle me manque le plus ?",
    "Je rends aujourd'hui son dû à quelqu'un, puis j'y ajoute une chose qui n'était pas due.",
]),
30: ("6:103", [
    "Aucun regard ne L'atteint, et Il atteint tous les regards. Cela change-t-il ma manière de regarder ?",
    "Je fais aujourd'hui attention à un détail que personne ne remarquera — un soin, une propreté, une exactitude.",
]),
31: ("49:13", [
    "Le plus digne est le plus pieux, et Lui seul le sait. Sur quel autre classement est-ce que je juge les gens ?",
    "Je repère un jugement que je porte sur quelqu'un d'après son origine ou son rang, et je l'abandonne.",
]),
32: ("2:263", [
    "Une parole aimable vaut mieux qu'une aumône suivie d'un tort. Ai-je gâté un don par un reproche ?",
    "Je donne aujourd'hui sans le rappeler, et je m'interdis d'y revenir même en pensée.",
]),
33: ("56:96", [
    "L'ordre est simple : glorifier Son Nom. Combien de fois l'ai-je fait hier sans y penser ?",
    "Je dis aujourd'hui « Subhâna Rabbiyal 'Azhîm » dix fois, lentement, en comprenant chaque mot.",
]),
34: ("39:53", [
    "Il interdit de désespérer de Sa miséricorde. De quelle faute est-ce que je désespère ?",
    "Je nomme aujourd'hui la faute que je crois impardonnable, et je demande pardon pour elle.",
]),
35: ("42:23", [
    "Il rend meilleure la bonne action qu'on accomplit. Est-ce que j'attends de Lui à la mesure de cela ?",
    "Je fais aujourd'hui un bien minuscule sans le juger trop petit pour compter.",
]),
36: ("2:255", [
    "Il est le Très Haut, et rien ne Lui échappe. Qu'est-ce que je place au-dessus de Lui dans ma journée ?",
    "Je repère la première chose à laquelle je pense au réveil, et demain je la fais passer après Lui.",
]),
37: ("31:30", [
    "Ce qu'on invoque en dehors de Lui n'est que vanité. Qu'est-ce que j'appelle au secours avant de L'appeler ?",
    "Devant la prochaine difficulté, je L'invoque en premier — avant le téléphone, avant le calcul.",
]),
38: ("11:57", [
    "Il veille à la sauvegarde de toute chose. Qu'est-ce que je crains de perdre ?",
    "Je confie aujourd'hui à Sa garde une chose que je surveille avec angoisse, et je relâche ma prise.",
]),
39: ("4:85", [
    "Il veille sur toute chose et en tient le compte. Quelle intercession ai-je faite dernièrement, et pour quoi ?",
    "J'interviens aujourd'hui en faveur de quelqu'un qui ne peut pas parler pour lui-même.",
]),
40: ("4:86", [
    "Le verset demande de rendre mieux que le salut reçu. Où est-ce que je rends tout juste l'équivalent ?",
    "Je réponds aujourd'hui à une politesse par mieux qu'elle — un salut plus complet, un mot de plus.",
]),
41: ("55:78", [
    "Majesté et générosité vont ensemble en Lui. Est-ce que je sépare la crainte et l'espoir ?",
    "Je nomme aujourd'hui une chose que je crains de Lui et une chose que j'espère de Lui, à voix haute.",
]),
42: ("82:6", [
    "« Qu'est-ce qui t'a leurré au sujet de ton Noble Seigneur ? » Que répondrais-je honnêtement ?",
    "Je repère la facilité dont j'abuse en me disant qu'Il pardonnera, et je l'arrête aujourd'hui.",
]),
43: ("4:1", [
    "Il est l'Observateur, et le verset lie cette veille aux liens de parenté. Lequel ai-je laissé se rompre ?",
    "Je reprends aujourd'hui contact avec un proche que j'évite, ne serait-ce que par un message.",
]),
44: ("11:61", [
    "Il est proche et Il répond. Depuis combien de temps ne Lui ai-je rien demandé de précis ?",
    "Je formule aujourd'hui une demande claire, nommée, et non une prière vague.",
]),
45: ("2:268", [
    "Le Diable promet la pauvreté, Allah promet le pardon et l'abondance. Laquelle des deux voix est-ce que j'écoute ?",
    "Je donne aujourd'hui une somme qui me coûte un peu, précisément parce qu'elle me coûte.",
]),
46: ("34:27", [
    "Sa sagesse met chaque chose à sa place. Quelle décision de Lui est-ce que je n'accepte pas ?",
    "Je repense à un refus que j'ai reçu, et je cherche aujourd'hui ce qu'il m'a évité.",
]),
47: ("85:14", [
    "Il pardonne et Il aime — les deux ensemble. Est-ce que je crois qu'Il m'aime, ou seulement qu'Il me supporte ?",
    "Je dis aujourd'hui à quelqu'un que je l'aime pour Allah, sans autre raison.",
]),
48: ("11:73", [
    "Louange et gloire Lui reviennent, et les anges le rappellent à une famille. Ma maison le rappelle-t-elle ?",
    "Je prononce aujourd'hui une parole de louange à voix haute chez moi, devant les miens.",
]),
49: ("22:7", [
    "L'Heure viendra, et Il ressuscitera ceux qui sont dans les tombes. Est-ce que je vis en le sachant ?",
    "Je visite aujourd'hui un cimetière, ou à défaut je m'arrête cinq minutes à y penser vraiment.",
]),
50: ("4:79", [
    "Il suffit comme Témoin. Devant qui d'autre est-ce que je cherche à me justifier ?",
    "Je renonce aujourd'hui à me défendre une fois, en laissant le témoignage à Lui seul.",
]),
51: ("22:62", [
    "Il est la Vérité, et ce qu'on invoque hors de Lui est vanité. À quelle illusion est-ce que je tiens ?",
    "Je nomme aujourd'hui une chose à laquelle je donne un pouvoir qu'elle n'a pas, et je le lui retire.",
]),
52: ("3:173", [
    "« Allah nous suffit, quel excellent Garant. » Est-ce que je le dis, ou est-ce que je le pense vraiment ?",
    "Devant la prochaine inquiétude d'aujourd'hui, je dis cette phrase avant de chercher une solution.",
]),
53: ("11:66", [
    "Sa force sauve ceux qui croient au jour de l'humiliation. De quoi est-ce que je crains d'être humilié ?",
    "Je fais aujourd'hui une chose juste que je repoussais par peur du ridicule.",
]),
54: ("51:58", [
    "Sa force est inébranlable et ne connaît pas la fatigue. Où est-ce que je m'épuise à tenir seul ?",
    "Je demande aujourd'hui de l'aide pour une chose que je porte seul par orgueil.",
]),
55: ("2:257", [
    "Il fait sortir les croyants des ténèbres vers la lumière. Quelle est ma part d'ombre en ce moment ?",
    "Je nomme une chose que je cache, et j'en parle aujourd'hui à Lui, en détail.",
]),
56: ("31:26", [
    "Il se passe de tout et mérite toute louange. Est-ce que je Le loue seulement quand j'obtiens ?",
    "Je Le loue aujourd'hui pour une chose qui ne s'est pas passée comme je voulais.",
]),
57: ("19:94", [
    "Il les a tous comptés, un par un. Qu'est-ce que je fais en croyant que cela ne compte pas ?",
    "Je repère un petit manquement répété — un regard, un mot, une minute — et je l'arrête aujourd'hui.",
]),
58: ("85:13", [
    "Il commence puis recommence. Qu'est-ce que je crois définitivement perdu ?",
    "Je recommence aujourd'hui une bonne habitude que j'avais tenue puis lâchée.",
]),
59: ("85:13", [
    "Ce qu'Il a commencé, Il le refera. Est-ce que je vis comme si cette vie était la seule ?",
    "Je prends aujourd'hui une décision en pensant à l'autre vie plutôt qu'à celle-ci.",
]),
60: ("30:50", [
    "Il fait revivre la terre morte, et de même les morts. Quelle part de moi est en friche ?",
    "Je ranime aujourd'hui une pratique abandonnée — une lecture, une prière surérogatoire, un jeûne.",
]),
61: ("2:258", [
    "Abraham répond que son Seigneur donne la vie et la mort. Est-ce que je compte mes jours ?",
    "Je considère aujourd'hui une chose que je remets « à plus tard », et je la commence.",
]),
62: ("40:65", [
    "Il est le Vivant : le verset conclut par l'ordre de L'invoquer sincèrement. Ma sincérité est-elle entière ?",
    "Je fais aujourd'hui une invocation seul, sans rien en dire à personne.",
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
