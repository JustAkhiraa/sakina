---
name: duas-sakina
description: Relever les invocations d'une édition publiée de Hisn al-Muslim pour une langue. À charger avant de traduire, compléter ou vérifier les duas — explique la règle de provenance, les outils d'extraction, les pièges de chaque format d'édition, et ce qu'il ne faut jamais faire.
---

# Relever les invocations d'une langue

## La règle, avant tout

**On ne traduit jamais une traduction.** Deux sources, pas une troisième :

| Type d'invocation | Source | Traduction |
|---|---|---|
| Coranique (`verses:`) | `content/quran/quran-<langue>.json` | automatique, 22 langues |
| Prophétique | une édition **publiée** de Hisn al-Muslim | relevée à la main |

Sans édition dans une langue, on laisse le repli et on le **marque** — jamais
on ne rédige soi-même. Une invocation absente vaut mieux qu'une invocation
inventée.

## Où en est-on

```bash
python scripts/duas_coverage.py          # d'où vient chaque invocation
python scripts/i18n_scan.py --missing fa # ce qui manque dans une langue
```

## La méthode

### 1. Trouver l'édition

Dans `inspirations/docs trad/`. **Sonder avant tout** — c'est le pas qui a
été sauté, et trois éditions sont restées classées « sans source » des mois
durant alors qu'elles étaient lisibles.

```bash
python scripts/sonder_pdf.py "inspirations/docs trad/le_fichier.pdf"
```

Il rend un verdict et la voie à suivre. Il sait reconnaître une police
héritée écriture par écriture — en devanagari, si `ब` l'emporte sur `ि`, les
deux points de code ont été échangés — et il ne confond pas l'arabe cité par
une édition latine avec un texte en désordre.

1. **Plus de 500 caractères par page, texte juste** — on lit directement.
   C'est le cas du chinois et du hindi ; personne n'avait regardé.
2. **Du texte, mais dans le désordre** — les mots sortent en ordre visuel,
   coupés aux ligatures, en formes de présentation. Ce n'est pas du charabia :
   les coordonnées, elles, sont justes. `scripts/fa_pdf.py` reconstruit au
   caractère (regrouper par ligne, lire de droite à gauche, garder les
   espaces du PDF, NFKC). C'est le cas du persan.
3. **Du texte, mais aux mauvais points Unicode** — la police est hérité.
   Le PDF s'affiche juste, donc l'OCR des pages rendues lit juste. C'est le
   cas du hindi (ि ↔ ब échangés) et du bengali.
4. **Moins de 50 caractères par page** — vrai scan, seul l'OCR reste :
   `python scripts/hisn_ocr.py <langue>` (dépose dans `scripts/out/`).

**L'OCR n'est pas le premier recours, c'est le dernier.** Il lit bien mais
perd des lignes entières aux sauts de page — en persan il tronquait une
invocation sur quatre, en silence. Une couche texte reconstruite est
complète par construction.

### 2. Se repérer

Trois points d'entrée, du plus fiable au moins :

```bash
python scripts/hisn_sections.py <fichier> --num 66      # numéro d'entrée
python scripts/hisn_sections.py <fichier> "abdestten"   # titre de rubrique
python scripts/hisn_sections.py <fichier> --mot "..."   # mot du texte
python scripts/fa_rubrique.py "داخل شدن به توالت"        # persan, par rubrique
python scripts/fa_rubrique.py --liste                    # ses 109 rubriques
```

**Vérifier la numérotation avant de s'y fier.** La chinoise numérote ses 267
entrées, strictement croissantes : repère parfait. La persane numérote *par
rubrique* et repart à 1 à chaque fois — s'y fier donnait n'importe quoi. La
hindi porte les deux à la fois. Un `--num 207` qui ne trouve rien n'est pas
une invocation absente, c'est une numérotation différente.

**La numérotation est le meilleur repère** — elle vient de l'original et se
retrouve d'une édition à l'autre. Mais vérifier : l'édition espagnole suit la
numérotation commune jusqu'à 74 puis s'en écarte, et son n° 86 n'est pas celui
des autres. Certaines éditions numérotent leurs **chapitres** et non leurs
invocations (anglaise, malaise), ou mettent le numéro entre parenthèses.

L'ancrage sur l'arabe **ne marche pas** : il s'extrait en désordre, et n'a
rendu que deux repères sur vingt-huit en turc contre vingt-quatre par les
rubriques.

### 3. Lire et écrire

Écrire dans `sources/duas/<langue>.py`, sur le modèle des existants. Y noter
le numéro d'entrée entre crochets, l'édition exacte, et les invocations
absentes avec la raison. Puis :

```bash
python sources/duas/<langue>.py
python scripts/check.py
```

## Les pièges rencontrés

- **L'édition indonésienne** encode l'arabe dans une police maison qui
  ressort en charabia latin, répété quatre fois par ligne. Le filtre de
  `hisn_sections.py` l'écarte déjà.
- **L'OCR malais** produit du bruit (« kKkesihatan » pour « kesihatan »).
  Corriger ce qui est manifeste, jamais deviner.
- **L'ourdou** n'a pas de couche texte du tout (3 à 18 caractères par page)
  et le nastaliq résiste à l'OCR. Seul cas encore bloqué : il faut une autre
  édition, un EPUB conviendrait, `scripts/epub_read.py` est prêt.
- **Le bengali** sort en encodage hérité : la police mappe ses glyphes sur
  de mauvais points Unicode (হ ressort en ি). Le PDF *s'affiche* juste, donc
  l'OCR des pages rendues devrait le lire — c'est la piste, pas encore faite.
- **Quatre invocations** ne figurent dans aucune édition : `avant-le-repas`,
  `apres-le-repas` (autres formulations), `en-voyant-la-ka-ba` (al-Bayhaqi)
  et `apres-les-2-rak-ahs-en-commu` (Ibn Abi Chayba).

## Ce qui n'est pas à traduire

- L'**arabe** n'a pas de ligne de traduction : le texte est déjà affiché.
  `i18n_scan.sans_objet()` le sait.
- La **phonétique** passe par `scripts/duas_translit.py`, pas à la main.
- La **référence** se recompose depuis `sources:` et le nom de sourate.
