#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Deux noms de theme restes en alphabet latin.

Sous une interface japonaise, la liste des recompenses affichait
« レトロCRT » et « AMOLED » au milieu de noms traduits — alors que la
description du meme theme, juste en dessous, dit deja « ブラウン管 ».

Le chinois et l'arabe localisaient deja (复古显像管, شاشة قديمة). On aligne
les autres ecritures non latines. La ou le sigle *est* l'usage local — le
turc, l'anglais, l'espagnol ecrivent AMOLED et CRT — on ne touche a rien :
traduire un sigle que personne n'emploie serait le rendre moins lisible.

    python scripts/i18n_add.py sources/ui/themes_ecrans.py --remplace
"""

LOTS = {

# AMOLED : « 有機EL » est le mot japonais courant pour ce type d'ecran ;
# ailleurs le sigle reste l'usage, y compris en russe et en chinois.
"bth.amoled": {
 "ja": "有機EL",
},

# CRT : chaque ecriture a son terme ou sa transcription.
"skn.crt": {
 "ja": "レトロブラウン管",
 "ru": "Ретро-ЭЛТ",
 "hi": "रेट्रो सीआरटी",
 "bn": "রেট্রো সিআরটি",
 "ur": "ریٹرو سی آر ٹی",
 "fa": "سی‌آر‌تی قدیمی",
},
}
