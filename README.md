# Sakina ✦ — سَكِينَة

**Compagnon spirituel tout-en-un** : tasbih, horaires de prière, qibla, Coran (tajwid, favoris, notes), invocations, bibliothèque de livres, et outils (Qadâ', Rak'ah, Zakat, calendrier hégirien & du jeûne, additifs halal). PWA installable, hors-ligne, sans publicité.

> *Sakina* (سكينة) : la quiétude que Dieu fait descendre dans les cœurs — l'émotion que l'app cherche à susciter.

## Lancer l'app

Les modules ES exigent un serveur HTTP (pas de `file://`) :

```powershell
python -m http.server 8642
# puis ouvrir http://localhost:8642
```

Le service worker (offline) ne s'active qu'en HTTPS — déployez sur GitHub Pages/Netlify/Vercel pour la PWA complète.

## Architecture

```
index.html              Coquille HTML (pages + sheets), zéro logique
manifest.webmanifest    PWA (installable, standalone)
sw.js                   Offline : shell cache-first, API Coran réseau→cache
css/
  tokens.css            Design tokens : thème sombre/clair/nuit OLED, 8 accents
  base.css              Reset, glassmorphism, composants partagés (rows, sheets…)
  pages.css             Styles par écran
js/
  app.js                Point d'entrée : câblage des modules
  core/
    store.js            État persistant + migration auto depuis l'ancienne app (tpv5)
    router.js           Navigation par pages + hooks d'affichage
    nav.js              Barre de navigation dynamique (5 items + menu « Plus »)
    ui.js               Toast, burst, sheets, dialogue de confirmation (Promise)
    audio.js            Sons WebAudio synthétisés + haptique
    rewards.js          Récompenses par paliers (skins, ambiances, avatars, titres…)
    devtools.js         Outils de développement internes
  lib/
    astro.js            Astronomie : horaires de prière (angles réels par méthode,
                        Asr par facteur d'ombre), qibla, distance Ka'ba
    hijri.js            Calendrier hégirien tabulaire (données numériques propres)
  data/                 Catalogues : dhikrs, douas, 114 sourates, routines,
                        additifs & certifications halal, méthodes de calcul,
                        phonétique des invocations par écriture (généré)
  i18n/                 Un dictionnaire par langue (18) + index.js
  features/             Un module par écran : tasbih, salat, qibla, duas, quran,
                        settings, tools (Qadâ'/Rak'ah/Zakat/hégirien/jeûne),
                        books, routines, places, halal, onboarding
content/                Contenu servi à l'exécution
  quran/                22 corpus (texte arabe + 21 traductions publiées)
  books/                Riyad as-Salihin, Citadelle du Musulman, Asma ul-Husna,
                        Les Aliments dans le Coran et la Sunna, Les Miracles
                        du Coran — un fichier par langue quand il est traduit
  audio/                Adhâns et récitations des 99 Noms
sources/                Matière d'où le contenu est tiré, jamais servie au client
  books/                Chapitres en markdown + leur script de construction
  duas/                 Relevés des éditions publiées de Hisn al-Muslim,
                        une par langue, avec le numéro d'entrée de l'édition
  ui/                   Lots de chaînes d'interface, distribués aux 18 langues
scripts/                Outillage. Préfixe = domaine, suffixe = action :
                        check         intégrité avant commit (à lancer toujours)
                        i18n_*        inventaire, ajout, qualité, textes oubliés
                        quran_*       corpus, noms de sourates, entités HTML
                        hisn_*        extraction, OCR, découpage en rubriques
                        duas_translit phonétique vers les écritures non latines
                        out/          artefacts régénérables (hors dépôt)
docs/                   Guides (README.html rendu, PUBLISH.html)
```

**Communication inter-modules** : imports directs quand la dépendance est naturelle, `CustomEvent` DOM (`stats-changed`, `location-changed`) pour éviter les cycles.

**Données utilisateur** : `localStorage` clé `sakina.v1`. Au premier lancement, les données de l'ancienne app (`tpv5` + `qdata`) sont migrées automatiquement. Écritures batchées (80 ms) avec flush garanti sur `pagehide`/`visibilitychange`.

## APIs externes

- `api.quran.com` — texte uthmani + traduction Hamidullah (fr, id 136), cache offline via SW
- `nominatim.openstreetmap.org` — géocodage inverse & recherche de ville

## Licence

Le **code** est sous [licence MIT](LICENSE) : reprenez-le, modifiez-le,
redistribuez-le, y compris commercialement.

Les **contenus embarqués** — traductions du Coran, invocations relevées
d'éditions publiées, récitations — appartiennent à leurs auteurs et ne sont
pas couverts par cette licence. Origine et conditions, source par source :
[CONTENU.md](CONTENU.md).

Qui reprend ce dépôt pour publier sa propre application doit lire ce second
fichier. Reprendre le code est libre ; rediffuser les contenus ne l'est pas
nécessairement.
