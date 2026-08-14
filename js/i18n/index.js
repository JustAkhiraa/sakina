/* SAKINA — Langues d'interface réellement disponibles.

   Cette liste doit refléter les fichiers présents dans ce dossier. Le
   sélecteur ne propose que ces langues : annoncer une langue sans
   dictionnaire déclenchait un 404 et rendait l'interface à moitié
   anglaise, ce qui est pire que de ne pas la proposer.

   Ajouter une langue : déposer <code>.js ici, puis l'inscrire ci-dessous
   et dans LANGS (js/data/catalog.js). scripts/check.py vérifie que les
   trois restent d'accord. */
export const AVAILABLE_LANGS = ['fr', 'en', 'es', 'ar', 'ru', 'zh', 'ja', 'hi', 'tr', 'ur', 'id'];

export const hasLang = code => AVAILABLE_LANGS.includes(code);
