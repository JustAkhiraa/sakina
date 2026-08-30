#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Reperes de lecture du Coran, et suppression d'une note.

« Sourate 49, Verset 3 », « Note — S.49:5 » et « Juz' 1 » etaient ecrits en
dur dans js/features/quran.js. Ils apparaissaient tels quels sous une
interface japonaise — dans les favoris, dans les notes, sur les trente
onglets de navigation.

Le detecteur ne les avait pas vus : ce sont des fragments de gabarit
(« Sourate », « Verset ») dont les mots ne figuraient pas dans sa liste.

« Juz' » et « Sourate » ne se traduisent pas partout de la meme facon : les
langues qui ont repris le terme arabe le gardent (juz, cüz, джуз), les
autres emploient leur mot propre.
"""

LOTS = {

"quran.ayahRef": {
 "fr": "Sourate {s}, Verset {a}",
 "en": "Surah {s}, Verse {a}",
 "es": "Sura {s}, Versículo {a}",
 "ru": "Сура {s}, аят {a}",
 "bs": "Sura {s}, ajet {a}",
 "ar": "سورة {s}، آية {a}",
 "tr": "Sûre {s}, Âyet {a}",
 "fa": "سورهٔ {s}، آیهٔ {a}",
 "ur": "سورہ {s}، آیت {a}",
 "hi": "सूरा {s}, आयत {a}",
 "bn": "সূরা {s}, আয়াত {a}",
 "id": "Surah {s}, Ayat {a}",
 "ms": "Surah {s}, Ayat {a}",
 "zh": "第 {s} 章，第 {a} 节",
 "ja": "第{s}章 第{a}節",
 "so": "Suurad {s}, Aayad {a}",
 "sw": "Sura {s}, Aya {a}",
 "ha": "Sura {s}, Aya {a}",
},

"quran.noteTitle": {
 "fr": "Note — S.{s}:{a}",
 "en": "Note — S.{s}:{a}",
 "es": "Nota — S.{s}:{a}",
 "ru": "Заметка — {s}:{a}",
 "bs": "Bilješka — {s}:{a}",
 "ar": "ملاحظة — {s}:{a}",
 "tr": "Not — {s}:{a}",
 "fa": "یادداشت — {s}:{a}",
 "ur": "نوٹ — {s}:{a}",
 "hi": "टिप्पणी — {s}:{a}",
 "bn": "নোট — {s}:{a}",
 "id": "Catatan — {s}:{a}",
 "ms": "Nota — {s}:{a}",
 "zh": "笔记 — {s}:{a}",
 "ja": "メモ — {s}:{a}",
 "so": "Qoraal — {s}:{a}",
 "sw": "Dokezo — {s}:{a}",
 "ha": "Bayani — {s}:{a}",
},

"quran.juz": {
 "fr": "Juz' {n}", "en": "Juz' {n}", "es": "Yuz {n}",
 "ru": "Джуз {n}", "bs": "Džuz {n}", "ar": "الجزء {n}",
 "tr": "Cüz {n}", "fa": "جزء {n}", "ur": "پارہ {n}",
 "hi": "जुज़ {n}", "bn": "জুজ {n}", "id": "Juz {n}",
 "ms": "Juzuk {n}", "zh": "第 {n} 卷", "ja": "第{n}ジュズ",
 "so": "Juz {n}", "sw": "Juzuu {n}", "ha": "Juzu'i {n}",
},

"quran.noteDelete": {
 "fr": "Supprimer la note", "en": "Delete note", "es": "Eliminar la nota",
 "ru": "Удалить заметку", "bs": "Obriši bilješku", "ar": "حذف الملاحظة",
 "tr": "Notu sil", "fa": "حذف یادداشت", "ur": "نوٹ حذف کریں",
 "hi": "टिप्पणी हटाएँ", "bn": "নোট মুছুন", "id": "Hapus catatan",
 "ms": "Padam nota", "zh": "删除笔记", "ja": "メモを削除",
 "so": "Tirtir qoraalka", "sw": "Futa dokezo", "ha": "Share bayani",
},

"quran.noteDelAsk": {
 "fr": "Supprimer cette note ?",
 "en": "Delete this note?",
 "es": "¿Eliminar esta nota?",
 "ru": "Удалить эту заметку?",
 "bs": "Obrisati ovu bilješku?",
 "ar": "هل تحذف هذه الملاحظة؟",
 "tr": "Bu not silinsin mi?",
 "fa": "این یادداشت حذف شود؟",
 "ur": "کیا یہ نوٹ حذف کر دیا جائے؟",
 "hi": "क्या यह टिप्पणी हटाएँ?",
 "bn": "এই নোটটি মুছবেন?",
 "id": "Hapus catatan ini?",
 "ms": "Padam nota ini?",
 "zh": "删除这条笔记？",
 "ja": "このメモを削除しますか？",
 "so": "Ma tirtiraysaa qoraalkan?",
 "sw": "Ufute dokezo hili?",
 "ha": "A share wannan bayanin?",
},

"quran.noteDelOk": {
 "fr": "Supprimer", "en": "Delete", "es": "Eliminar", "ru": "Удалить",
 "bs": "Obriši", "ar": "حذف", "tr": "Sil", "fa": "حذف",
 "ur": "حذف کریں", "hi": "हटाएँ", "bn": "মুছুন", "id": "Hapus",
 "ms": "Padam", "zh": "删除", "ja": "削除", "so": "Tirtir",
 "sw": "Futa", "ha": "Share",
},

"quran.copyFail": {
 "fr": "Copie impossible", "en": "Copy failed", "es": "No se pudo copiar",
 "ru": "Не удалось скопировать", "bs": "Kopiranje nije uspjelo",
 "ar": "تعذّر النسخ", "tr": "Kopyalanamadı", "fa": "رونوشت ناموفق",
 "ur": "نقل نہ ہو سکی", "hi": "कॉपी नहीं हो सका",
 "bn": "কপি করা যায়নি", "id": "Gagal menyalin", "ms": "Gagal menyalin",
 "zh": "复制失败", "ja": "コピーできません", "so": "Nuqul lama sameyn karo",
 "sw": "Imeshindwa kunakili", "ha": "Kwafi bai yiwu ba",
},
}
