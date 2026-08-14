/* SAKINA — Catalogues statiques : dhikrs, thèmes, sons, prières, récompenses.
   Les `unlockAt` définissent des paliers croissants : plus le nombre est
   grand, plus le cadeau est rare. */

export const DHIKRS=[
  {name:'Subhanallah',      arabic:'سُبْحَانَ ٱللَّٰهِ',           goal:33,  reminder:33},
  {name:'Alhamdulillah',    arabic:'ٱلْحَمْدُ لِلَّٰهِ',            goal:33,  reminder:33},
  {name:'Allahu Akbar',     arabic:'ٱللَّٰهُ أَكْبَرُ',             goal:34,  reminder:34},
  {name:'La ilaha illallah',arabic:'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',  goal:100, reminder:100},
  {name:'Astaghfirullah',   arabic:'أَسْتَغْفِرُ ٱللَّٰهَ',         goal:100, reminder:100},
  {name:'Hasbunallah',      arabic:'حَسْبُنَا ٱللَّٰهُ',             goal:99,  reminder:33},
  {name:'Salawat',          arabic:'صَلَّى ٱللَّٰهُ عَلَيْهِ',      goal:100, reminder:10},
];

export const BONUS_DHIKRS=[
  {id:'bihamdihi',name:'Subhanallahi wa bihamdihi', arabic:'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ',
    goal:100,reminder:33,unlockAt:5000,
    hint:'« Gloire et louange à Allah » — 100× / jour efface les péchés (hadith)'},
  {id:'lahawla',name:'La hawla wa la quwwata illa billah',arabic:'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ',
    goal:100,reminder:33,unlockAt:15000,
    hint:'« Il n\'y a de force ni de puissance qu\'en Allah » — trésor du Paradis'},
  {id:'adada',name:'Subhanallahi wa bihamdihi ‘Adada khalqih',arabic:'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ',
    goal:33,reminder:33,unlockAt:35000,
    hint:'« Autant que Sa création » — une phrase, poids d\'une matinée entière'},
  {id:'salli',name:'Allahumma salli ‘ala Muhammad',arabic:'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    goal:100,reminder:10,unlockAt:70000,
    hint:'Salât ibrahimiyya abrégée — le Prophète ﷺ demande la salât sur lui'},
  {id:'yahayyu',name:'Ya Hayyu Ya Qayyum',arabic:'يَا حَيُّ يَا قَيُّومُ',
    goal:100,reminder:33,unlockAt:150000,
    hint:'Invocation des Noms — Le Vivant, Celui qui subsiste par Lui-même'},
];

/* ── PALETTES d'accent ──
   9 accents essentiels débloqués (3 chaudes · 3 froides · 3 neutres) pour
   ne pas surcharger la config. Les autres sont des cadeaux progressifs
   (unlockAt) visibles seulement dans la sheet « Cadeaux à débloquer ». */
export const THEMES=[
  // Chaudes (base)
  {key:'gold',    name:'Or',        color:'#C9A96E', fam:'warm',    unlockAt:0},
  {key:'ember',   name:'Braise',    color:'#FB923C', fam:'warm',    unlockAt:0},
  {key:'rose',    name:'Rose',      color:'#F472B6', fam:'warm',    unlockAt:0},
  // Froides (base)
  {key:'jade',    name:'Jade',      color:'#4ADE80', fam:'cool',    unlockAt:0},
  {key:'sapphire',name:'Saphir',    color:'#60A5FA', fam:'cool',    unlockAt:0},
  {key:'violet',  name:'Violet',    color:'#A78BFA', fam:'cool',    unlockAt:0},
  // Neutres (base)
  {key:'pearl',   name:'Perle',     color:'#CBD5E1', fam:'neutral', unlockAt:0},
  {key:'slate',   name:'Ardoise',   color:'#64748B', fam:'neutral', unlockAt:0},
  {key:'stone',   name:'Pierre',    color:'#A8A29E', fam:'neutral', unlockAt:0},
  // Bonus — chaudes
  {key:'sunflower',name:'Tournesol',color:'#F5C518', fam:'warm',    unlockAt:6000,  bonus:true},
  {key:'ruby',    name:'Rubis',     color:'#EF4444', fam:'warm',    unlockAt:12000, bonus:true},
  {key:'copper',  name:'Cuivre',    color:'#B87333', fam:'warm',    unlockAt:22000, bonus:true},
  {key:'amber',   name:'Ambre',     color:'#F59E0B', fam:'warm',    unlockAt:40000, bonus:true},
  {key:'peach',   name:'Pêche',     color:'#FDBA74', fam:'warm',    unlockAt:65000, bonus:true},
  // Bonus — froides
  {key:'mint',    name:'Menthe',    color:'#6EE7B7', fam:'cool',    unlockAt:9000,  bonus:true},
  {key:'teal',    name:'Teal',      color:'#2DD4BF', fam:'cool',    unlockAt:18000, bonus:true},
  {key:'indigo',  name:'Indigo',    color:'#818CF8', fam:'cool',    unlockAt:32000, bonus:true},
  {key:'ice',     name:'Glace',     color:'#93C5FD', fam:'cool',    unlockAt:55000, bonus:true},
  {key:'aqua',    name:'Aqua',      color:'#22D3EE', fam:'cool',    unlockAt:85000, bonus:true},
  // Bonus — neutre
  {key:'silver',  name:'Argent',    color:'#94A3B8', fam:'neutral', unlockAt:15000, bonus:true},
];

/* Thèmes d'ambiance (fond complet). Rangés : sombres → clairs, base → bonus. */
export const BASE_THEMES=[
  // Sombres de base
  {id:'dark',   name:'Sombre',       swatch:'#08090C', light:false, unlockAt:0},
  {id:'emerald',name:'Émeraude',     swatch:'#0A1F15', light:false, unlockAt:0},
  {id:'ocean',  name:'Océan',        swatch:'#0B1628', light:false, unlockAt:0},
  {id:'mocha',  name:'Moka',         swatch:'#1F1611', light:false, unlockAt:0},
  // Clairs de base
  {id:'light',  name:'Clair',        swatch:'#F5F4F0', light:true,  unlockAt:0},
  {id:'sand',   name:'Sable',        swatch:'#F3EBDD', light:true,  unlockAt:0},
  {id:'cream',  name:'Crème',        swatch:'#EBE1CD', light:true,  unlockAt:0},
  {id:'dawn',   name:'Aube',         swatch:'#F7F0F2', light:true,  unlockAt:0},
  // Sombres bonus (par palier croissant)
  {id:'amoled', name:'AMOLED',       swatch:'#000000', light:false, unlockAt:6000,   bonus:true},
  {id:'nordic', name:'Nordique',     swatch:'#1B2430', light:false, unlockAt:9000,   bonus:true},
  {id:'rosewood',name:'Rosewood',    swatch:'#1A0B10', light:false, unlockAt:15000,  bonus:true},
  {id:'starry', name:'Nuit étoilée', swatch:'#060814', light:false, unlockAt:30000,  bonus:true},
  {id:'sunset', name:'Coucher',      swatch:'#2A0F1E', light:false, unlockAt:45000,  bonus:true},
  {id:'aurora', name:'Aurore',       swatch:'#071018', light:false, unlockAt:60000,  bonus:true},
  {id:'midnight',name:'Minuit',      swatch:'#050716', light:false, unlockAt:80000,  bonus:true},
  {id:'carbon', name:'Carbone',      swatch:'#14181D', light:false, unlockAt:130000, bonus:true},
  // Clairs bonus (paliers croissants)
  {id:'sakura', name:'Sakura',       swatch:'#FFF0F3', light:true,  unlockAt:22000,  bonus:true},
  {id:'porcelain',name:'Porcelaine', swatch:'#F8F5F0', light:true,  unlockAt:38000,  bonus:true},
  {id:'linen',  name:'Lin',          swatch:'#EFE7D8', light:true,  unlockAt:55000,  bonus:true},
  {id:'mist',   name:'Brume',        swatch:'#E8ECEF', light:true,  unlockAt:70000,  bonus:true},
  {id:'frost',  name:'Givre',        swatch:'#E8F1F5', light:true,  unlockAt:85000,  bonus:true},
  {id:'peachlight',name:'Pêche pâle',swatch:'#FFE9DA', light:true,  unlockAt:95000,  bonus:true},
  {id:'mintlight',name:'Menthe pâle',swatch:'#E7F5EE', light:true,  unlockAt:105000, bonus:true},
  {id:'marble', name:'Marbre',       swatch:'#F2EFE9', light:true,  unlockAt:120000, bonus:true},
];

/* ── SKINS ── */
export const SKINS=[
  {id:'classic',     name:'Classique',         desc:'Le style Sakina original',                             unlockAt:0},
  {id:'liquid',      name:'Liquid Glass',      desc:'Verre dépoli, panneaux translucides, halos colorés',   unlockAt:0},
  {id:'masjid',      name:'Masjid',            desc:'Vert mosquée, en-têtes lumineux, cartes arrondies',    unlockAt:12000, bonus:true},
  {id:'neon',        name:'Neon Lime',         desc:'Cyberpunk : lime électrique sur noir, grille + mono',  unlockAt:25000, bonus:true},
  {id:'emerald_deep',name:'Émeraude profonde', desc:'Sanctuaire vert & calligraphie Amiri',                 unlockAt:50000, bonus:true},
  {id:'copper',      name:'Copper Dawn',       desc:'Clair, cuivre chaud, Cormorant Garamond',              unlockAt:75000, bonus:true},
  {id:'royal',       name:'Royal Cinzel',      desc:'Manuscrit doré, capitales Cinzel espacées',            unlockAt:100000,bonus:true},
  // ── Skin bonus « normal » supplémentaire ──────────────────────────────
  {id:'zellige',     name:'Zellige',           desc:'Mosaïque marocaine, motifs géométriques bleu & or',    unlockAt:18000, bonus:true},
  // ── 4 skins « laboratoire » (transformation totale de l'interface) ────
  {id:'voxel',       name:'Voxel',             desc:'Tout devient carré, pixels épais',                     unlockAt:40000, bonus:true, geek:true},
  {id:'terminal',    name:'Terminal',          desc:'CLI mono, curseur clignotant, ASCII vert',             unlockAt:65000, bonus:true, geek:true},
  {id:'matrix',      name:'Matrix',            desc:'Pluie de caractères verts, glitch phosphore',          unlockAt:120000,bonus:true, geek:true},
  {id:'crt',         name:'Retro CRT',         desc:'Écran cathodique, scanlines, phosphore ambre',         unlockAt:200000,bonus:true, geek:true},
  // ── Skins « clin d'œil » : partis pris graphiques sobrement nommés.
  {id:'persona',     name:'Velours',           desc:'Rouge sang & noir tranché, italiques marqués',           unlockAt:30000, bonus:true},
  {id:'nier',        name:'Androïde',          desc:'Sable, HUD carré, filets fins et serif discret',         unlockAt:45000, bonus:true},
  {id:'windwaker',   name:'Grand Large',       desc:'Cel-shading maritime, tampon parchemin',                 unlockAt:55000, bonus:true},
  {id:'undertale',   name:'Détermination',     desc:'Noir absolu, texte blanc pixel, cœur rouge',             unlockAt:70000, bonus:true},
  {id:'ddlc',        name:'Cahier rose',       desc:'Rose pastel, papier ligné, écriture manuscrite',         unlockAt:85000, bonus:true},
  {id:'wii',         name:'Console blanche',   desc:'Blanc brillant, cases carrées, filet noir fin',          unlockAt:100000,bonus:true},
  {id:'doodle',      name:'Bloc-notes',        desc:'Feuille lignée, doodle vert, feutre noir',               unlockAt:130000,bonus:true},
  {id:'ff7',         name:'Midgar',            desc:'HUD anguleux, néons cyan sur bleu nuit',                 unlockAt:170000,bonus:true},
];

/* ── SONS ── rangés par famille : nature → percussion → mélodique → digital → clin d'œil. */
export const SOUNDS=[
  // Nature / souffle / eau
  {id:'none',   name:'Silencieux',    desc:'Aucun son',              unlockAt:0,      cat:'nature'},
  {id:'drop',   name:'Goutte',        desc:'Doux et rond',           unlockAt:0,      cat:'nature'},
  {id:'breath', name:'Souffle',       desc:'Murmure d\'air discret', unlockAt:0,      cat:'nature'},
  {id:'droplet',name:'Goutte d\'eau', desc:'Ploc aquatique',         unlockAt:7000,   cat:'nature'},
  {id:'stream', name:'Ruisseau',      desc:'Filet d\'eau apaisant',  unlockAt:0,      cat:'nature'},
  {id:'whisper',name:'Chuchotis',     desc:'Souffle très intime',    unlockAt:180000, cat:'nature'},

  // Percussion / bois
  {id:'wood',   name:'Bois',          desc:'Chaleureux',             unlockAt:10000,  cat:'perc'},
  {id:'marimba',name:'Marimba',       desc:'Bois vibrant',           unlockAt:14000,  cat:'perc'},
  {id:'tabla',  name:'Tabla',         desc:'Percussion indienne',    unlockAt:55000,  cat:'perc'},
  {id:'click',  name:'Clic méca.',    desc:'Court et net',           unlockAt:50000,  cat:'perc'},
  // Mélodique / résonant
  {id:'pearl',  name:'Perle',         desc:'Pincement feutré',       unlockAt:0,      cat:'melo'},
  {id:'calm',   name:'Apaisant',      desc:'Onde 432 Hz très douce', unlockAt:0,      cat:'melo'},
  {id:'kalimba',name:'Kalimba',       desc:'Note chaleureuse',       unlockAt:3000,   cat:'melo'},
  {id:'hang',   name:'Handpan',       desc:'Note métallique ronde',  unlockAt:4000,   cat:'melo'},
  {id:'chime2', name:'Carillon doux', desc:'Deux notes cristallines',unlockAt:25000,  cat:'melo'},
  {id:'sing',   name:'Bol tibétain',  desc:'Bourdon méditatif',      unlockAt:20000,  cat:'melo'},
  {id:'harp',   name:'Harpe',         desc:'Corde pincée cristalline',unlockAt:35000, cat:'melo'},
  {id:'bell',   name:'Clochette',     desc:'Résonant',               unlockAt:80000,  cat:'melo'},
  {id:'glass',  name:'Verre',         desc:'Tintement fragile',      unlockAt:90000,  cat:'melo'},
  {id:'gong',   name:'Gong',          desc:'Résonance profonde',     unlockAt:140000, cat:'melo'},
  // Digital
  {id:'bleep',  name:'Bip digital',   desc:'Précis',                 unlockAt:120000, cat:'digital'},
  {id:'pulse',  name:'Pulse',         desc:'Impulsion synthé douce', unlockAt:0,      cat:'digital'},

  {id:'chip8',  name:'8-bit',         desc:'Bleep NES vintage',      unlockAt:30000,  cat:'geek', geek:true},
  {id:'laser',  name:'Laser',         desc:'Pew pew sci-fi',         unlockAt:75000,  cat:'geek', geek:true},
  {id:'coin',   name:'Pièce',         desc:'Bonus arcade',           unlockAt:110000, cat:'geek', geek:true},
  {id:'modem',  name:'Modem 56k',     desc:'Handshake nostalgique',  unlockAt:250000, cat:'geek', geek:true},
  // Sons voxel (débloqués avec le skin Voxel)
  {id:'mc_mine',    name:'Minage',    desc:'Bloc qui se casse',      unlockAt:40000,  cat:'geek', geek:true},
  {id:'mc_eat',     name:'Croquer',   desc:'Bruit de mastication',   unlockAt:60000,  cat:'geek', geek:true},
  {id:'mc_rocket',  name:'Fusée',     desc:'Feu d\'artifice qui décolle', unlockAt:95000, cat:'geek', geek:true},
  // ── Sons « clin d'œil » : timbres courts, noms sobres.
  {id:'ut_blip',     name:'Blip pixel',    desc:'Bip court façon dialogue rétro',unlockAt:30000, cat:'geek', geek:true},
  {id:'nier_beep',   name:'Cristal',       desc:'Bip cristallin de menu clair',  unlockAt:45000, cat:'geek', geek:true},
  {id:'pkm_menu',    name:'Chiptune',      desc:'Note portable vintage',         unlockAt:20000, cat:'geek', geek:true},
  {id:'ddlc_page',   name:'Tourne-page',   desc:'Page qui tourne, très doux',    unlockAt:85000, cat:'geek', geek:true},
  {id:'wii_click',   name:'Célesta',       desc:'Carillon céleste clair',        unlockAt:15000, cat:'geek', geek:true},
  {id:'doodle_jump', name:'Ressort',       desc:'Petit saut cartoon qui monte',  unlockAt:8000,  cat:'geek', geek:true},
  {id:'ff7_confirm', name:'Métal grave',   desc:'Confirmation grave métallique', unlockAt:170000,cat:'geek', geek:true},
];

/* ── AVATARS ── Uniquement des symboles islamiques / naturels sobres. */
export const AVATARS=[
  // Débloqués tôt
  {id:'kaaba',    emoji:'🕋', name:'Kaaba',        unlockAt:0,      group:'sacre'},
  {id:'moon',     emoji:'🌙', name:'Croissant',    unlockAt:500,    group:'ciel'},
  {id:'sun',      emoji:'☀️', name:'Soleil',       unlockAt:1500,   group:'ciel'},
  {id:'star',     emoji:'⭐', name:'Étoile',       unlockAt:2500,   group:'ciel'},
  // Paliers moyens
  {id:'crescent', emoji:'☪️', name:'Étoile & croissant', unlockAt:5000,  group:'sacre'},
  {id:'mosque',   emoji:'🕌', name:'Mosquée',      unlockAt:8000,   group:'sacre'},
  {id:'dove',     emoji:'🕊️', name:'Colombe',     unlockAt:12000,  group:'nature'},
  {id:'hands',    emoji:'🤲', name:'Mains en dua', unlockAt:18000,  group:'sacre'},
  {id:'beads',    emoji:'📿', name:'Tasbih',       unlockAt:25000,  group:'sacre'},
  // Paliers hauts
  {id:'sparkle',  emoji:'🌟', name:'Éclat',        unlockAt:50000,  group:'ciel'},
  {id:'rose',     emoji:'🌹', name:'Rose',         unlockAt:60000,  group:'nature'},
  {id:'palm',     emoji:'🌴', name:'Palmier',      unlockAt:80000,  group:'nature'},
  {id:'lantern',  emoji:'🏮', name:'Lanterne',     unlockAt:110000, group:'nature'},
  {id:'camel',    emoji:'🐫', name:'Chameau',      unlockAt:160000, group:'nature'},
  {id:'gem',      emoji:'💎', name:'Diamant',      unlockAt:220000, group:'precieux'},
  {id:'trophy',   emoji:'🏆', name:'Trophée',      unlockAt:400000, group:'precieux'},
];

/* ── TITRES ── Chaque titre a un emoji et un palier. Progression douce en
   début (motivation rapide) puis paliers rares pour les grands récitants. */
export const TITLES=[
  // Débuts — motivation rapide
  {id:'traveler',    name:'Voyageur',       emoji:'🌱', unlockAt:0},
  {id:'seeker',      name:'Chercheur',      emoji:'🧭', unlockAt:300},
  {id:'novice',      name:'Novice',         emoji:'🌿', unlockAt:800},
  {id:'faithful',    name:'Fidèle',         emoji:'🤲', unlockAt:1500},
  {id:'sincere',     name:'Sincère',        emoji:'💠', unlockAt:3000},
  {id:'diligent',    name:'Assidu',         emoji:'🔔', unlockAt:5000},
  {id:'devoted',     name:'Dévoué',         emoji:'🕯️', unlockAt:8000},
  // Cœur du parcours
  {id:'persistent',  name:'Persévérant',    emoji:'🌙', unlockAt:15000},
  {id:'patient',     name:'Patient',        emoji:'🌊', unlockAt:22000},
  {id:'grateful',    name:'Reconnaissant',  emoji:'✨', unlockAt:30000},
  {id:'servant',     name:'Serviteur',      emoji:'🕋', unlockAt:50000},
  {id:'pilgrim',     name:'Pèlerin',        emoji:'🐫', unlockAt:75000},
  {id:'contemplative',name:'Contemplatif',  emoji:'🌌', unlockAt:100000},
  {id:'guardian',    name:'Gardien',        emoji:'🛡️', unlockAt:130000},
  {id:'mujtahid',    name:'Studieux',       emoji:'📖', unlockAt:180000},
  // Paliers hauts — titres rares
  {id:'ascetic',     name:'Ascète',         emoji:'🍃', unlockAt:250000},
  {id:'sage',        name:'Sage',           emoji:'🦉', unlockAt:400000},
  {id:'illuminated', name:'Illuminé',       emoji:'🌟', unlockAt:650000},
  {id:'chaste',      name:'Chaste',         emoji:'🤍', unlockAt:1000000},
  {id:'moon',        name:'Pleine lune',    emoji:'🌕', unlockAt:1500000},
  {id:'lantern',     name:'Lanterne des cœurs',emoji:'🏮', unlockAt:2500000},
];

export const CALC_METHODS=[
  {id:3, name:'Muslim World League',   desc:'Ligue Islamique Mondiale (défaut monde)', fajr:18,   isha:17},
  {id:12,name:'UOIF (France 12°)',     desc:'France — Union des Organisations Islamiques', fajr:12, isha:12},
  {id:2, name:'ISNA',                  desc:'Amérique du Nord — Islamic Society of NA', fajr:15,   isha:15},
  {id:4, name:'Umm al-Qura',           desc:'Arabie Saoudite',                         fajr:18.5, ishaInterval:90},
  {id:5, name:'Egyptian Authority',    desc:'Égypte — Autorité Générale',              fajr:19.5, isha:17.5},
  {id:1, name:'Université de Karachi', desc:'Pakistan, Inde, Bangladesh',              fajr:18,   isha:18},
  {id:13,name:'Diyanet (Türkiye)',     desc:'Turquie — Diyanet İşleri Başkanlığı',     fajr:18,   isha:17},
  {id:20,name:'Kemenag (Indonesia)',   desc:'Indonésie — Kementerian Agama',           fajr:20,   isha:18},
  {id:17,name:'JAKIM (Malaysia)',      desc:'Malaisie / Singapour / Brunei',           fajr:20,   isha:18},
  {id:7, name:'Tehran (Iran)',         desc:'Iran — Univ. de Téhéran',                 fajr:17.7, isha:14},
  {id:9, name:'Qatar',                 desc:'Qatar (Umm al-Qura + 90 min Isha)',       fajr:18,   ishaInterval:90},
  {id:10,name:'Kuwait',                desc:'Koweït',                                  fajr:18,   isha:17.5},
  {id:8, name:'Gulf (Dubai)',          desc:'Émirats / Golfe',                         fajr:18.2, isha:18.2},
  {id:15,name:'Moonsighting Committee',desc:'MoonsightingCommittee.com',               fajr:18,   isha:18},
];

export const CALC_BY_COUNTRY={
  fr:12,be:12,ch:12,lu:12,mc:12,
  sa:4,ye:4,
  eg:5,sd:5,sy:5,ly:5,jo:5,lb:5,ps:5,iq:5,
  pk:1,in:1,bd:1,af:1,lk:1,
  tr:13,cy:13,
  id:20,
  my:17,sg:17,bn:17,
  ir:7,
  qa:9,kw:10,ae:8,om:8,bh:8,
  us:2,ca:2,mx:2,
  gb:3,ie:3,de:3,nl:3,se:3,no:3,dk:3,fi:3,pl:3,cz:3,at:3,it:3,es:3,pt:3,gr:3,
  ru:3,kz:3,uz:3,kg:3,tj:3,tm:3,az:3,
  ma:3,dz:3,tn:3,mr:3,
  ng:3,sn:3,ml:3,ne:3,gn:3,so:3,dj:3,km:3,td:3,
  au:3,nz:3,jp:3,cn:3,kr:3,
};
export const CALC_BY_LANG={
  fr:12,ar:3,en:3,es:3,ru:3,zh:3,ja:3,hi:1,
  tr:13,id:20,ms:17,ur:1,fa:7,bn:1,bs:3,so:3,sw:3,ha:3,
};

export const MADHABS=[
  {id:'maliki', name:'Malikite', ar:'مالكي', asrFactor:1},
  {id:'hanafi', name:'Hanafite', ar:'حنفي',  asrFactor:2},
  {id:'shafii', name:'Chaféite', ar:'شافعي', asrFactor:1},
  {id:'hanbali',name:'Hanbalite',ar:'حنبلي', asrFactor:1},
];
export const MADHAB_BY_LANG={
  fr:'maliki',ar:'maliki',en:'shafii',es:'maliki',
  tr:'hanafi',ur:'hanafi',hi:'hanafi',bn:'hanafi',fa:'shafii',
  id:'shafii',ms:'shafii',bs:'hanafi',ru:'hanafi',
};

/* Langues rangées par continent. L\'ordre des régions est celui d\'affichage. */
export const LANG_REGIONS=[
  {id:'mena',   i18n:'reg.mena',   label:'Moyen-Orient & Afrique du Nord'},
  {id:'asia',   i18n:'reg.asia',   label:'Asie'},
  {id:'africa', i18n:'reg.africa', label:'Afrique'},
  {id:'europe', i18n:'reg.europe', label:'Europe'},
];

/* `name` est le nom natif : c'est ainsi qu'on cherche sa propre langue dans
   une liste. Mais on ne peut pas taper « العربية » avec un clavier latin, ni
   deviner que le chinois s'écrit « 中文 » — d'où `alt`, les graphies sous
   lesquelles l'utilisateur risque de chercher (français, anglais, code ISO).
   Le sélecteur cherche dans name + alt + code. */
export const LANGS=[
  // Europe
  {code:'fr',name:'Français', flag:'🇫🇷', region:'europe', alt:'french francais'},
  {code:'en',name:'English',  flag:'🇬🇧', region:'europe', alt:'anglais english'},
  {code:'es',name:'Español',  flag:'🇪🇸', region:'europe', alt:'espagnol spanish castellano'},
  {code:'ru',name:'Русский',  flag:'🇷🇺', region:'europe', alt:'russe russian russkiy'},
  {code:'bs',name:'Bosanski', flag:'🇧🇦', region:'europe', alt:'bosniaque bosnian bosnien'},
  // Moyen-Orient & Afrique du Nord
  {code:'ar',name:'العربية',  flag:'🇸🇦', rtl:true, region:'mena', alt:'arabe arabic arabiya'},
  {code:'tr',name:'Türkçe',   flag:'🇹🇷', region:'mena', alt:'turc turkish turkce'},
  {code:'fa',name:'فارسی',    flag:'🇮🇷', rtl:true, region:'mena', alt:'persan persian farsi iranien'},
  // Asie
  {code:'ur',name:'اردو',      flag:'🇵🇰', rtl:true, region:'asia', alt:'ourdou urdu pakistan'},
  {code:'hi',name:'हिन्दी',    flag:'🇮🇳', region:'asia', alt:'hindi inde india'},
  {code:'bn',name:'বাংলা',    flag:'🇧🇩', region:'asia', alt:'bengali bangla bangladesh'},
  {code:'id',name:'Indonesia',flag:'🇮🇩', region:'asia', alt:'indonesien indonesian bahasa'},
  {code:'ms',name:'Melayu',   flag:'🇲🇾', region:'asia', alt:'malais malay malaisie bahasa'},
  {code:'zh',name:'中文',      flag:'🇨🇳', region:'asia', alt:'chinois chinese mandarin zhongwen'},
  {code:'ja',name:'日本語',    flag:'🇯🇵', region:'asia', alt:'japonais japanese nihongo'},
  // Afrique
  {code:'so',name:'Soomaali', flag:'🇸🇴', region:'africa', alt:'somali somalien soomaali'},
  {code:'sw',name:'Kiswahili',flag:'🇰🇪', region:'africa', alt:'swahili souahili kiswahili'},
  {code:'ha',name:'Hausa',    flag:'🇳🇬', region:'africa', alt:'haoussa hausa nigeria'},
];

export const QADA_PRAYERS=[
  {key:'fajr',    name:'Fajr',    arabic:'الفجر',  icon:'🌙'},
  {key:'dhuhr',   name:'Dhouhr',  arabic:'الظهر',  icon:'☀️'},
  {key:'asr',     name:'Asr',     arabic:'العصر',  icon:'🌤️'},
  {key:'maghrib', name:'Maghrib', arabic:'المغرب', icon:'🌅'},
  {key:'isha',    name:'Icha',    arabic:'العشاء', icon:'🌃'},
];

export const RAKAH_REF={fajr:2,dhuhr:4,asr:4,maghrib:3,isha:4};
