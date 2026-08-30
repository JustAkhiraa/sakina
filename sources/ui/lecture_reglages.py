#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Deux fuites decouvertes en elargissant le detecteur.

Ni l'une ni l'autre n'etait visible avant : le detecteur ne connaissait pas
les mots « verset » et « page », et son retrait des interpolations ne gerait
qu'un niveau d'imbrication.

  · la pastille de lecture audio affichait « ▶ Al-Fatiha · verset 3 » ;
  · changer la page d'ouverture annoncait « Page d'ouverture : Tasbih ».
"""

LOTS = {

"quran.playingRef": {
 "fr": "{name} · verset {a}",
 "en": "{name} · verse {a}",
 "es": "{name} · versículo {a}",
 "ru": "{name} · аят {a}",
 "bs": "{name} · ajet {a}",
 "ar": "{name} · آية {a}",
 "tr": "{name} · âyet {a}",
 "fa": "{name} · آیهٔ {a}",
 "ur": "{name} · آیت {a}",
 "hi": "{name} · आयत {a}",
 "bn": "{name} · আয়াত {a}",
 "id": "{name} · ayat {a}",
 "ms": "{name} · ayat {a}",
 "zh": "{name} · 第 {a} 节",
 "ja": "{name} · 第{a}節",
 "so": "{name} · aayad {a}",
 "sw": "{name} · aya {a}",
 "ha": "{name} · aya {a}",
},

"set.startPageIs": {
 "fr": "Page d'ouverture : {name}",
 "en": "Start page: {name}",
 "es": "Página de inicio: {name}",
 "ru": "Стартовая страница: {name}",
 "bs": "Početna stranica: {name}",
 "ar": "صفحة البدء: {name}",
 "tr": "Açılış sayfası: {name}",
 "fa": "صفحهٔ آغاز: {name}",
 "ur": "ابتدائی صفحہ: {name}",
 "hi": "आरंभिक पृष्ठ: {name}",
 "bn": "শুরুর পাতা: {name}",
 "id": "Halaman awal: {name}",
 "ms": "Halaman mula: {name}",
 "zh": "启动页面：{name}",
 "ja": "起動時のページ：{name}",
 "so": "Bogga bilowga: {name}",
 "sw": "Ukurasa wa kuanza: {name}",
 "ha": "Shafin farawa: {name}",
},
}
