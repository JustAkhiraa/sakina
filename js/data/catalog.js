/* SAKINA — Catalogues statiques : dhikrs, thèmes, sons, prières */

export const DHIKRS=[
  {name:'Subhanallah',      arabic:'سُبْحَانَ ٱللَّٰهِ',           goal:33,  reminder:33},
  {name:'Alhamdulillah',    arabic:'ٱلْحَمْدُ لِلَّٰهِ',            goal:33,  reminder:33},
  {name:'Allahu Akbar',     arabic:'ٱللَّٰهُ أَكْبَرُ',             goal:34,  reminder:34},
  {name:'La ilaha illallah',arabic:'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',  goal:100, reminder:100},
  {name:'Astaghfirullah',   arabic:'أَسْتَغْفِرُ ٱللَّٰهَ',         goal:100, reminder:100},
  {name:'Hasbunallah',      arabic:'حَسْبُنَا ٱللَّٰهُ',             goal:99,  reminder:33},
  {name:'Salawat',          arabic:'صَلَّى ٱللَّٰهُ عَلَيْهِ',      goal:100, reminder:10},
];

export const THEMES=[
  {key:'gold',    name:'Or',    color:'#C9A96E'},
  {key:'jade',    name:'Jade',  color:'#4ADE80'},
  {key:'sapphire',name:'Saphir',color:'#60A5FA'},
  {key:'rose',    name:'Rose',  color:'#F472B6'},
  {key:'violet',  name:'Violet',color:'#A78BFA'},
  {key:'ember',   name:'Braise',color:'#FB923C'},
  {key:'teal',    name:'Teal',  color:'#2DD4BF'},
  {key:'pearl',   name:'Perle', color:'#CBD5E1'},
];

export const SOUNDS=[
  {id:'drop', name:'Goutte',      desc:'Doux et rond'},
  {id:'click',name:'Clic méca.',  desc:'Court et net'},
  {id:'bleep',name:'Bip digital', desc:'Précis'},
  {id:'wood', name:'Bois',        desc:'Chaleureux'},
  {id:'bell', name:'Clochette',   desc:'Résonant'},
  {id:'none', name:'Silencieux',  desc:'Aucun son'},
];

/* Paramètres astronomiques exacts par méthode (angles Fajr/Isha réels).
   ishaInterval : minutes après le Maghrib (Umm al-Qura). */
export const CALC_METHODS=[
  {id:3, name:'Muslim World League',   desc:'Ligue Islamique Mondiale',          fajr:18,   isha:17},
  {id:12,name:'UOIF (France 12°)',     desc:'Union des Organisations Islamiques',fajr:12,   isha:12},
  {id:2, name:'ISNA',                  desc:'Islamic Society of North America',  fajr:15,   isha:15},
  {id:4, name:'Umm al-Qura',           desc:'Arabie Saoudite',                   fajr:18.5, ishaInterval:90},
  {id:5, name:'Egyptian Authority',    desc:'Autorité Générale Égyptienne',      fajr:19.5, isha:17.5},
  {id:1, name:'Université de Karachi', desc:'Pakistan',                          fajr:18,   isha:18},
];

/* Écoles juridiques — asrFactor : longueur d'ombre pour l'heure de l'Asr
   (2 pour l'école hanafite, 1 pour la majorité) */
export const MADHABS=[
  {id:'maliki', name:'Malikite', ar:'مالكي', asrFactor:1},
  {id:'hanafi', name:'Hanafite', ar:'حنفي',  asrFactor:2},
  {id:'shafii', name:'Chaféite', ar:'شافعي', asrFactor:1},
  {id:'hanbali',name:'Hanbalite',ar:'حنبلي', asrFactor:1},
];

/* Langues de l'interface */
export const LANGS=[
  {code:'fr',name:'Français', flag:'🇫🇷'},
  {code:'ar',name:'العربية',  flag:'🇸🇦',rtl:true},
  {code:'en',name:'English',  flag:'🇬🇧'},
  {code:'es',name:'Español',  flag:'🇪🇸'},
  {code:'ru',name:'Русский',  flag:'🇷🇺'},
  {code:'zh',name:'中文',      flag:'🇨🇳'},
  {code:'ja',name:'日本語',    flag:'🇯🇵'},
  {code:'hi',name:'हिन्दी',    flag:'🇮🇳'},
];

export const QADA_PRAYERS=[
  {key:'fajr',    name:'Fajr',    arabic:'الفجر',  icon:'🌙'},
  {key:'dhuhr',   name:'Dhouhr',  arabic:'الظهر',  icon:'☀️'},
  {key:'asr',     name:'Asr',     arabic:'العصر',  icon:'🌤️'},
  {key:'maghrib', name:'Maghrib', arabic:'المغرب', icon:'🌅'},
  {key:'isha',    name:'Icha',    arabic:'العشاء', icon:'🌃'},
];

export const RAKAH_REF={fajr:2,dhuhr:4,asr:4,maghrib:3,isha:4};
