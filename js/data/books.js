/* SAKINA — Catalogue des livres.

   Le francais de ce fichier est la source, pas un repli : les autres
   langues s'y greffent par les cles books.*, bk.*, bks.* et bkv.*, que
   scripts/i18n_scan.py denombre et que check.py verifie.

   Il vivait dans js/features/books.js, melange au code d'affichage. Deux
   livres y ont ete ajoutes sans leur cle de titre, et « Comment faire la
   Salât » s'est affiche en francais dans les dix-sept langues pendant des
   mois. Separer la donnee de la vue permet a scripts/i18n_leaks.py de
   poser une regle simple et sans exception : aucun texte francais en dur
   dans js/features ni js/core. */
export const BOOKS={
  riyad:{
    key:'riyad',icon:'📗',type:'chapters',
    title:'Riyad as-Salihin',titleAr:'رياض الصالحين',
    author:"Imam an-Nawawi · traduction Salaheddine Kechrid",
    stats:[{val:'373',label:'Chapitres'},{val:'1896',label:'Hadiths'},{val:'VIIIᵉ s.',label:'Hégire'}],
    desc:[
      "« Les Jardins des Vertueux » est un recueil de hadiths authentiques compilé au XIIIᵉ siècle par l'imam Yahya ibn Sharaf an-Nawawi, l'un des plus grands savants du hadith et du fiqh shafiite de l'histoire musulmane.",
      "Organisé en 373 chapitres thématiques — sincérité, patience, bonté envers les parents, adab du quotidien, repentir — c'est l'un des recueils les plus lus au monde pour ancrer la foi dans le comportement de tous les jours.",
    ],
    src:'content/books/riyad.json',
    srcNotes:['Texte intégral, reproduit tel quel — édition riyad.fr.tc'],
  },
  citadelle:{
    key:'citadelle',icon:'📘',type:'pages',
    title:'La Citadelle du Musulman',titleAr:'حصن المسلم',
    author:"Sa'id ibn Ali ibn Wahf Al-Qahtani",
    stats:[{val:'146',label:'Sections'},{val:'Intégral',label:'Édition'}],
    desc:[
      "« Hisn al-Muslim » rassemble des invocations authentiques tirées du Coran et de la Sunna pour chaque instant du quotidien : réveil, repas, voyage, épreuves — afin que le rappel d'Allah accompagne le musulman à chaque moment.",
      "Une lecture continue et soignée, du début à la fin, pensée pour un confort optimal — arabe, translittération et traduction mis en valeur.",
    ],
    textSrc:'content/books/citadelle.json',
    srcNotes:["Texte intégral — Hisn al-Muslim, Sa'îd Ibn 'Alî Ibn Wahf Al-Qahtânî"],
  },
  asma:{
    key:'asma',icon:'✨',type:'names',
    title:"Les 99 Noms d'Allah",titleAr:'أسماء الله الحسنى',
    author:"Al-Asma' al-Husna — tradition sunnite classique",
    stats:[{val:'99',label:'Noms'},{val:'Ar → Fr',label:'Traduction'}],
    desc:[
      "« Les Plus Beaux Noms » d'Allah — 99 noms rapportés par la tradition, chacun révélant une facette de Sa majesté, de Sa miséricorde et de Sa perfection.",
      "« À Allah appartiennent les plus beaux noms. Invoquez-Le par ces noms » (Coran 7:180). Cette lecture est un moyen d'accroître la connaissance d'Allah et l'attachement à Lui.",
    ],
    src:'content/books/asma.json',translatable:true,
    srcNotes:["D'après la tradition classique — références coraniques et prophétiques"],
  },
  fruits:{
    key:'fruits',icon:'🌿',type:'chapters',md:true,
    title:'Les Aliments dans le Coran et la Sunna',titleAr:'الأطعمة في القرآن والسنة',
    author:'Guide original — versets, hadiths et recherche nutritionnelle actuelle',
    searchPh:'Chercher un aliment (datte, miel, nigelle…)',
    stats:[{val:'12',label:'Aliments'},{val:'Coran',label:'Versets exacts'},{val:'60+',label:'Sources'}],
    desc:[
      "Datte, raisin, figue, olive, grenade, banane, jujube, miel — les aliments que le Coran nomme. Puis les remèdes transmis par la Sunna : nigelle, orge, vinaigre, eau de Zamzam.",
      "Pour chacun : les versets et hadiths cités intégralement avec leurs références, puis ce que dit la recherche — méta-analyses, essais randomisés, revues Cochrane — avec ses résultats comme ses limites. Toutes les sources sont rassemblées en fin de lecture.",
    ],
    src:'content/books/fruits.json',translatable:true,
    srcNotes:['Versets et hadiths cités intégralement ; recherche et rédaction originales — sources en fin de lecture'],
  },
  miracles:{
    key:'miracles',icon:'✦',type:'chapters',md:true,
    title:'Les Miracles du Coran',titleAr:'معجزات القرآن',
    author:"Guide original — le défi du Coran, la Sunna et les sources",
    searchPh:'Chercher un chapitre (défi, Rome, comptages…)',
    stats:[{val:'16',label:'Chapitres'},{val:'61',label:'Versets cités'},{val:'Refaits',label:'Calculs vérifiés'}],
    desc:[
      "Le Coran met lui-même son authenticité en jeu : produire une seule sourate semblable suffirait à le réfuter. Ce défi, lancé aux plus fins connaisseurs de la langue arabe, n'a jamais été relevé.",
      "Ce guide part de là — l'inimitabilité de la parole selon les savants classiques — avant d'aborder les annonces accomplies, les versets qui décrivent la création, et les signes rapportés par la Sunna. Les comptages sont recalculés sur le texte complet, avec de quoi refaire chaque calcul soi-même.",
    ],
    src:'content/books/miracles.json',translatable:true,
    srcNotes:['Versets et hadiths cités intégralement ; comptages refaits sur les 6236 versets, dans les deux orthographes — sources et méthode en fin de lecture'],
  },
  salat:{
    key:'salat',icon:'🧎',type:'guide',
    title:'Comment faire la Salât',titleAr:'الصلاة',
    author:'Guide pratique — apprentissage général',
    stats:[{val:'5',label:'Prières'},{val:'Pas à pas',label:'Méthode'},{val:'Claire',label:'Lecture'}],
    desc:[
      "Une fiche d'apprentissage pour comprendre l'ordre général de la prière : intention, takbîr, récitation, inclinaison, prosternation, tashahhud et salâm.",
      "Selon les écoles et les mosquées, certains détails peuvent varier. Gardez ce guide comme base de révision et suivez l'enseignement de votre imam pour les points précis.",
    ],
    sections:[
      {sk:'salat.s1',icon:'🧭',title:'Avant de commencer',points:['Être en état de pureté avec les ablutions.','Prier dans un endroit propre, couvert correctement.','Se tourner vers la Qibla et savoir quelle prière on accomplit.','L’intention se fait dans le cœur, sans obligation de la prononcer.']},
      {sk:'salat.s2',icon:'1',title:'Entrée en prière',points:['Lever les mains puis dire : Allahu Akbar.','Poser les mains et commencer avec calme.','Réciter Al-Fâtiha, puis une sourate ou quelques versets dans les deux premières unités.']},
      {sk:'salat.s3',icon:'2',title:'Rukûʿ — inclinaison',points:['Dire Allahu Akbar puis s’incliner, dos posé et mains sur les genoux.','Dire plusieurs fois : Subhâna Rabbiyal ʿAzîm.','Se relever en disant : Samiʿa Allahu liman hamidah, puis Rabbana wa laka-l-hamd.']},
      {sk:'salat.s4',icon:'3',title:'Sujûd — prosternation',points:['Dire Allahu Akbar puis se prosterner.','Poser le front, le nez, les mains, les genoux et les pieds.','Dire plusieurs fois : Subhâna Rabbiyal Aʿlâ.','S’asseoir brièvement, puis faire une deuxième prosternation.']},
      {sk:'salat.s5',icon:'4',title:'Tashahhud & salâm',points:['À la fin, s’asseoir et réciter le tashahhud.','Ajouter la prière sur le Prophète ﷺ.','Clore par le salâm à droite puis à gauche : As-salâmu ʿalaykum wa rahmatullah.']},
      {sk:'salat.s6',icon:'🧩',title:'Nombre d’unités',points:['Fajr : 2 rakʿât.','Dhuhr : 4 rakʿât.','ʿAsr : 4 rakʿât.','Maghrib : 3 rakʿât.','ʿIshâ : 4 rakʿât.']},
    ],
  },
  wudu:{
    key:'wudu',icon:'💧',type:'guide',
    title:'Faire les ablutions',titleAr:'الوضوء',
    author:'Wudû’ — purification avant la prière',
    stats:[{val:'7',label:'Étapes'},{val:'Avant',label:'Salât'},{val:'Simple',label:'Mémo'}],
    desc:[
      "Les ablutions préparent à la prière et installent une intention de pureté, de concentration et de respect avant de se présenter devant Allah.",
      "Cette fiche donne l'ordre pratique le plus courant. Pour les détails de votre école juridique, suivez l'avis enseigné par votre mosquée ou professeur.",
    ],
    sections:[
      {sk:'wudu.s1',icon:'🤲',title:'Intention & basmala',points:['Avoir l’intention de faire les ablutions pour la prière.','Dire : Bismillah.','Éviter le gaspillage d’eau, même si l’eau est disponible.']},
      {sk:'wudu.s2',icon:'1',title:'Mains',points:['Laver les deux mains jusqu’aux poignets.','Faire passer l’eau entre les doigts.','Répéter jusqu’à trois fois.']},
      {sk:'wudu.s3',icon:'2',title:'Bouche & nez',points:['Rincer la bouche.','Inspirer légèrement de l’eau dans le nez puis l’expulser.','Faire doucement si l’on jeûne.']},
      {sk:'wudu.s4',icon:'3',title:'Visage',points:['Laver tout le visage : du haut du front au menton, et d’une oreille à l’autre.','Veiller aux contours du nez, de la barbe et du menton.']},
      {sk:'wudu.s5',icon:'4',title:'Bras',points:['Laver le bras droit jusqu’au coude inclus.','Puis laver le bras gauche jusqu’au coude inclus.','Ne pas oublier l’arrière des coudes.']},
      {sk:'wudu.s6',icon:'5',title:'Tête & oreilles',points:['Passer les mains mouillées sur la tête.','Essuyer les oreilles avec les doigts humides.','Un seul passage suffit dans la pratique courante.']},
      {sk:'wudu.s7',icon:'6',title:'Pieds',points:['Laver le pied droit jusqu’à la cheville incluse, puis le gauche.','Passer entre les orteils.','Vérifier que le talon est bien mouillé.']},
      {sk:'wudu.s8',icon:'✨',title:'Après les ablutions',points:['Dire l’attestation de foi.','Garder le calme et partir vers la prière sans se précipiter.','Si les ablutions sont annulées, il faut les refaire avant de prier.']},
    ],
  },
};
