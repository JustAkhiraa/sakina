#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Chaines qui etaient ecrites en francais en dur dans le code d'affichage.

Toutes trouvees par scripts/i18n_leaks.py, qui interdit desormais leur
retour. Les paliers de serie en sont l'exemple type : la premiere ligne
passait par t(), les six suivantes non, et « Étincelle » s'affichait sous
une interface japonaise.
"""

LOTS = {

# ── Paliers de serie ─────────────────────────────────────────────────
"streak.spark": {
 "fr": "Étincelle", "en": "Spark", "es": "Chispa", "ru": "Искра",
 "bs": "Iskra", "ar": "شرارة", "tr": "Kıvılcım", "fa": "جرقه",
 "ur": "چنگاری", "hi": "चिंगारी", "bn": "স্ফুলিঙ্গ", "id": "Percik",
 "ms": "Percikan", "zh": "火花", "ja": "灯", "so": "Dhimbil",
 "sw": "Cheche", "ha": "Tartsatsi",
},
"streak.fire": {
 "fr": "En feu", "en": "On fire", "es": "En llamas", "ru": "В огне",
 "bs": "U plamenu", "ar": "مشتعل", "tr": "Alevli", "fa": "شعله‌ور",
 "ur": "شعلہ زن", "hi": "आग पर", "bn": "জ্বলন্ত", "id": "Menyala",
 "ms": "Menyala", "zh": "燃烧中", "ja": "燃焼中", "so": "Ololaya",
 "sw": "Unawaka", "ha": "Cin wuta",
},
"streak.blaze": {
 "fr": "Brasier", "en": "Blaze", "es": "Hoguera", "ru": "Пламя",
 "bs": "Vatra", "ar": "لهيب", "tr": "Ateş", "fa": "آتش",
 "ur": "آگ", "hi": "ज्वाला", "bn": "অগ্নিশিখা", "id": "Bara",
 "ms": "Bara", "zh": "烈火", "ja": "炎", "so": "Holac",
 "sw": "Mwako", "ha": "Harshen wuta",
},
"streak.furnace": {
 "fr": "Fournaise", "en": "Furnace", "es": "Horno", "ru": "Горнило",
 "bs": "Peć", "ar": "أتون", "tr": "Ocak", "fa": "کوره",
 "ur": "بھٹی", "hi": "भट्ठी", "bn": "চুল্লি", "id": "Tanur",
 "ms": "Relau", "zh": "熔炉", "ja": "灼熱", "so": "Foorno",
 "sw": "Tanuru", "ha": "Matoya",
},
"streak.star": {
 "fr": "Étoile ardente", "en": "Burning star", "es": "Estrella ardiente",
 "ru": "Пылающая звезда", "bs": "Goruća zvijezda", "ar": "نجم متوهج",
 "tr": "Yanan yıldız", "fa": "ستارهٔ سوزان", "ur": "جلتا ستارہ",
 "hi": "जलता तारा", "bn": "জ্বলন্ত তারা", "id": "Bintang berpijar",
 "ms": "Bintang menyala", "zh": "燃星", "ja": "燃える星",
 "so": "Xiddig ololaya", "sw": "Nyota inayowaka", "ha": "Tauraruwa mai ci",
},
"streak.crown": {
 "fr": "Souverain·e", "en": "Sovereign", "es": "Soberano",
 "ru": "Владыка", "bs": "Vladar", "ar": "متوَّج", "tr": "Hükümdar",
 "fa": "فرمانروا", "ur": "حکمران", "hi": "सम्राट", "bn": "অধিপতি",
 "id": "Berdaulat", "ms": "Berdaulat", "zh": "至尊", "ja": "君臨",
 "so": "Boqor", "sw": "Mfalme", "ha": "Sarki",
},

# ── Bibliotheque ─────────────────────────────────────────────────────
"books.citadelleSrc": {
 "fr": "Hisn al-Muslim — La Citadelle du Musulman · Sa'îd Ibn 'Alî Ibn Wahf Al-Qahtânî · texte intégral",
 "en": "Hisn al-Muslim — Fortress of the Muslim · Sa'id Ibn 'Ali Ibn Wahf al-Qahtani · full text",
 "es": "Hisn al-Muslim — La Fortaleza del Musulmán · Sa'id Ibn 'Ali Ibn Wahf al-Qahtani · texto íntegro",
 "ru": "Хисн аль-Муслим — Крепость мусульманина · Са'ид ибн 'Али ибн Вахф аль-Кахтани · полный текст",
 "bs": "Hisn al-Muslim — Tvrđava muslimana · Sa'id ibn Ali ibn Wahf el-Kahtani · cjelovit tekst",
 "ar": "حصن المسلم · سعيد بن علي بن وهف القحطاني · النص الكامل",
 "tr": "Hisnü'l-Müslim — Müslümanın Kalesi · Sa'îd b. Alî b. Vehf el-Kahtânî · tam metin",
 "fa": "حصن المسلم — دژ مسلمان · سعید بن علی بن وهف قحطانی · متن کامل",
 "ur": "حصن المسلم — مسلمان کا قلعہ · سعید بن علی بن وہف القحطانی · مکمل متن",
 "hi": "हिस्न अल-मुस्लिम — मुसलमान का क़िला · सईद बिन अली बिन वहफ़ अल-क़हतानी · पूर्ण पाठ",
 "bn": "হিসনুল মুসলিম — মুসলিমের দুর্গ · সাঈদ ইবনে আলী ইবনে ওয়াহফ আল-কাহতানী · পূর্ণ পাঠ",
 "id": "Hisnul Muslim — Benteng Seorang Muslim · Sa'id bin Ali bin Wahf al-Qahthani · teks lengkap",
 "ms": "Hisnul Muslim — Kubu Seorang Muslim · Sa'id bin Ali bin Wahf al-Qahtani · teks penuh",
 "zh": "《穆斯林的堡垒》· 赛义德·本·阿里·本·瓦赫夫·卡赫塔尼 · 全文",
 "ja": "ヒスヌル・ムスリム（ムスリムの砦）· サイード・イブン・アリー・イブン・ワフフ・アル＝カフターニー · 全文",
 "so": "Xisnul Muslim — Qalcadda Muslimka · Sacsiid bin Cali bin Wahf al-Qahtaani · qoraal buuxa",
 "sw": "Hisnul Muslim — Ngome ya Mwislamu · Said bin Ali bin Wahf al-Qahtani · maandishi kamili",
 "ha": "Hisnul Muslim — Kagarar Musulmi · Sa'id bin Ali bin Wahf al-Qahtani · cikakken rubutu",
},
"books.asmaNasheedA11y": {
 "fr": "Écouter l'anachid des 99 Noms", "en": "Play the 99 Names nasheed",
 "es": "Escuchar el nashid de los 99 Nombres",
 "ru": "Слушать нашид 99 имён", "bs": "Slušaj nešid 99 imena",
 "ar": "الاستماع إلى نشيد الأسماء الحسنى",
 "tr": "99 İsim ilahisini dinle", "fa": "شنیدن نشید ۹۹ نام",
 "ur": "99 ناموں کا نشید سنیں", "hi": "99 नामों का नशीद सुनें",
 "bn": "৯৯ নামের নাশিদ শুনুন", "id": "Dengarkan nasyid 99 Nama",
 "ms": "Dengar nasyid 99 Nama", "zh": "聆听九十九尊名颂唱",
 "ja": "99の御名のナシードを聴く", "so": "Dhagayso nashiidka 99 Magac",
 "sw": "Sikiliza nashidi ya Majina 99", "ha": "Saurari nashidar Sunaye 99",
},
"books.listenName": {
 "fr": "Écouter {name}", "en": "Play {name}", "es": "Escuchar {name}",
 "ru": "Слушать {name}", "bs": "Slušaj {name}", "ar": "الاستماع إلى {name}",
 "tr": "{name} dinle", "fa": "شنیدن {name}", "ur": "{name} سنیں",
 "hi": "{name} सुनें", "bn": "{name} শুনুন", "id": "Dengarkan {name}",
 "ms": "Dengar {name}", "zh": "聆听 {name}", "ja": "{name} を聴く",
 "so": "Dhagayso {name}", "sw": "Sikiliza {name}", "ha": "Saurari {name}",
},
"books.asmaNasheed": {
 "fr": "Anachid des 99 Noms", "en": "99 Names nasheed",
 "es": "Nashid de los 99 Nombres", "ru": "Нашид 99 имён",
 "bs": "Nešid 99 imena", "ar": "نشيد الأسماء الحسنى",
 "tr": "99 İsim ilahisi", "fa": "نشید ۹۹ نام", "ur": "99 ناموں کا نشید",
 "hi": "99 नामों का नशीद", "bn": "৯৯ নামের নাশিদ",
 "id": "Nasyid 99 Nama", "ms": "Nasyid 99 Nama",
 "zh": "九十九尊名颂唱", "ja": "99の御名のナシード",
 "so": "Nashiidka 99 Magac", "sw": "Nashidi ya Majina 99",
 "ha": "Nashidar Sunaye 99",
},
"books.asmaNasheedSub": {
 "fr": "Le chant en continu · récités dans l'ordre",
 "en": "Continuous recitation · in order",
 "es": "Canto continuo · recitados en orden",
 "ru": "Непрерывное чтение · по порядку",
 "bs": "Neprekidno učenje · redom",
 "ar": "إنشاد متواصل · بالترتيب",
 "tr": "Kesintisiz okuma · sırayla",
 "fa": "خوانش پیوسته · به ترتیب",
 "ur": "مسلسل خوانی · ترتیب سے",
 "hi": "निरंतर पाठ · क्रम से",
 "bn": "একটানা পাঠ · ক্রমানুসারে",
 "id": "Lantunan berkelanjutan · sesuai urutan",
 "ms": "Alunan berterusan · mengikut urutan",
 "zh": "连续吟诵 · 按序诵读",
 "ja": "連続再生 · 順番に唱えます",
 "so": "Akhris joogto ah · siday u kala horreeyaan",
 "sw": "Usomaji endelevu · kwa mpangilio",
 "ha": "Karatu mai ci gaba · bi da tsari",
},
"books.asmaNasheedFail": {
 "fr": "Anachid indisponible 🎧", "en": "Nasheed unavailable 🎧",
 "es": "Nashid no disponible 🎧", "ru": "Нашид недоступен 🎧",
 "bs": "Nešid nedostupan 🎧", "ar": "النشيد غير متاح 🎧",
 "tr": "İlahi kullanılamıyor 🎧", "fa": "نشید در دسترس نیست 🎧",
 "ur": "نشید دستیاب نہیں 🎧", "hi": "नशीद उपलब्ध नहीं 🎧",
 "bn": "নাশিদ পাওয়া যাচ্ছে না 🎧", "id": "Nasyid tidak tersedia 🎧",
 "ms": "Nasyid tidak tersedia 🎧", "zh": "颂唱不可用 🎧",
 "ja": "ナシードを再生できません 🎧", "so": "Nashiidku ma diyaar aha 🎧",
 "sw": "Nashidi haipatikani 🎧", "ha": "Nashida ba ta samuwa 🎧",
},
"books.asmaReflect": {
 "fr": "Invocation & introspection", "en": "Supplication & reflection",
 "es": "Súplica y reflexión", "ru": "Мольба и размышление",
 "bs": "Dova i promišljanje", "ar": "دعاء وتأمل",
 "tr": "Dua ve tefekkür", "fa": "دعا و تأمل", "ur": "دعا اور تدبر",
 "hi": "दुआ और चिंतन", "bn": "দোয়া ও অনুধ্যান",
 "id": "Doa & perenungan", "ms": "Doa & renungan",
 "zh": "祈祷与省思", "ja": "ドゥアーと内省",
 "so": "Duco iyo milicsi", "sw": "Dua na tafakuri",
 "ha": "Addu'a da tunani",
},

# ── Bascule arabe / phonetique ───────────────────────────────────────
# « abc » ne dit rien a qui ne lit pas l'alphabet latin : le bouton porte
# desormais le nom de l'ecriture vers laquelle il bascule.
"routines.toArabic": {
 "fr": "عربي", "en": "عربي", "es": "عربي", "ru": "عربي", "bs": "عربي",
 "ar": "عربي", "tr": "عربي", "fa": "عربی", "ur": "عربی", "hi": "عربي",
 "bn": "عربي", "id": "عربي", "ms": "عربي", "zh": "عربي", "ja": "عربي",
 "so": "عربي", "sw": "عربي", "ha": "عربي",
},
"routines.toPhonetic": {
 "fr": "abc", "en": "abc", "es": "abc", "bs": "abc", "id": "abc",
 "ms": "abc", "so": "abc", "sw": "abc", "ha": "abc", "tr": "abc",
 "ru": "абв", "ar": "نطق", "fa": "آوا", "ur": "نقل",
 "hi": "अआइ", "bn": "অআক", "zh": "拼音", "ja": "カナ",
},
}
