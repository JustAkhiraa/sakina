---
name: i18n-sakina
description: Règle et outillage de traduction de Sakina. À charger avant d'ajouter, de déplacer ou de traduire du texte affiché — écran, infobulle, libellé d'accessibilité, catalogue. Explique où vit le français, comment une langue s'y greffe, et quelles vérifications doivent passer.
---

# Traduction — Sakina

## La règle, en une phrase

**Le français vit dans `js/data/` et `js/i18n/fr.js`. Partout ailleurs, du
français est une erreur.**

`js/features/`, `js/core/` et `js/lib/` ne contiennent que du code
d'affichage. Une chaîne française y est un bug, même si elle « marche » :
elle s'affichera telle quelle dans les dix-sept autres langues.

## Pourquoi cette règle existe

Compter les clés manquantes ne suffisait pas. Le français ne fuyait pas par
des traductions absentes — il fuyait par du texte jamais confié au
dictionnaire :

- `streakBadge()` traduisait sa première ligne et laissait les six
  suivantes en dur ; « Étincelle » s'affichait sous une interface japonaise ;
- deux livres ont été ajoutés au catalogue sans leur clé de titre, et
  « Comment faire la Salât » est resté français partout pendant des mois ;
- neuf `aria-label` n'étaient rattachés à rien : un lecteur d'écran
  japonais annonçait « Réglages ».

Aucun de ces cas n'était détectable en comparant les dictionnaires entre
eux. Ils avaient tous la même forme : du texte affiché qui ne passait pas
par `t()`.

## Les trois gisements de texte

| Où | Quoi | Comment on traduit |
|---|---|---|
| `js/i18n/fr.js` | Chaînes d'interface | clé + une entrée par langue |
| `js/data/*.js` | Catalogues : invocations, livres, routines, thèmes, additifs | le français **est** la source ; les langues s'y greffent par `tf('cle', francais)` |
| `content/books/*.json` | Corps des livres | un fichier par langue : `fruits.en.json` |

Un catalogue garde son français : c'est l'original, pas un repli. Mais il
doit vivre dans `js/data/`, jamais dans un fichier de vue.

## Ajouter du texte

1. Écrire le lot dans `sources/ui/<sujet>.py` :

```python
LOTS = {
"ma.cle": {
 "fr": "…", "en": "…", "es": "…", "ru": "…", "bs": "…", "ar": "…",
 "tr": "…", "fa": "…", "ur": "…", "hi": "…", "bn": "…", "id": "…",
 "ms": "…", "zh": "…", "ja": "…", "so": "…", "sw": "…", "ha": "…",
},
}
```

2. Distribuer : `python scripts/i18n_add.py sources/ui/<sujet>.py`
   (`--remplace` pour réécrire une clé existante ; sans lui, rien n'est écrasé).

3. Appeler `t('ma.cle')` — jamais la chaîne.

## Ce qui n'est pas de la traduction

Trois pièges qui reviennent :

- **Jamais traduire une traduction.** Une invocation coranique se sert
  depuis `content/quran/quran-<langue>.json` ; une invocation prophétique
  depuis une édition publiée de Hisn al-Muslim, relevée dans
  `sources/duas/<langue>.py` avec son numéro d'entrée. Sans édition, on
  laisse le repli et on le marque — on n'invente pas.
- **La phonétique n'est pas du texte latin.** `scripts/duas_translit.py`
  la retranscrit en cyrillique, devanagari, bengali, katakana et pinyin.
  L'arabe, le persan et l'ourdou n'en ont pas : ils lisent l'original.
- **Une clé peut être sans objet dans une langue.** Le sens d'une
  invocation n'a pas à être traduit en arabe. Voir `sans_objet()` dans
  `i18n_scan.py`.

## Vérifications — toutes doivent passer

```bash
python scripts/check.py
```

Ce qu'il attrape, et qu'il faut garder vert :

- `i18n_leaks` — français en dur dans le code d'affichage → **erreur**
- `books_i18n` — un livre du catalogue sans clé de titre → **erreur**
- `i18n` — clé utilisée mais absente d'un dictionnaire → **erreur**
- `service_worker` — un fichier importé mais absent de `SHELL` casse le
  hors-ligne **en silence** ; un nouveau `js/data/*.js` doit y entrer

Outils d'appoint :

```bash
python scripts/i18n_scan.py                 # couverture par langue
python scripts/i18n_scan.py --missing ja    # ce qui manque en japonais
python scripts/i18n_leaks.py                # français en dur
python scripts/i18n_quality.py              # qualité des traductions
python scripts/duas_coverage.py             # d'où vient chaque invocation
```

## Après une modification

Le service worker met en cache agressivement et les modules ES encore
plus. Recharger la page ne suffit pas : monter `VERSION` dans `sw.js`, et
en développement forcer le rechargement du graphe de modules avant de
juger un résultat à l'écran.
