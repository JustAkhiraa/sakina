#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Noms de methodes de calcul restes hors dictionnaire.

Neuf des quatorze methodes avaient une cle de nom, treize sur quatorze une
cle de description. Les cinq manquantes portaient toutes un nom de pays
ecrit en francais ou en anglais — « UOIF (France 12°) » s'affichait tel quel
sous une interface japonaise.

Deux des cinq n'ont besoin d'aucune cle : « ISNA » est un sigle et
« MoonsightingCommittee.com » un nom de domaine, justes dans toutes les
langues. Les ecrire dix-huit fois serait du bruit a maintenir. Le sigle des
trois autres reste tel quel — c'est ainsi que ces organismes se nomment —,
seul le pays entre parentheses change de langue.
"""

LOTS = {

"cm.12.n": {
 "fr": "UOIF (France 12°)",   "en": "UOIF (France 12°)",
 "es": "UOIF (Francia 12°)",  "ru": "UOIF (Франция 12°)",
 "bs": "UOIF (Francuska 12°)","ar": "UOIF (فرنسا 12°)",
 "tr": "UOIF (Fransa 12°)",   "fa": "UOIF (فرانسه ۱۲°)",
 "ur": "UOIF (فرانس 12°)",    "hi": "UOIF (फ़्रांस 12°)",
 "bn": "UOIF (ফ্রান্স ১২°)",     "id": "UOIF (Prancis 12°)",
 "ms": "UOIF (Perancis 12°)", "zh": "UOIF（法国 12°）",
 "ja": "UOIF（フランス 12°）",  "so": "UOIF (Faransiiska 12°)",
 "sw": "UOIF (Ufaransa 12°)", "ha": "UOIF (Faransa 12°)",
},

"cm.13.n": {
 "fr": "Diyanet (Türkiye)",   "en": "Diyanet (Türkiye)",
 "es": "Diyanet (Turquía)",   "ru": "Диянет (Турция)",
 "bs": "Dijanet (Turska)",    "ar": "ديانت (تركيا)",
 "tr": "Diyanet (Türkiye)",   "fa": "دیانت (ترکیه)",
 "ur": "دیانت (ترکیہ)",        "hi": "दियानत (तुर्किये)",
 "bn": "দিয়ানত (তুরস্ক)",       "id": "Diyanet (Türkiye)",
 "ms": "Diyanet (Türkiye)",   "zh": "迪亚内特（土耳其）",
 "ja": "ディヤーネット（トルコ）", "so": "Diyanet (Turkiga)",
 "sw": "Diyanet (Uturuki)",   "ha": "Diyanet (Turkiyya)",
},

"cm.20.n": {
 "fr": "Kemenag (Indonésie)", "en": "Kemenag (Indonesia)",
 "es": "Kemenag (Indonesia)", "ru": "Кеменаг (Индонезия)",
 "bs": "Kemenag (Indonezija)","ar": "كمناغ (إندونيسيا)",
 "tr": "Kemenag (Endonezya)", "fa": "کمناگ (اندونزی)",
 "ur": "کیمیناگ (انڈونیشیا)",   "hi": "केमेनाग (इंडोनेशिया)",
 "bn": "কেমেনাগ (ইন্দোনেশিয়া)",  "id": "Kemenag (Indonesia)",
 "ms": "Kemenag (Indonesia)", "zh": "Kemenag（印度尼西亚）",
 "ja": "ケメナグ（インドネシア）","so": "Kemenag (Indoneesiya)",
 "sw": "Kemenag (Indonesia)", "ha": "Kemenag (Indonesiya)",
},

"cm.17.n": {
 "fr": "JAKIM (Malaisie)",    "en": "JAKIM (Malaysia)",
 "es": "JAKIM (Malasia)",     "ru": "JAKIM (Малайзия)",
 "bs": "JAKIM (Malezija)",    "ar": "JAKIM (ماليزيا)",
 "tr": "JAKIM (Malezya)",     "fa": "JAKIM (مالزی)",
 "ur": "JAKIM (ملیشیا)",       "hi": "JAKIM (मलेशिया)",
 "bn": "JAKIM (মালয়েশিয়া)",    "id": "JAKIM (Malaysia)",
 "ms": "JAKIM (Malaysia)",    "zh": "JAKIM（马来西亚）",
 "ja": "JAKIM（マレーシア）",    "so": "JAKIM (Maleeshiya)",
 "sw": "JAKIM (Malesia)",     "ha": "JAKIM (Malaysiya)",
},
}
