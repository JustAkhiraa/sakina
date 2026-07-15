/* SAKINA — Internationalisation de l'interface.
   Couvre la navigation, les titres, les réglages et l'assistant de bienvenue.
   Le contenu religieux (douas, traductions du Coran) reste en français/arabe.
   L'arabe passe l'app en RTL. */
import {S} from '../core/store.js';
import {LANGS} from '../data/catalog.js';

const D={
  'nav.tasbih':   {fr:'Tasbih',ar:'تسبيح',en:'Tasbih',es:'Tasbih',ru:'Тасбих',zh:'念珠',ja:'タスビーフ',hi:'तस्बीह'},
  'nav.salat':    {fr:'Salat',ar:'الصلاة',en:'Prayer',es:'Salat',ru:'Намаз',zh:'礼拜',ja:'礼拝',hi:'नमाज़'},
  'nav.qibla':    {fr:'Qibla',ar:'القبلة',en:'Qibla',es:'Qibla',ru:'Кибла',zh:'朝向',ja:'キブラ',hi:'क़िबला'},
  'nav.duas':     {fr:'Douas',ar:'أدعية',en:'Duas',es:'Duas',ru:'Дуа',zh:'祈祷文',ja:'ドゥアー',hi:'दुआएं'},
  'nav.quran':    {fr:'Coran',ar:'القرآن',en:'Quran',es:'Corán',ru:'Коран',zh:'古兰经',ja:'クルアーン',hi:'क़ुरआन'},
  'nav.settings': {fr:'Réglages',ar:'الإعدادات',en:'Settings',es:'Ajustes',ru:'Настройки',zh:'设置',ja:'設定',hi:'सेटिंग्स'},

  'salat.title':      {fr:'Horaires',ar:'مواقيت الصلاة',en:'Prayer Times',es:'Horarios',ru:'Время намаза',zh:'礼拜时间',ja:'礼拝時間',hi:'नमाज़ के समय'},
  'salat.prayers':    {fr:'Prières du jour',ar:'صلوات اليوم',en:"Today's prayers",es:'Oraciones del día',ru:'Молитвы дня',zh:'今日礼拜',ja:'今日の礼拝',hi:'आज की नमाज़ें'},
  'salat.fast':       {fr:'Jeûne du jour',ar:'صيام اليوم',en:"Today's fast",es:'Ayuno del día',ru:'Пост дня',zh:'今日斋戒',ja:'今日の断食',hi:'आज का रोज़ा'},
  'salat.method':     {fr:'Méthode de calcul',ar:'طريقة الحساب',en:'Calculation method',es:'Método de cálculo',ru:'Метод расчёта',zh:'计算方法',ja:'計算方法',hi:'गणना विधि'},
  'salat.next':       {fr:'PROCHAINE',ar:'القادمة',en:'NEXT',es:'PRÓXIMA',ru:'СЛЕДУЮЩАЯ',zh:'下一次',ja:'次の礼拝',hi:'अगली'},

  'qibla.title': {fr:'Direction Qibla',ar:'اتجاه القبلة',en:'Qibla Direction',es:'Dirección Qibla',ru:'Направление Киблы',zh:'朝向方位',ja:'キブラの方角',hi:'क़िबला दिशा'},
  'qibla.sub':   {fr:"Vers la Ka'ba — La Mecque",ar:'نحو الكعبة — مكة',en:"Towards the Ka'ba — Mecca",es:'Hacia la Kaaba — La Meca',ru:'К Каабе — Мекка',zh:'朝向克尔白——麦加',ja:'カアバへ——メッカ',hi:'काबा की ओर — मक्का'},

  'duas.title': {fr:'Invocations',ar:'الأدعية',en:'Supplications',es:'Invocaciones',ru:'Дуа',zh:'祈祷文',ja:'ドゥアー',hi:'दुआएं'},
  'duas.sub':   {fr:"Doua's & Adhkâr",ar:'أدعية وأذكار',en:'Duas & Adhkar',es:'Duas y Adhkar',ru:'Дуа и азкары',zh:'祈祷与记主',ja:'ドゥアーとズィクル',hi:'दुआ और अज़कार'},

  'settings.title': {fr:'Paramètres',ar:'الإعدادات',en:'Settings',es:'Ajustes',ru:'Настройки',zh:'设置',ja:'設定',hi:'सेटिंग्स'},
  'sec.stats':      {fr:'Statistiques',ar:'إحصائيات',en:'Statistics',es:'Estadísticas',ru:'Статистика',zh:'统计',ja:'統計',hi:'आंकड़े'},
  'sec.tools':      {fr:'Outils islamiques',ar:'أدوات إسلامية',en:'Islamic tools',es:'Herramientas islámicas',ru:'Исламские инструменты',zh:'伊斯兰工具',ja:'イスラームツール',hi:'इस्लामी उपकरण'},
  'sec.practice':   {fr:'Pratique religieuse',ar:'الممارسة الدينية',en:'Religious practice',es:'Práctica religiosa',ru:'Религиозная практика',zh:'宗教实践',ja:'宗教実践',hi:'धार्मिक अभ्यास'},
  'sec.appearance': {fr:'Apparence',ar:'المظهر',en:'Appearance',es:'Apariencia',ru:'Внешний вид',zh:'外观',ja:'外観',hi:'दिखावट'},
  'sec.sound':      {fr:'Son du compteur',ar:'صوت العداد',en:'Counter sound',es:'Sonido del contador',ru:'Звук счётчика',zh:'计数音效',ja:'カウンター音',hi:'काउंटर ध्वनि'},
  'sec.prefs':      {fr:'Préférences',ar:'التفضيلات',en:'Preferences',es:'Preferencias',ru:'Предпочтения',zh:'偏好设置',ja:'設定',hi:'प्राथमिकताएं'},
  'sec.data':       {fr:'Données',ar:'البيانات',en:'Data',es:'Datos',ru:'Данные',zh:'数据',ja:'データ',hi:'डेटा'},
  'sec.about':      {fr:'À propos',ar:'حول التطبيق',en:'About',es:'Acerca de',ru:'О приложении',zh:'关于',ja:'アプリについて',hi:'ऐप के बारे में'},

  'row.qada':      {fr:"Rattrapage des Prières (Qadâ')",ar:'قضاء الصلوات',en:'Missed Prayers (Qada)',es:'Oraciones perdidas (Qada)',ru:'Восполнение молитв (Када)',zh:'补礼拜（格达）',ja:'礼拝の補い（カダー）',hi:'छूटी नमाज़ें (क़ज़ा)'},
  'row.rakah':     {fr:"Compteur Rak'ah",ar:'عداد الركعات',en:"Rak'ah Counter",es:'Contador de Rakah',ru:'Счётчик ракатов',zh:'拜数计数器',ja:'ラカート・カウンター',hi:'रकअत काउंटर'},
  'row.zakat':     {fr:'Calcul de la Zakat',ar:'حساب الزكاة',en:'Zakat Calculator',es:'Cálculo del Zakat',ru:'Калькулятор закята',zh:'天课计算',ja:'ザカート計算',hi:'ज़कात कैलकुलेटर'},
  'row.hijri':     {fr:'Convertisseur de date hégirien',ar:'محوّل التاريخ الهجري',en:'Hijri date converter',es:'Conversor de fecha hégira',ru:'Конвертер дат хиджры',zh:'伊历日期转换',ja:'ヒジュラ暦変換',hi:'हिजरी तिथि परिवर्तक'},
  'row.fasting':   {fr:'Calendrier du Jeûne',ar:'تقويم الصيام',en:'Fasting Calendar',es:'Calendario de ayuno',ru:'Календарь поста',zh:'斋戒日历',ja:'断食カレンダー',hi:'रोज़ा कैलेंडर'},
  'row.places':    {fr:'À proximité — Mosquées & Halal',ar:'بالقرب — مساجد وحلال',en:'Nearby — Mosques & Halal',es:'Cerca — Mezquitas y Halal',ru:'Рядом — мечети и халяль',zh:'附近——清真寺与清真食品',ja:'近くのモスク＆ハラール',hi:'आस-पास — मस्जिदें और हलाल'},
  'row.halal':     {fr:"Vérif' Halal — Scan & Additifs",ar:'فحص الحلال — مسح وإضافات',en:'Halal Check — Scan & Additives',es:'Verificación Halal',ru:'Халяль-проверка',zh:'清真检查——扫码与添加剂',ja:'ハラールチェック',hi:'हलाल जांच — स्कैन'},
  'row.theme':     {fr:'Thème',ar:'السمة',en:'Theme',es:'Tema',ru:'Тема',zh:'主题',ja:'テーマ',hi:'थीम'},
  'row.accent':    {fr:"Couleur d'accent",ar:'لون التمييز',en:'Accent color',es:'Color de acento',ru:'Акцентный цвет',zh:'强调色',ja:'アクセントカラー',hi:'एक्सेंट रंग'},
  'row.hourfmt':   {fr:"Format d'heure",ar:'صيغة الوقت',en:'Time format',es:'Formato de hora',ru:'Формат времени',zh:'时间格式',ja:'時刻表示',hi:'समय प्रारूप'},
  'row.lang':      {fr:'Langue',ar:'اللغة',en:'Language',es:'Idioma',ru:'Язык',zh:'语言',ja:'言語',hi:'भाषा'},
  'row.madhab':    {fr:'École juridique (madhhab)',ar:'المذهب الفقهي',en:'School of law (madhhab)',es:'Escuela jurídica (madhab)',ru:'Мазхаб',zh:'教法学派',ja:'法学派（マズハブ）',hi:'फ़िक़्ह मज़हब'},
  'row.sound':     {fr:'Son',ar:'الصوت',en:'Sound',es:'Sonido',ru:'Звук',zh:'声音',ja:'サウンド',hi:'ध्वनि'},
  'row.vib':       {fr:'Vibration haptique',ar:'الاهتزاز',en:'Haptic vibration',es:'Vibración',ru:'Вибрация',zh:'触觉振动',ja:'振動',hi:'कंपन'},
  'row.loop':      {fr:'Boucle automatique',ar:'تكرار تلقائي',en:'Auto loop',es:'Bucle automático',ru:'Автоповтор',zh:'自动循环',ja:'自動ループ',hi:'स्वचालित लूप'},
  'row.night':     {fr:'Nuit profonde (OLED)',ar:'ليل عميق (OLED)',en:'Deep night (OLED)',es:'Noche profunda (OLED)',ru:'Глубокая ночь (OLED)',zh:'深夜模式 (OLED)',ja:'ディープナイト (OLED)',hi:'गहरी रात (OLED)'},
  'row.lock':      {fr:'Verrouillage écran',ar:'قفل الشاشة',en:'Screen lock',es:'Bloqueo de pantalla',ru:'Блокировка экрана',zh:'屏幕锁定',ja:'画面ロック',hi:'स्क्रीन लॉक'},
  'row.export':    {fr:'Exporter mes données',ar:'تصدير بياناتي',en:'Export my data',es:'Exportar mis datos',ru:'Экспорт данных',zh:'导出我的数据',ja:'データをエクスポート',hi:'मेरा डेटा निर्यात करें'},
  'row.reset':     {fr:'Tout réinitialiser',ar:'إعادة تعيين الكل',en:'Reset everything',es:'Restablecer todo',ru:'Сбросить всё',zh:'全部重置',ja:'すべてリセット',hi:'सब कुछ रीसेट करें'},
  'row.privacy':   {fr:'Politique de confidentialité',ar:'سياسة الخصوصية',en:'Privacy policy',es:'Política de privacidad',ru:'Политика конфиденциальности',zh:'隐私政策',ja:'プライバシーポリシー',hi:'गोपनीयता नीति'},

  'stat.dhikrs':   {fr:'Dhikrs',ar:'أذكار',en:'Dhikrs',es:'Dhikrs',ru:'Зикры',zh:'记主',ja:'ズィクル',hi:'ज़िक्र'},
  'stat.sessions': {fr:'Sessions',ar:'جلسات',en:'Sessions',es:'Sesiones',ru:'Сессии',zh:'次数',ja:'セッション',hi:'सत्र'},
  'stat.days':     {fr:'Jours 🔥',ar:'أيام 🔥',en:'Days 🔥',es:'Días 🔥',ru:'Дни 🔥',zh:'天数 🔥',ja:'日数 🔥',hi:'दिन 🔥'},

  'ctrl.undo':    {fr:'Annuler',ar:'تراجع',en:'Undo',es:'Deshacer',ru:'Отмена',zh:'撤销',ja:'元に戻す',hi:'पूर्ववत'},
  'ctrl.reset':   {fr:'Reset',ar:'تصفير',en:'Reset',es:'Reiniciar',ru:'Сброс',zh:'重置',ja:'リセット',hi:'रीसेट'},
  'ctrl.save':    {fr:'Sauver',ar:'حفظ',en:'Save',es:'Guardar',ru:'Сохранить',zh:'保存',ja:'保存',hi:'सहेजें'},
  'ctrl.history': {fr:'Historique',ar:'السجل',en:'History',es:'Historial',ru:'История',zh:'历史',ja:'履歴',hi:'इतिहास'},
  'tap.label':    {fr:'APPUYER',ar:'اضغط',en:'TAP',es:'TOCAR',ru:'НАЖМИТЕ',zh:'点击',ja:'タップ',hi:'टैप करें'},

  'ob.welcomeTitle':{fr:'Bienvenue sur Sakina',ar:'مرحباً بك في سكينة',en:'Welcome to Sakina',es:'Bienvenido a Sakina',ru:'Добро пожаловать в Sakina',zh:'欢迎使用 Sakina',ja:'Sakinaへようこそ',hi:'Sakina में आपका स्वागत है'},
  'ob.welcomeSub':{fr:'Votre compagnon spirituel : tasbih, horaires de prière, qibla, Coran et invocations — sans publicité, sans compte.',ar:'رفيقك الروحي: تسبيح، مواقيت الصلاة، القبلة، القرآن والأدعية — بدون إعلانات وبدون حساب.',en:'Your spiritual companion: tasbih, prayer times, qibla, Quran and duas — no ads, no account.',es:'Tu compañero espiritual: tasbih, horarios de oración, qibla, Corán e invocaciones — sin anuncios, sin cuenta.',ru:'Ваш духовный спутник: тасбих, время намаза, кибла, Коран и дуа — без рекламы и без аккаунта.',zh:'您的灵修伴侣：念珠、礼拜时间、朝向、古兰经和祈祷文——无广告、无需账户。',ja:'あなたの霊的パートナー：タスビーフ、礼拝時間、キブラ、クルアーン、ドゥアー。広告なし、アカウント不要。',hi:'आपका आध्यात्मिक साथी: तस्बीह, नमाज़ के समय, क़िबला, क़ुरआन और दुआएं — बिना विज्ञापन, बिना खाते के।'},
  'ob.langLabel': {fr:'Langue de l’interface',ar:'لغة الواجهة',en:'Interface language',es:'Idioma de la interfaz',ru:'Язык интерфейса',zh:'界面语言',ja:'インターフェース言語',hi:'इंटरफ़ेस भाषा'},
  'ob.ambTitle':  {fr:'Votre ambiance',ar:'أجواؤك',en:'Your ambiance',es:'Tu ambiente',ru:'Ваша атмосфера',zh:'您的氛围',ja:'あなたの雰囲気',hi:'आपका माहौल'},
  'ob.ambSub':    {fr:'Choisissez le thème et la couleur — modifiables à tout moment dans les Réglages.',ar:'اختر السمة واللون — يمكن تغييرهما في أي وقت من الإعدادات.',en:'Choose theme and color — changeable anytime in Settings.',es:'Elige tema y color — modificables en Ajustes.',ru:'Выберите тему и цвет — можно изменить в настройках.',zh:'选择主题和颜色——可随时在设置中更改。',ja:'テーマと色を選択——設定でいつでも変更可能。',hi:'थीम और रंग चुनें — सेटिंग्स में कभी भी बदल सकते हैं।'},
  'ob.prayTitle': {fr:'Horaires de prière',ar:'مواقيت الصلاة',en:'Prayer times',es:'Horarios de oración',ru:'Время намаза',zh:'礼拜时间',ja:'礼拝時間',hi:'नमाज़ के समय'},
  'ob.praySub':   {fr:'Quelle méthode de calcul suit votre mosquée ou votre pays ?',ar:'ما طريقة الحساب التي يتبعها مسجدك أو بلدك؟',en:'Which calculation method does your mosque or country follow?',es:'¿Qué método de cálculo sigue tu mezquita o país?',ru:'Какой метод расчёта использует ваша мечеть или страна?',zh:'您的清真寺或国家采用哪种计算方法？',ja:'あなたのモスクや国はどの計算方法を採用していますか？',hi:'आपकी मस्जिद या देश कौन सी गणना विधि अपनाता है?'},
  'ob.madhabLabel':{fr:'École juridique (heure de l’Asr)',ar:'المذهب الفقهي (وقت العصر)',en:'School of law (Asr time)',es:'Escuela jurídica (hora del Asr)',ru:'Мазхаб (время аср)',zh:'教法学派（晡礼时间）',ja:'法学派（アスルの時間）',hi:'मज़हब (अस्र का समय)'},
  'ob.locTitle':  {fr:'Votre position',ar:'موقعك',en:'Your location',es:'Tu ubicación',ru:'Ваше местоположение',zh:'您的位置',ja:'あなたの位置',hi:'आपका स्थान'},
  'ob.locSub':    {fr:'Nécessaire pour calculer vos horaires de prière et la direction de la Qibla. Elle reste sur votre appareil.',ar:'ضروري لحساب مواقيت الصلاة واتجاه القبلة. يبقى على جهازك.',en:'Needed to compute your prayer times and Qibla direction. It stays on your device.',es:'Necesaria para calcular los horarios y la Qibla. Permanece en tu dispositivo.',ru:'Нужно для расчёта времени намаза и Киблы. Данные остаются на устройстве.',zh:'用于计算礼拜时间和朝向。数据保留在您的设备上。',ja:'礼拝時間とキブラの計算に必要です。データは端末に保存されます。',hi:'नमाज़ के समय और क़िबला की गणना के लिए आवश्यक। यह आपके डिवाइस पर रहता है।'},
  'ob.gps':       {fr:'📍 Détecter par GPS',ar:'📍 تحديد عبر GPS',en:'📍 Detect via GPS',es:'📍 Detectar por GPS',ru:'📍 Определить по GPS',zh:'📍 通过GPS定位',ja:'📍 GPSで検出',hi:'📍 GPS से पता लगाएं'},
  'ob.searchCity':{fr:'Ou chercher une ville',ar:'أو ابحث عن مدينة',en:'Or search a city',es:'O buscar una ciudad',ru:'Или найдите город',zh:'或搜索城市',ja:'または都市を検索',hi:'या शहर खोजें'},
  'ob.start':     {fr:'Commencer',ar:'ابدأ',en:'Start',es:'Comenzar',ru:'Начать',zh:'开始',ja:'始める',hi:'शुरू करें'},
  'ob.next':      {fr:'Suivant',ar:'التالي',en:'Next',es:'Siguiente',ru:'Далее',zh:'下一步',ja:'次へ',hi:'आगे'},
  'ob.back':      {fr:'Retour',ar:'رجوع',en:'Back',es:'Atrás',ru:'Назад',zh:'返回',ja:'戻る',hi:'वापस'},
  'ob.letsgo':    {fr:"C'est parti ✦",ar:'هيا بنا ✦',en:"Let's go ✦",es:'¡Vamos! ✦',ru:'Поехали ✦',zh:'出发 ✦',ja:'スタート ✦',hi:'चलिए ✦'},
  'ob.skip':      {fr:'Passer cette étape — je choisirai plus tard',ar:'تخطي هذه الخطوة — سأختار لاحقاً',en:"Skip this step — I'll choose later",es:'Omitir este paso — elegiré después',ru:'Пропустить — выберу позже',zh:'跳过此步——稍后选择',ja:'この手順をスキップ——後で選ぶ',hi:'यह चरण छोड़ें — बाद में चुनूंगा'},

  'com.confirm': {fr:'Confirmer',ar:'تأكيد',en:'Confirm',es:'Confirmar',ru:'Подтвердить',zh:'确认',ja:'確認',hi:'पुष्टि करें'},
  'com.cancel':  {fr:'Annuler',ar:'إلغاء',en:'Cancel',es:'Cancelar',ru:'Отмена',zh:'取消',ja:'キャンセル',hi:'रद्द करें'},
  'com.contentNote':{fr:'Le contenu religieux (douas, traduction du Coran) reste en français/arabe pour le moment.',ar:'المحتوى الديني (الأدعية وترجمة القرآن) يبقى بالفرنسية/العربية حالياً.',en:'Religious content (duas, Quran translation) remains in French/Arabic for now.',es:'El contenido religioso permanece en francés/árabe por ahora.',ru:'Религиозный контент пока остаётся на французском/арабском.',zh:'宗教内容（祈祷文、古兰经翻译）目前仍为法语/阿拉伯语。',ja:'宗教コンテンツは現在フランス語／アラビア語のままです。',hi:'धार्मिक सामग्री फ़िलहाल फ़्रेंच/अरबी में ही रहेगी।'},
};

export function t(key){
  const e=D[key];
  if(!e)return key;
  return e[S.lang]||e.fr;
}

export function isRTL(){return !!(LANGS.find(l=>l.code===S.lang)||{}).rtl;}

/* Applique la langue à tous les éléments marqués data-i18n, et gère le sens RTL */
export function applyI18n(){
  document.documentElement.lang=S.lang;
  document.documentElement.dir=isRTL()?'rtl':'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent=t(el.dataset.i18n);
  });
}
