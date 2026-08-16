#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Reference de source des invocations, recomposee dans la langue lue.

Le nom de sourate vient de SURAH_NAMES ; il ne reste ici que la formule qui
l'entoure, le separateur, et les noms des recueils de hadiths. Ces derniers
sont des noms propres : dans une ecriture non latine ils sont translitteres,
pas traduits — un lecteur japonais ne lit pas « Bukhari ».
"""

LOTS = {

"duas.refQuran": {
 "fr": "Coran, {s} ({v})",
 "en": "Qur'an, {s} ({v})",
 "es": "Corán, {s} ({v})",
 "ru": "Коран, {s} ({v})",
 "bs": "Kur'an, {s} ({v})",
 "ar": "القرآن، {s} ({v})",
 "tr": "Kur'an, {s} ({v})",
 "fa": "قرآن، {s} ({v})",
 "ur": "قرآن، {s} ({v})",
 "hi": "क़ुरआन, {s} ({v})",
 "bn": "কুরআন, {s} ({v})",
 "id": "Al-Qur'an, {s} ({v})",
 "ms": "Al-Quran, {s} ({v})",
 "zh": "《古兰经》{s}（{v}）",
 "ja": "クルアーン {s}（{v}）",
 "so": "Quraanka, {s} ({v})",
 "sw": "Qur'ani, {s} ({v})",
 "ha": "Alqur'ani, {s} ({v})",
},

# Separe deux references. Les ecritures CJK n'aiment pas l'espace autour
# des signes : on garde leur propre ponctuation d'enumeration.
"duas.refSep": {
 "fr": " · ", "en": " · ", "es": " · ", "ru": " · ", "bs": " · ",
 "ar": " · ", "tr": " · ", "fa": " · ", "ur": " · ", "hi": " · ",
 "bn": " · ", "id": " · ", "ms": " · ", "zh": "、", "ja": "・",
 "so": " · ", "sw": " · ", "ha": " · ",
},

# Un verset que l'on recite a cet endroit precis : le recueil atteste
# l'usage, il n'est pas la source du verset.
#
# Le nom du recueil arrive par {src} et ne peut donc pas se decliner. En
# russe « согласно Абу Дауд » resterait au nominatif, en arabe « وفق أبو داود »
# de meme : on tourne la phrase en apposition, ou le nom reste invariable.
"duas.refRecited": {
 "fr": "récité là — source : {src}",
 "en": "recited there — source: {src}",
 "es": "recitado allí — fuente: {src}",
 "ru": "читается там — источник: {src}",
 "bs": "uči se ondje — izvor: {src}",
 "ar": "يُقرأ هناك — المصدر: {src}",
 "tr": "orada okunur — kaynak: {src}",
 "fa": "در آنجا خوانده می‌شود — منبع: {src}",
 "ur": "وہاں پڑھی جاتی ہے — ماخذ: {src}",
 "hi": "वहाँ पढ़ी जाती है — स्रोत: {src}",
 "bn": "সেখানে পড়া হয় — সূত্র: {src}",
 "id": "dibaca di sana — sumber: {src}",
 "ms": "dibaca di situ — sumber: {src}",
 "zh": "于此处诵读——出处：{src}",
 "ja": "その場で唱える — 出典：{src}",
 "so": "halkaas lagu akhriyo — isha: {src}",
 "sw": "husomwa hapo — chanzo: {src}",
 "ha": "ana karanta a wurin — tushe: {src}",
},

# ── Recueils de hadiths ──────────────────────────────────────────────
"hds.bukhari": {
 "fr": "Bukhari", "en": "Bukhari", "es": "Bujari", "bs": "Buharija",
 "id": "Bukhari", "ms": "Bukhari", "so": "Bukhaari", "sw": "Bukhari",
 "ha": "Bukhari", "tr": "Buhârî",
 "ru": "аль-Бухари", "ar": "البخاري", "fa": "بخاری", "ur": "بخاری",
 "hi": "बुख़ारी", "bn": "বুখারী", "zh": "布哈里", "ja": "ブハーリー",
},
"hds.muslim": {
 "fr": "Muslim", "en": "Muslim", "es": "Muslim", "bs": "Muslim",
 "id": "Muslim", "ms": "Muslim", "so": "Muslim", "sw": "Muslim",
 "ha": "Muslim", "tr": "Müslim",
 "ru": "Муслим", "ar": "مسلم", "fa": "مسلم", "ur": "مسلم",
 "hi": "मुस्लिम", "bn": "মুসলিম", "zh": "穆斯林", "ja": "ムスリム",
},
"hds.abudawud": {
 "fr": "Abu Dawud", "en": "Abu Dawud", "es": "Abu Dawud", "bs": "Ebu Davud",
 "id": "Abu Dawud", "ms": "Abu Dawud", "so": "Abu Daawuud",
 "sw": "Abu Daud", "ha": "Abu Dawud", "tr": "Ebû Dâvûd",
 "ru": "Абу Дауд", "ar": "أبو داود", "fa": "ابوداود", "ur": "ابو داؤد",
 "hi": "अबू दाऊद", "bn": "আবু দাউদ", "zh": "艾布·达乌德",
 "ja": "アブー・ダーウード",
},
"hds.tirmidhi": {
 "fr": "Tirmidhi", "en": "Tirmidhi", "es": "Tirmidi", "bs": "Tirmizija",
 "id": "Tirmidzi", "ms": "Tirmizi", "so": "Tirmidi", "sw": "Tirmidhi",
 "ha": "Tirmizi", "tr": "Tirmizî",
 "ru": "ат-Тирмизи", "ar": "الترمذي", "fa": "ترمذی", "ur": "ترمذی",
 "hi": "तिर्मिज़ी", "bn": "তিরমিযী", "zh": "提尔米基",
 "ja": "ティルミズィー",
},
"hds.ibnmajah": {
 "fr": "Ibn Maja", "en": "Ibn Majah", "es": "Ibn Maya", "bs": "Ibn Madže",
 "id": "Ibnu Majah", "ms": "Ibnu Majah", "so": "Ibnu Maajah",
 "sw": "Ibn Majah", "ha": "Ibn Majah", "tr": "İbn Mâce",
 "ru": "Ибн Маджа", "ar": "ابن ماجه", "fa": "ابن‌ماجه", "ur": "ابن ماجہ",
 "hi": "इब्न माजा", "bn": "ইবনু মাজাহ", "zh": "伊本·马哲",
 "ja": "イブン・マージャ",
},
"hds.ibnhibban": {
 "fr": "Ibn Hibban", "en": "Ibn Hibban", "es": "Ibn Hibban",
 "bs": "Ibn Hibban", "id": "Ibnu Hibban", "ms": "Ibnu Hibban",
 "so": "Ibnu Xibbaan", "sw": "Ibn Hibban", "ha": "Ibn Hibban",
 "tr": "İbn Hibbân",
 "ru": "Ибн Хиббан", "ar": "ابن حبان", "fa": "ابن‌حبان",
 "ur": "ابن حبان", "hi": "इब्न हिब्बान", "bn": "ইবনু হিব্বান",
 "zh": "伊本·希班", "ja": "イブン・ヒッバーン",
},
"hds.ibnabishayba": {
 "fr": "Ibn Abi Chayba", "en": "Ibn Abi Shaybah", "es": "Ibn Abi Shayba",
 "bs": "Ibn Ebi Šejbe", "id": "Ibnu Abi Syaibah", "ms": "Ibnu Abi Syaibah",
 "so": "Ibnu Abi Shayba", "sw": "Ibn Abi Shayba", "ha": "Ibn Abi Shaiba",
 "tr": "İbn Ebî Şeybe",
 "ru": "Ибн Аби Шайба", "ar": "ابن أبي شيبة", "fa": "ابن ابی‌شیبه",
 "ur": "ابن ابی شیبہ", "hi": "इब्न अबी शैबा", "bn": "ইবনু আবী শাইবা",
 "zh": "伊本·艾比·舍伊拜", "ja": "イブン・アビー・シャイバ",
},
"hds.bayhaqi": {
 "fr": "al-Bayhaqi", "en": "al-Bayhaqi", "es": "al-Baihaqi",
 "bs": "Bejheki", "id": "al-Baihaqi", "ms": "al-Baihaqi",
 "so": "al-Bayhaqi", "sw": "al-Bayhaqi", "ha": "al-Baihaqi",
 "tr": "Beyhakî",
 "ru": "аль-Байхаки", "ar": "البيهقي", "fa": "بیهقی", "ur": "بیہقی",
 "hi": "अल-बैहक़ी", "bn": "আল-বাইহাকী", "zh": "白哈基",
 "ja": "バイハキー",
},
}
