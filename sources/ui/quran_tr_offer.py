#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Proposition d'activer la traduction du Coran au changement de langue.

Choisir le japonais pour l'interface et continuer a lire les versets en
francais n'a guere de sens. Activer la traduction d'autorite serait pourtant
presomptueux : elle pese plusieurs mega-octets et le lecteur a peut-etre
deja choisi les siennes. On propose donc, une fois par langue.
"""

LOTS = {

"set.trOfferTitle": {
 "fr": "Traduction du Coran", "en": "Qur'an translation",
 "es": "Traducción del Corán", "ru": "Перевод Корана",
 "bs": "Prijevod Kur'ana", "ar": "ترجمة القرآن",
 "tr": "Kur'an meali", "fa": "ترجمهٔ قرآن", "ur": "قرآن کا ترجمہ",
 "hi": "क़ुरआन का अनुवाद", "bn": "কুরআনের অনুবাদ",
 "id": "Terjemahan Al-Qur'an", "ms": "Terjemahan Al-Quran",
 "zh": "《古兰经》译本", "ja": "クルアーンの訳",
 "so": "Turjumaadda Quraanka", "sw": "Tafsiri ya Qur'ani",
 "ha": "Fassarar Alqur'ani",
},

"set.trOfferQ": {
 "fr": "Afficher aussi le Coran en {lang} sous chaque verset ?",
 "en": "Also show the Qur'an in {lang} under each verse?",
 "es": "¿Mostrar también el Corán en {lang} bajo cada versículo?",
 "ru": "Показывать Коран на {lang} под каждым аятом?",
 "bs": "Prikazati Kur'an i na {lang} ispod svakog ajeta?",
 "ar": "أتريد عرض القرآن بـ{lang} أيضًا تحت كل آية؟",
 "tr": "Kur'an'ı her ayetin altında {lang} olarak da göstermek ister misiniz?",
 "fa": "قرآن به {lang} نیز زیر هر آیه نمایش داده شود؟",
 "ur": "کیا ہر آیت کے نیچے قرآن {lang} میں بھی دکھایا جائے؟",
 "hi": "क्या हर आयत के नीचे क़ुरआन {lang} में भी दिखाएँ?",
 "bn": "প্রতিটি আয়াতের নিচে কুরআন {lang}-এও দেখাবেন?",
 "id": "Tampilkan juga Al-Qur'an dalam bahasa {lang} di bawah setiap ayat?",
 "ms": "Paparkan juga Al-Quran dalam bahasa {lang} di bawah setiap ayat?",
 "zh": "是否同时在每节经文下显示{lang}译文？",
 "ja": "各節の下に{lang}の訳も表示しますか。",
 "so": "Ma doonaysaa in Quraanka {lang} sidoo kale lagu tuso aayad kasta hoosteeda?",
 "sw": "Uonyeshe pia Qur'ani kwa {lang} chini ya kila aya?",
 "ha": "A nuna Alqur'ani da {lang} kuma a ƙarƙashin kowace aya?",
},

"set.trOfferSize": {
 "fr": "{author} · {mb} Mo à télécharger une seule fois, puis lisible hors connexion.",
 "en": "{author} · {mb} MB, downloaded once, then readable offline.",
 "es": "{author} · {mb} MB, se descarga una vez y luego se lee sin conexión.",
 "ru": "{author} · {mb} МБ, загрузка один раз, затем чтение офлайн.",
 "bs": "{author} · {mb} MB, preuzima se jednom, zatim se čita bez interneta.",
 "ar": "{author} · {mb} م.ب تُنزَّل مرة واحدة، ثم تُقرأ دون اتصال.",
 "tr": "{author} · {mb} MB, bir kez indirilir, sonra çevrimdışı okunur.",
 "fa": "{author} · {mb} مگابایت، یک‌بار دانلود و سپس آفلاین خواندنی.",
 "ur": "{author} · {mb} MB، ایک بار ڈاؤن لوڈ، پھر آف لائن قابلِ مطالعہ۔",
 "hi": "{author} · {mb} MB, एक बार डाउनलोड, फिर ऑफ़लाइन पढ़ने योग्य।",
 "bn": "{author} · {mb} MB, একবার ডাউনলোড, তারপর অফলাইনে পড়া যায়।",
 "id": "{author} · {mb} MB, diunduh sekali, lalu dapat dibaca luring.",
 "ms": "{author} · {mb} MB, dimuat turun sekali, kemudian boleh dibaca luar talian.",
 "zh": "{author} · {mb} MB，仅下载一次，之后可离线阅读。",
 "ja": "{author}・{mb} MB。一度だけ取得すれば、以後はオフラインで読めます。",
 "so": "{author} · {mb} MB, hal mar la soo dejiyo, kaddibna offline ayaa la akhriyi karaa.",
 "sw": "{author} · {mb} MB, hupakuliwa mara moja, kisha husomeka nje ya mtandao.",
 "ha": "{author} · {mb} MB, a sauke sau ɗaya, sannan a karanta ba tare da yanar gizo ba.",
},

# « Français · English et 3 autres » — le « et N autres » etait ecrit en dur.
"set.trSummaryMore": {
 "fr": "{first} et {n} autres", "en": "{first} and {n} more",
 "es": "{first} y {n} más", "ru": "{first} и ещё {n}",
 "bs": "{first} i još {n}", "ar": "{first} و{n} أخرى",
 "tr": "{first} ve {n} tane daha", "fa": "{first} و {n} مورد دیگر",
 "ur": "{first} اور {n} مزید", "hi": "{first} और {n} अन्य",
 "bn": "{first} এবং আরও {n}টি", "id": "{first} dan {n} lainnya",
 "ms": "{first} dan {n} lagi", "zh": "{first} 等 {n} 种",
 "ja": "{first} ほか{n}件", "so": "{first} iyo {n} kale",
 "sw": "{first} na nyingine {n}", "ha": "{first} da wasu {n}",
},

"set.offlineReady": {
 "fr": "disponible hors connexion", "en": "available offline",
 "es": "disponible sin conexión", "ru": "доступно офлайн",
 "bs": "dostupno bez interneta", "ar": "متاح دون اتصال",
 "tr": "çevrimdışı kullanılabilir", "fa": "در دسترس به‌صورت آفلاین",
 "ur": "آف لائن دستیاب", "hi": "ऑफ़लाइन उपलब्ध", "bn": "অফলাইনে উপলব্ধ",
 "id": "tersedia luring", "ms": "tersedia luar talian",
 "zh": "可离线使用", "ja": "オフラインで利用可",
 "so": "offline ayaa la heli karaa", "sw": "inapatikana nje ya mtandao",
 "ha": "akwai ba tare da yanar gizo ba",
},

"com.yes": {
 "fr": "Oui", "en": "Yes", "es": "Sí", "ru": "Да", "bs": "Da",
 "ar": "نعم", "tr": "Evet", "fa": "بله", "ur": "ہاں", "hi": "हाँ",
 "bn": "হ্যাঁ", "id": "Ya", "ms": "Ya", "zh": "是", "ja": "はい",
 "so": "Haa", "sw": "Ndiyo", "ha": "Eh",
},

"com.no": {
 "fr": "Non", "en": "No", "es": "No", "ru": "Нет", "bs": "Ne",
 "ar": "لا", "tr": "Hayır", "fa": "خیر", "ur": "نہیں", "hi": "नहीं",
 "bn": "না", "id": "Tidak", "ms": "Tidak", "zh": "否", "ja": "いいえ",
 "so": "Maya", "sw": "Hapana", "ha": "A'a",
},

# L'ancienne note du selecteur de langue disait que le contenu religieux
# restait en francais. Ce n'est plus vrai : les invocations viennent
# d'editions traduites et le Coran a ses corpus.
"com.contentNote": {
 "fr": "Les invocations et le Coran suivent la langue choisie quand une édition publiée existe ; sinon l'application le signale plutôt que de traduire elle-même.",
 "en": "Supplications and the Qur'an follow the chosen language wherever a published edition exists; otherwise the app says so rather than translating on its own.",
 "es": "Las súplicas y el Corán siguen el idioma elegido cuando existe una edición publicada; si no, la aplicación lo indica en vez de traducir por su cuenta.",
 "ru": "Мольбы и Коран следуют выбранному языку там, где есть изданный перевод; иначе приложение сообщает об этом, а не переводит само.",
 "bs": "Dove i Kur'an prate odabrani jezik ondje gdje postoji objavljeno izdanje; inače aplikacija to naznači umjesto da prevodi sama.",
 "ar": "تتبع الأدعية والقرآن اللغة المختارة حيثما وُجدت طبعة منشورة؛ وإلا نبّهك التطبيق بدل أن يترجم من عنده.",
 "tr": "Dualar ve Kur'an, yayımlanmış bir baskı bulunduğunda seçtiğiniz dili izler; yoksa uygulama kendi çevirmek yerine bunu belirtir.",
 "fa": "دعاها و قرآن، هرجا نسخه‌ای منتشرشده باشد، از زبان انتخابی پیروی می‌کنند؛ وگرنه برنامه آن را اعلام می‌کند و خود ترجمه نمی‌کند.",
 "ur": "دعائیں اور قرآن منتخب زبان کی پیروی کرتے ہیں جہاں شائع شدہ ایڈیشن موجود ہو؛ ورنہ ایپ خود ترجمہ کرنے کے بجائے اس کی نشاندہی کرتی ہے۔",
 "hi": "जहाँ प्रकाशित संस्करण उपलब्ध है, वहाँ दुआएँ और क़ुरआन चुनी हुई भाषा में आते हैं; अन्यथा ऐप स्वयं अनुवाद करने के बजाय यह बता देता है।",
 "bn": "প্রকাশিত সংস্করণ থাকলে দোয়া ও কুরআন নির্বাচিত ভাষা অনুসরণ করে; না থাকলে অ্যাপ নিজে অনুবাদ না করে তা জানিয়ে দেয়।",
 "id": "Doa dan Al-Qur'an mengikuti bahasa pilihan bila ada edisi terbitan; jika tidak, aplikasi menandainya alih-alih menerjemahkan sendiri.",
 "ms": "Doa dan Al-Quran mengikut bahasa pilihan apabila terdapat edisi terbitan; jika tidak, aplikasi menandakannya dan tidak menterjemah sendiri.",
 "zh": "凡有已出版译本，祈祷词与《古兰经》即随所选语言显示；否则应用会加以标示，而不自行翻译。",
 "ja": "刊行された版がある場合、ドゥアーとクルアーンは選んだ言語で表示されます。ない場合はその旨を示し、独自に訳すことはしません。",
 "so": "Ducooyinka iyo Quraanku waxay raacaan luqadda la doortay marka ay jirto daabacaad la daabacay; haddii kale barnaamijku wuu tilmaamaa halkii uu isagu turjumi lahaa.",
 "sw": "Dua na Qur'ani hufuata lugha uliyochagua pale toleo lililochapishwa lipo; la sivyo programu hulieleza badala ya kutafsiri yenyewe.",
 "ha": "Addu'o'i da Alqur'ani suna bin harshen da aka zaɓa duk inda akwai bugu da aka wallafa; in babu, manhajar takan nuna hakan maimakon ta fassara da kanta.",
},
}
