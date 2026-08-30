/* SAKINA — Traductions du Coran disponibles hors ligne.

   Chaque entrée correspond à un fichier content/quran/quran-<code>.json : un tableau
   de 114 sourates, chacune un tableau de versets dans l'ordre. Le verset a
   de la sourate n se lit donc data[n-1][a-1].

   Les fichiers ne sont téléchargés que pour les langues activées par
   l'utilisateur, puis conservés en cache par le service worker : une langue
   activée reste lisible sans connexion.

   Poids indiqué en mégaoctets, pour informer avant téléchargement. */

export const TRANSLATIONS=[
  {code:'fr', label:'Français',         native:'Français',  author:'Montada Islamic Foundation',  mb:0.95},
  {code:'en', label:'Anglais',          native:'English',   author:'Saheeh International',        mb:0.86},
  {code:'es', label:'Espagnol',         native:'Español',   author:'Isa García',                  mb:0.87},
  {code:'de', label:'Allemand',         native:'Deutsch',   author:'Bubenheim & Nadeem',          mb:0.91},
  {code:'it', label:'Italien',          native:'Italiano',  author:'Hamza Roberto Piccardo',      mb:1.52},
  {code:'pt', label:'Portugais',        native:'Português', author:'Samir El-Hayek',              mb:0.79},
  {code:'ru', label:'Russe',            native:'Русский',   author:'Elmir Kuliev',                mb:1.36},
  {code:'tr', label:'Turc',             native:'Türkçe',    author:'Diyanet İşleri',              mb:0.97},
  {code:'ur', label:'Ourdou',           native:'اردو',       author:'Muhammad Junagarhi',          mb:1.37, rtl:true},
  {code:'fa', label:'Persan',           native:'فارسی',      author:'Hussein Taji Kal Dari',       mb:1.40, rtl:true},
  {code:'id', label:'Indonésien',       native:'Indonesia', author:'Kementerian Agama',           mb:1.05},
  {code:'ms', label:'Malais',           native:'Melayu',    author:'Abdullah Muhammad Basmeih',   mb:1.40},
  {code:'bn', label:'Bengali',          native:'বাংলা',      author:'Abu Bakr Muhammad Zakaria',   mb:2.10},
  {code:'zh', label:'Chinois',          native:'中文',       author:'Ma Jian',                     mb:0.71},
  {code:'ja', label:'Japonais',         native:'日本語',     author:'Ryoichi Mita',                mb:1.18},
  {code:'hi', label:'Hindi',            native:'हिन्दी',      author:'Maulana Azizul Haque al-Umari', mb:2.12},
  {code:'bs', label:'Bosniaque',        native:'Bosanski',  author:'Besim Korkut',                mb:0.75},
  {code:'so', label:'Somali',           native:'Soomaali',  author:'Mahmud Muhammad Abduh',       mb:0.73},
  {code:'sw', label:'Swahili',          native:'Kiswahili', author:'Abu Bakr & Nasir Khamis',     mb:1.70},
  {code:'ha', label:'Haoussa',          native:'Hausa',     author:'Abubakar Mahmoud Gumi',       mb:0.91},
  {code:'tl', label:'Translittération', native:'Latin',     author:'Quran.com',                   mb:0.59},
];

export const TR_BY_CODE=Object.fromEntries(TRANSLATIONS.map(t=>[t.code,t]));
