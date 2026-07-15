# Sakina ✦ — سَكِينَة

**Compagnon spirituel tout-en-un** : tasbih, horaires de prière, qibla, Coran (tajwid, favoris, notes), invocations, et outils (Qadâ', Rak'ah, Zakat, calendrier hégirien & du jeûne). PWA installable, hors-ligne, sans publicité.

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
    ui.js               Toast, burst, sheets, dialogue de confirmation (Promise)
    audio.js            Sons WebAudio synthétisés + haptique
  lib/
    astro.js            Astronomie : horaires de prière (angles réels par méthode,
                        Asr par facteur d'ombre), qibla, distance Ka'ba
    hijri.js            Calendrier hégirien tabulaire (données numériques propres)
  data/                 Catalogues : dhikrs, douas, 114 sourates, méthodes de calcul
  features/             Un module par écran : tasbih, salat, qibla, duas, quran,
                        settings, tools (Qadâ'/Rak'ah/Zakat/hégirien/jeûne)
legacy/v8.html          Ancien monolithe (référence, ne plus modifier)
```

**Communication inter-modules** : imports directs quand la dépendance est naturelle, `CustomEvent` DOM (`stats-changed`, `location-changed`) pour éviter les cycles.

**Données utilisateur** : `localStorage` clé `sakina.v1`. Au premier lancement, les données de l'ancienne app (`tpv5` + `qdata`) sont migrées automatiquement. Écritures batchées (80 ms) avec flush garanti sur `pagehide`/`visibilitychange`.

## APIs externes

- `api.quran.com` — texte uthmani + traduction Hamidullah (fr, id 136), cache offline via SW
- `nominatim.openstreetmap.org` — géocodage inverse & recherche de ville
