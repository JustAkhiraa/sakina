# Corpus coranique embarqué

Ces deux fichiers permettent au lecteur du Coran de fonctionner **entièrement hors ligne**, sans dépendre d'un service tiers. Ils sont chargés par [`js/features/quran.js`](../js/features/quran.js), qui retombe sur l'API de Quran.com si jamais ils sont indisponibles.

| Fichier | Contenu | Taille |
|---|---|---|
| `quran-ar.json` | Texte arabe, orthographe uthmanî | 1,30 Mo |
| `quran-<code>.json` | Une traduction par langue | 0,59 à 2,10 Mo |

Le texte arabe est précaché à l'installation. Les traductions, elles, ne sont téléchargées que lorsque l'utilisateur active la langue dans les réglages ; le service worker les met alors en cache (règle *cache d'abord* sur `/data/quran-`). Une langue activée reste donc lisible sans connexion, et aucune langue inutilisée n'est téléchargée.

La liste des langues, leur libellé et leur traducteur sont déclarés dans [`js/data/translations.js`](../js/data/translations.js).

## Format

Un tableau de 114 sourates ; chaque sourate est un tableau de versets, dans l'ordre. Le verset *a* de la sourate *n* est donc à `data[n-1][a-1]`.

```js
data[0][0]   // premier verset d'Al-Fâtiha
data[1][254] // sourate 2, verset 255
```

Les 114 longueurs correspondent exactement à celles déclarées dans [`js/data/surahs.js`](../js/data/surahs.js), pour un total de 6236 versets (décompte koufien, celui du mushaf de Médine).

## Provenance et attribution

Les deux corpus proviennent de l'API de [Quran.com](https://quran.com), que l'application interrogeait auparavant à chaque lecture.

Le **texte arabe** (orthographe uthmanî) n'est pas soumis au droit d'auteur. Les **traductions**, en revanche, sont des œuvres modernes : chacune reste la propriété de son traducteur ou de l'organisme qui l'a produite. Les appels de note en exposant présents dans la source ont été retirés, l'application ne les affichant pas. Merci de conserver ces attributions en cas de rediffusion.

| Code | Langue | Traduction |
|---|---|---|
| `fr` | Français | Montada Islamic Foundation |
| `en` | Anglais | Saheeh International |
| `es` | Espagnol | Isa García |
| `de` | Allemand | Bubenheim & Nadeem |
| `it` | Italien | Hamza Roberto Piccardo |
| `pt` | Portugais | Samir El-Hayek |
| `ru` | Russe | Elmir Kuliev |
| `tr` | Turc | Diyanet İşleri |
| `ur` | Ourdou | Muhammad Junagarhi |
| `fa` | Persan | Hussein Taji Kal Dari |
| `id` | Indonésien | Kementerian Agama |
| `ms` | Malais | Abdullah Muhammad Basmeih |
| `bn` | Bengali | Abu Bakr Muhammad Zakaria |
| `zh` | Chinois | Ma Jian |
| `tl` | Translittération latine | Quran.com |

La récitation audio n'est pas embarquée : elle représenterait plusieurs gigaoctets. Elle reste servie par le CDN d'islamic.network (Mishary Alafasy).

## Régénérer

Les fichiers sont produits à partir de l'API, puis validés contre `surahs.js` (nombre de versets par sourate). Ce ne sont pas des fichiers à éditer à la main.
