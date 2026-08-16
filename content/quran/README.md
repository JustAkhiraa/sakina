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
| `ja` | Japonais | Ryoichi Mita |
| `hi` | Hindi | Maulana Azizul Haque al-Umari |
| `bs` | Bosniaque | Besim Korkut |
| `so` | Somali | Mahmud Muhammad Abduh |
| `sw` | Swahili | Dr. Abdullah Muhammad Abu Bakr & Sheikh Nasir Khamis |
| `ha` | Haoussa | Abubakar Mahmoud Gumi |
| `tl` | Translittération latine | Quran.com |

La récitation audio n'est pas embarquée : elle représenterait plusieurs gigaoctets. Elle reste servie par le CDN d'islamic.network (Mishary Alafasy).

## Régénérer

```bash
python scripts/build_quran_corpus.py ja hi bs so sw ha   # une ou plusieurs langues
python scripts/build_quran_corpus.py --list              # traductions disponibles
```

Le script télécharge sourate par sourate, retire les appels de note que l'application n'affiche pas, puis **valide le résultat contre `surahs.js`** : si un décompte de versets ne correspond pas, il refuse d'écrire. Un corpus décalé d'un verset est pire que pas de corpus — le lecteur afficherait sereinement le mauvais texte.

Ce ne sont pas des fichiers à éditer à la main.

## Où servent-ils, en plus du lecteur

Huit des invocations de `js/data/duas.js` sont des passages coraniques ; elles portent leur référence (`verses:'20:25-28'`). L'écran des douas y puise la traduction **publiée** de la langue courante plutôt que de retraduire le français — voir `duaTranslation()` dans `js/features/duas.js`.
