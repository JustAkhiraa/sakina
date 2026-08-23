---
name: books-sakina
description: Ajouter un livre à la bibliothèque de Sakina, ou le traduire dans une langue. À charger avant de toucher au catalogue des livres, aux fichiers de content/books/, ou aux 99 Noms — explique les deux mécanismes de traduction, la question des droits, et les trois oublis qui ont déjà coûté des mois.
---

# Livres et bibliothèque

## Deux mécanismes, pas un

| Ce qui se traduit | Comment |
|---|---|
| Titre, auteur, chiffres, présentation | clés `books.*`, `bk.*`, `bks.*`, `bkv.*` |
| **Corps du livre** | un fichier par langue : `fruits.en.json` à côté de `fruits.json` |

Le second est le bon choix dès que le contenu dépasse quelques phrases : 400
chaînes dans un dictionnaire seraient ingérables. `chapterSources()` tente la
langue courante, puis l'anglais, puis le français.

## Ajouter un livre — les trois oublis déjà commis

1. **Inscrire la clé de titre dans `BOOK_I18N`** (`js/features/books.js`).
   Deux livres y manquaient : « Comment faire la Salât » et « Faire les
   ablutions » sont restés français dans dix-sept langues pendant des mois,
   alors que leurs clés existaient. `check.py` le vérifie désormais.
2. **Le catalogue va dans `js/data/books.js`**, jamais dans le fichier de
   vue. Le français d'un catalogue est une source, mais mélangé au code
   d'affichage il échappe à la règle « aucun français en dur ».
3. **Ajouter le JSON au `SHELL` du service worker** si c'est un nouveau
   module. Un fichier manquant y fait échouer l'installation **en silence**.

## Traduire un livre

1. `translatable: true` dans `js/data/books.js`.
2. Écrire `sources/books/<livre>/<langue>.py` qui fusionne avec la base et
   produit `content/books/<livre>.<langue>.json`. Voir `asma/ja.py`.
3. Vérifier que le chargeur teste bien **la langue** et non la seule présence
   du cache — c'est ce qui laissait les cent Noms en japonais après un retour
   au français.
4. `refreshBooks()` doit figurer dans la liste `lang-changed` de `app.js`.

## Droits — à vérifier avant de traduire

Traduire multiplie la diffusion par dix-sept. Ce qui est acceptable en
français ne l'est pas forcément ailleurs.

- **Riyad as-Salihin** et **La Citadelle** sont des traductions publiées. Il
  faut des éditions sourcées, jamais une retraduction.
- **Les 99 Noms** : les sections `inv` et `intro` venaient d'un livre publié
  (Al Bouraq). Elles ont été remplacées par un renvoi coranique — une
  référence, pas un texte, servie depuis le corpus de la langue lue. Composer
  soi-même une formule d'adoration serait pire que de citer celle d'un autre.
- **Les Aliments** et **Les Miracles** sont à nous : traduisibles sans
  réserve.

Pour les 99 Noms, `scripts/asma_verses.py` propose des versets et les classe.
Il **propose**, il ne choisit pas : chercher la racine seule ramène « Paix aux
Envoyés » pour *as-Salām* et « impitoyables despotes » pour *al-Jabbār*.

## Vérifier

```bash
python scripts/check.py     # clés de titre, JSON, service worker
```
