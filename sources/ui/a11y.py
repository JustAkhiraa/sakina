#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Libelles d'accessibilite et infobulles.

Ils ne se voient pas, ce qui est precisement pourquoi ils avaient echappe a
toutes les passes de traduction : un lecteur d'ecran annoncait « Réglages »
en francais quelle que soit la langue de l'interface.
"""

LOTS = {
"a11y.history": {
 "fr": "Historique", "en": "History", "es": "Historial", "ru": "История",
 "bs": "Historija", "ar": "السجل", "tr": "Geçmiş", "fa": "تاریخچه",
 "ur": "تاریخ", "hi": "इतिहास", "bn": "ইতিহাস", "id": "Riwayat",
 "ms": "Sejarah", "zh": "历史记录", "ja": "履歴", "so": "Taariikhda",
 "sw": "Historia", "ha": "Tarihi",
},
"a11y.configure": {
 "fr": "Configurer", "en": "Configure", "es": "Configurar",
 "ru": "Настроить", "bs": "Podesi", "ar": "إعداد", "tr": "Yapılandır",
 "fa": "پیکربندی", "ur": "ترتیب دیں", "hi": "कॉन्फ़िगर करें",
 "bn": "কনফিগার করুন", "id": "Konfigurasikan", "ms": "Konfigurkan",
 "zh": "设置", "ja": "設定する", "so": "Habee", "sw": "Sanidi",
 "ha": "Saita",
},
"a11y.locate": {
 "fr": "Me localiser", "en": "Locate me", "es": "Ubicarme",
 "ru": "Определить моё местоположение", "bs": "Locirajme",
 "ar": "تحديد موقعي", "tr": "Konumumu bul", "fa": "مکان‌یابی من",
 "ur": "میرا مقام معلوم کریں", "hi": "मेरा स्थान पता करें",
 "bn": "আমার অবস্থান নির্ণয়", "id": "Temukan lokasi saya",
 "ms": "Cari lokasi saya", "zh": "定位我", "ja": "現在地を取得",
 "so": "I raadi", "sw": "Nitafute", "ha": "Nemo wurina",
},
"a11y.recompute": {
 "fr": "Recalculer", "en": "Recalculate", "es": "Recalcular",
 "ru": "Пересчитать", "bs": "Preračunaj", "ar": "إعادة الحساب",
 "tr": "Yeniden hesapla", "fa": "محاسبهٔ دوباره", "ur": "دوبارہ حساب کریں",
 "hi": "फिर से गणना करें", "bn": "পুনরায় গণনা", "id": "Hitung ulang",
 "ms": "Kira semula", "zh": "重新计算", "ja": "再計算",
 "so": "Dib u xisaabi", "sw": "Kokotoa upya", "ha": "Sake lissafi",
},
"a11y.search": {
 "fr": "Rechercher", "en": "Search", "es": "Buscar", "ru": "Поиск",
 "bs": "Pretraga", "ar": "بحث", "tr": "Ara", "fa": "جست‌وجو",
 "ur": "تلاش", "hi": "खोजें", "bn": "খুঁজুন", "id": "Cari",
 "ms": "Cari", "zh": "搜索", "ja": "検索", "so": "Raadi",
 "sw": "Tafuta", "ha": "Bincika",
},
"a11y.surahList": {
 "fr": "Liste des sourates", "en": "Surah list", "es": "Lista de suras",
 "ru": "Список сур", "bs": "Popis sura", "ar": "قائمة السور",
 "tr": "Sûre listesi", "fa": "فهرست سوره‌ها", "ur": "سورتوں کی فہرست",
 "hi": "सूरतों की सूची", "bn": "সূরার তালিকা", "id": "Daftar surah",
 "ms": "Senarai surah", "zh": "章目列表", "ja": "章の一覧",
 "so": "Liiska suuradaha", "sw": "Orodha ya sura", "ha": "Jerin surori",
},
"a11y.favNotes": {
 "fr": "Favoris et notes", "en": "Favourites and notes",
 "es": "Favoritos y notas", "ru": "Избранное и заметки",
 "bs": "Favoriti i bilješke", "ar": "المفضلة والملاحظات",
 "tr": "Sık kullanılanlar ve notlar", "fa": "برگزیده‌ها و یادداشت‌ها",
 "ur": "پسندیدہ اور نوٹس", "hi": "पसंदीदा और टिप्पणियाँ",
 "bn": "প্রিয় ও নোট", "id": "Favorit dan catatan",
 "ms": "Kegemaran dan nota", "zh": "收藏与笔记", "ja": "お気に入りとメモ",
 "so": "Kuwa la jecel yahay iyo qoraallada", "sw": "Vipendwa na madokezo",
 "ha": "Abubuwan so da bayanan kula",
},
"a11y.settings": {
 "fr": "Réglages", "en": "Settings", "es": "Ajustes", "ru": "Настройки",
 "bs": "Postavke", "ar": "الإعدادات", "tr": "Ayarlar", "fa": "تنظیمات",
 "ur": "ترتیبات", "hi": "सेटिंग्स", "bn": "সেটিংস",
 "id": "Pengaturan", "ms": "Tetapan", "zh": "设置", "ja": "設定",
 "so": "Dejinta", "sw": "Mipangilio", "ha": "Saituna",
},
"a11y.back": {
 "fr": "Retour", "en": "Back", "es": "Atrás", "ru": "Назад",
 "bs": "Nazad", "ar": "رجوع", "tr": "Geri", "fa": "بازگشت",
 "ur": "واپس", "hi": "वापस", "bn": "ফিরে যান", "id": "Kembali",
 "ms": "Kembali", "zh": "返回", "ja": "戻る", "so": "Dib u noqo",
 "sw": "Rudi", "ha": "Koma",
},
"a11y.toggleTranslit": {
 "fr": "Basculer arabe / phonétique",
 "en": "Switch Arabic / transliteration",
 "es": "Alternar árabe / transliteración",
 "ru": "Переключить арабский / транслитерацию",
 "bs": "Prebaci arapski / transliteraciju",
 "ar": "التبديل بين العربية والنطق",
 "tr": "Arapça / okunuş arasında geçiş",
 "fa": "جابه‌جایی میان عربی و آوانویسی",
 "ur": "عربی / نقل حرفی کے درمیان تبدیلی",
 "hi": "अरबी / लिप्यंतरण बदलें",
 "bn": "আরবি / প্রতিবর্ণীকরণ বদল",
 "id": "Alihkan Arab / transliterasi",
 "ms": "Tukar Arab / transliterasi",
 "zh": "切换阿拉伯文／音译",
 "ja": "アラビア語と音写を切り替え",
 "so": "U beddel Carabi / higgaadin",
 "sw": "Badilisha Kiarabu / matamshi",
 "ha": "Sauya Larabci / rubutun furuci",
},
}
