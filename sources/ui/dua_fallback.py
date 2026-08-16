#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Infobulle de l'etiquette de langue posee sur une invocation.

Aucune edition publiee de Hisn al-Muslim ne couvre les vingt-huit invocations
dans les dix-sept langues : quatre d'entre elles n'existent dans aucune, deux
ne relevent meme pas du recueil. Une liste peut donc melanger trois langues.
Le melange est assume — on ne fabrique pas une traduction —, mais il doit se
lire comme un choix et non comme un oubli.
"""

LOTS = {
"duas.langFallback": {
 "fr": "Traduction publiée en {lang} — aucune édition dans votre langue pour cette invocation.",
 "en": "Published translation in {lang} — no edition in your language for this supplication.",
 "es": "Traducción publicada en {lang}: no hay edición en su idioma para esta súplica.",
 "ru": "Опубликованный перевод на {lang} — издания на вашем языке для этой мольбы нет.",
 "bs": "Objavljeni prijevod na {lang} — za ovu dovu nema izdanja na vašem jeziku.",
 "ar": "ترجمة منشورة بـ{lang} — لا توجد طبعة بلغتك لهذا الدعاء.",
 "tr": "{lang} dilinde yayımlanmış çeviri — bu dua için kendi dilinizde bir baskı yok.",
 "fa": "ترجمهٔ منتشرشده به {lang} — برای این دعا نسخه‌ای به زبان شما موجود نیست.",
 "ur": "{lang} میں شائع شدہ ترجمہ — اس دعا کے لیے آپ کی زبان میں کوئی ایڈیشن نہیں۔",
 "hi": "{lang} में प्रकाशित अनुवाद — इस दुआ के लिए आपकी भाषा में कोई संस्करण नहीं है।",
 "bn": "{lang}-এ প্রকাশিত অনুবাদ — এই দোয়ার জন্য আপনার ভাষায় কোনো সংস্করণ নেই।",
 "id": "Terjemahan terbitan berbahasa {lang} — belum ada edisi dalam bahasa Anda untuk doa ini.",
 "ms": "Terjemahan terbitan dalam bahasa {lang} — tiada edisi dalam bahasa anda bagi doa ini.",
 "zh": "{lang}版已出版译文——本祈祷词尚无您所用语言的版本。",
 "ja": "{lang}の刊行訳です。このドゥアーにはお使いの言語の版がありません。",
 "so": "Turjumaad la daabacay oo {lang} ah — daabacaad afkaaga ah oo ducadan ah ma jirto.",
 "sw": "Tafsiri iliyochapishwa kwa {lang} — hakuna toleo katika lugha yako kwa dua hii.",
 "ha": "Fassarar da aka buga da {lang} — babu bugu a harshenka don wannan addu'ar.",
},
}
