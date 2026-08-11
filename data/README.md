# Corpus coranique embarqué

Ces deux fichiers permettent au lecteur du Coran de fonctionner **entièrement hors ligne**, sans dépendre d'un service tiers. Ils sont chargés par [`js/features/quran.js`](../js/features/quran.js), qui retombe sur l'API de Quran.com si jamais ils sont indisponibles.

| Fichier | Contenu | Taille |
|---|---|---|
| `quran-ar.json` | Texte arabe, orthographe uthmanî | 1,30 Mo |
| `quran-fr.json` | Traduction française | 0,95 Mo |

## Format

Un tableau de 114 sourates ; chaque sourate est un tableau de versets, dans l'ordre. Le verset *a* de la sourate *n* est donc à `data[n-1][a-1]`.

```js
data[0][0]   // premier verset d'Al-Fâtiha
data[1][254] // sourate 2, verset 255
```

Les 114 longueurs correspondent exactement à celles déclarées dans [`js/data/surahs.js`](../js/data/surahs.js), pour un total de 6236 versets (décompte koufien, celui du mushaf de Médine).

## Provenance et attribution

Les deux corpus proviennent de l'API de [Quran.com](https://quran.com), que l'application interrogeait auparavant à chaque lecture.

- **Texte arabe** — orthographe uthmanî.
- **Traduction française** — *Montada Islamic Foundation* (identifiant 136 sur Quran.com). Les appels de note en exposant présents dans la source ont été retirés, l'application ne les affichant pas. Merci de conserver cette attribution en cas de rediffusion.

La récitation audio n'est pas embarquée : elle représenterait plusieurs gigaoctets. Elle reste servie par le CDN d'islamic.network (Mishary Alafasy).

## Régénérer

Les fichiers sont produits à partir de l'API, puis validés contre `surahs.js` (nombre de versets par sourate). Ce ne sont pas des fichiers à éditer à la main.
