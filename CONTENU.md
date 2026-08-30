# Contenus embarqués — origine et droits

Le code de Sakina est sous [licence MIT](LICENSE) : reprenez-le, modifiez-le,
redistribuez-le.

**Ce fichier concerne ce qui n'est pas du code.** L'application embarque des
textes et des enregistrements produits par d'autres. Ils ne nous appartiennent
pas, nous ne pouvons donc pas les placer sous MIT, et la licence du dépôt ne
vous donne aucun droit sur eux.

Si vous reprenez ce dépôt pour publier votre propre application, c'est la
partie à examiner. Le code, non.

---

## Ce qui est libre de droits

**Le texte arabe du Coran** (orthographe uthmanî, `content/quran/quran-ar.json`)
n'a pas d'auteur au sens du droit d'auteur. Il se reprend sans condition.

## Ce qui appartient à d'autres

### Traductions du Coran — `content/quran/quran-<code>.json`

Vingt et une traductions, 26 Mo, obtenues via l'API de [Quran.com](https://quran.com).
Ce sont des **œuvres modernes** : chacune reste la propriété de son traducteur
ou de l'organisme qui l'a produite.

| Langue | Traduction |
|---|---|
| Français | Montada Islamic Foundation |
| Anglais | Saheeh International |
| Espagnol | Isa García |
| Allemand | Bubenheim & Nadeem |
| Italien | Hamza Roberto Piccardo |
| Portugais | Samir El-Hayek |
| Russe | Elmir Kuliev |
| Turc | Diyanet İşleri |
| Ourdou | Muhammad Junagarhi |
| Persan | Hussein Taji Kal Dari |
| Indonésien | Kementerian Agama |
| Malais | Abdullah Muhammad Basmeih |
| Bengali | Abu Bakr Muhammad Zakaria |
| Chinois | Ma Jian |
| Japonais | Ryoichi Mita |
| Hindi | Maulana Azizul Haque al-Umari |
| Bosniaque | Besim Korkut |
| Somali | Mahmud Muhammad Abduh |
| Swahili | Abdullah Muhammad Abu Bakr & Nasir Khamis |
| Haoussa | Abubakar Mahmoud Gumi |
| Translittération latine | Quran.com |

Ces attributions doivent être conservées en cas de rediffusion. Le détail
technique est dans [`content/quran/README.md`](content/quran/README.md).

### Invocations — `js/i18n/*.js`, clés `dut.*`

Les invocations prophétiques ne sont pas traduites par nous : elles sont
**relevées dans une édition publiée** de *Hisn al-Muslim* de Sa'id b. Ali b.
Wahf al-Qahtani, une par langue. C'est une règle du projet — on ne traduit
jamais une traduction —, et c'est aussi ce qui fait que ces textes appartiennent
à leurs éditeurs.

Quatorze langues sont concernées : bosniaque, anglais, espagnol, persan,
haoussa, indonésien, japonais, malais, russe, somali, swahili, turc, chinois,
et le français d'origine. L'édition exacte de chacune est citée en tête du
fichier de relevé correspondant, dans `sources/duas/`.

### Les 99 Noms — `content/books/asma*.json`

Trente-sept des quatre-vingt-dix-neuf Noms portent encore une section
« Invocation » et « Introspection » tirées de :

> *Les Essentiels — Les 99 Noms d'Allah*, Souad El Mansouri, éditions Al Bouraq.

Les soixante-deux autres ne les portent plus : ils ont été remplacés par un
**renvoi coranique** — une référence, pas un texte — et par deux questions
écrites par nous. Le verset arrive du corpus, dans la traduction publiée de la
langue du lecteur.

Quand les trente-sept derniers auront reçu le même traitement, cette dépendance
disparaîtra entièrement du dépôt. C'est un chantier ouvert, pas un choix
définitif.

### Récitations des 99 Noms — `content/audio/asma/`

Cent fichiers MP3, issus du dépôt **sous licence MIT**
[MohammedAbidNafi/99-Names-of-Allah](https://github.com/MohammedAbidNafi/99-Names-of-Allah),
convertis en MP3. Réutilisables aux conditions de cette licence.

### Adhân — `content/audio/adhan/`

`omar-hisham.mp3` : récitation d'Omar Hisham Al Arabi. Vérifiez vos droits
avant rediffusion. Les autres voix déclarées dans `js/features/adhan.js`
n'ont pas de fichier : l'application sonde leur présence et ne propose que
celles qui existent.

## Services et ressources externes

| Ressource | Conditions |
|---|---|
| [api.quran.com](https://api.quran.com) | repli réseau du lecteur ; aucune donnée personnelle envoyée |
| [Nominatim / OpenStreetMap](https://www.openstreetmap.org) | données sous ODbL, plus la [politique d'usage](https://operations.osmfoundation.org/policies/nominatim/) de Nominatim |
| Cinzel, Nunito (Google Fonts) | SIL Open Font License 1.1 |
| Récitation coranique (islamic.network) | Mishary Alafasy, servie par CDN, non embarquée |

## En résumé

- **Le code** : MIT, sans réserve.
- **Le texte arabe du Coran** : libre.
- **Les récitations des 99 Noms** : MIT.
- **Tout le reste** : demandez avant de rediffuser.
