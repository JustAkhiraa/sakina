#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Serie d'invocations composee, et mode lecture du Coran.

Deux ajouts demandes. Aucun des deux n'invente de mecanisme : la serie
reutilise le lecteur de routines, le mode lecture redefinit les jetons de
couleur sur la page.

« Serie » est rendu par le mot qui, dans chaque langue, dit une suite qu'on
parcourt dans l'ordre — pas une collection.
"""

LOTS = {

"serie.row": {
 "fr": "Ma série d'invocations", "en": "My dua series",
 "es": "Mi serie de súplicas", "ru": "Моя серия мольб",
 "bs": "Moj niz dova", "ar": "سلسلتي من الأدعية",
 "tr": "Dua dizim", "fa": "زنجیرهٔ دعاهای من",
 "ur": "میری دعاؤں کا سلسلہ", "hi": "मेरी दुआओं की श्रृंखला",
 "bn": "আমার দোয়ার ধারা", "id": "Rangkaian doa saya",
 "ms": "Rangkaian doa saya", "zh": "我的祈祷序列",
 "ja": "わたしのドゥアー集", "so": "Taxanaha ducooyinkayga",
 "sw": "Mfululizo wangu wa dua", "ha": "Jerin addu'o'ina",
},

"serie.rowSub": {
 "fr": "Choisissez vos douas — elles s'enchaînent une par une",
 "en": "Pick your duas — they follow one after another",
 "es": "Elija sus súplicas — se encadenan una tras otra",
 "ru": "Выберите мольбы — они пойдут одна за другой",
 "bs": "Odaberite dove — nižu se jedna za drugom",
 "ar": "اختر أدعيتك — تتوالى واحداً تلو الآخر",
 "tr": "Dualarınızı seçin — biri bitince diğeri gelir",
 "fa": "دعاهایتان را برگزینید — یکی پس از دیگری می‌آیند",
 "ur": "اپنی دعائیں چنیں — ایک کے بعد ایک آتی جائیں گی",
 "hi": "अपनी दुआएँ चुनें — एक के बाद एक आती जाएँगी",
 "bn": "আপনার দোয়া বাছুন — একের পর এক আসবে",
 "id": "Pilih doa Anda — muncul satu demi satu",
 "ms": "Pilih doa anda — muncul satu demi satu",
 "zh": "选择你的祈祷 —— 依次逐条呈现",
 "ja": "ドゥアーを選ぶと、一つずつ順に進みます",
 "so": "Dooro ducooyinkaaga — mid mid ayay u kala dambeeyaan",
 "sw": "Chagua dua zako — zitafuatana moja baada ya nyingine",
 "ha": "Zaɓi addu'o'inka — za su bi juna ɗaya bayan ɗaya",
},

"serie.title": {
 "fr": "Ma série", "en": "My series", "es": "Mi serie", "ru": "Моя серия",
 "bs": "Moj niz", "ar": "سلسلتي", "tr": "Dizim", "fa": "زنجیرهٔ من",
 "ur": "میرا سلسلہ", "hi": "मेरी श्रृंखला", "bn": "আমার ধারা",
 "id": "Rangkaian saya", "ms": "Rangkaian saya", "zh": "我的序列",
 "ja": "わたしの集", "so": "Taxankayga", "sw": "Mfululizo wangu",
 "ha": "Jerina",
},

"serie.count": {
 "fr": "{n} invocation(s)", "en": "{n} dua(s)", "es": "{n} súplica(s)",
 "ru": "мольб: {n}", "bs": "dova: {n}", "ar": "{n} دعاء",
 "tr": "{n} dua", "fa": "{n} دعا", "ur": "{n} دعائیں",
 "hi": "{n} दुआएँ", "bn": "{n}টি দোয়া", "id": "{n} doa",
 "ms": "{n} doa", "zh": "{n} 条祈祷", "ja": "{n}件のドゥアー",
 "so": "{n} duco", "sw": "dua {n}", "ha": "addu'o'i {n}",
},

"serie.start": {
 "fr": "✦ Lancer la série", "en": "✦ Start the series",
 "es": "✦ Iniciar la serie", "ru": "✦ Начать серию",
 "bs": "✦ Pokreni niz", "ar": "✦ ابدأ السلسلة",
 "tr": "✦ Diziyi başlat", "fa": "✦ آغاز زنجیره",
 "ur": "✦ سلسلہ شروع کریں", "hi": "✦ श्रृंखला शुरू करें",
 "bn": "✦ ধারা শুরু করুন", "id": "✦ Mulai rangkaian",
 "ms": "✦ Mulakan rangkaian", "zh": "✦ 开始序列",
 "ja": "✦ はじめる", "so": "✦ Bilow taxanaha",
 "sw": "✦ Anza mfululizo", "ha": "✦ Fara jerin",
},

"serie.clear": {
 "fr": "Vider la série", "en": "Clear the series", "es": "Vaciar la serie",
 "ru": "Очистить серию", "bs": "Isprazni niz", "ar": "إفراغ السلسلة",
 "tr": "Diziyi temizle", "fa": "خالی‌کردن زنجیره", "ur": "سلسلہ خالی کریں",
 "hi": "श्रृंखला खाली करें", "bn": "ধারা খালি করুন", "id": "Kosongkan rangkaian",
 "ms": "Kosongkan rangkaian", "zh": "清空序列", "ja": "集を空にする",
 "so": "Nadiifi taxanaha", "sw": "Ondoa zote", "ha": "Share jerin",
},

"serie.empty": {
 "fr": "Choisissez au moins une invocation",
 "en": "Pick at least one dua",
 "es": "Elija al menos una súplica",
 "ru": "Выберите хотя бы одну мольбу",
 "bs": "Odaberite barem jednu dovu",
 "ar": "اختر دعاءً واحداً على الأقل",
 "tr": "En az bir dua seçin",
 "fa": "دست‌کم یک دعا برگزینید",
 "ur": "کم از کم ایک دعا چنیں",
 "hi": "कम से कम एक दुआ चुनें",
 "bn": "অন্তত একটি দোয়া বাছুন",
 "id": "Pilih setidaknya satu doa",
 "ms": "Pilih sekurang-kurangnya satu doa",
 "zh": "请至少选择一条祈祷",
 "ja": "ドゥアーを一つ以上選んでください",
 "so": "Ugu yaraan hal duco dooro",
 "sw": "Chagua angalau dua moja",
 "ha": "Zaɓi aƙalla addu'a ɗaya",
},

"quran.readingMode": {
 "fr": "Mode lecture", "en": "Reading mode", "es": "Modo lectura",
 "ru": "Режим чтения", "bs": "Način čitanja", "ar": "وضع القراءة",
 "tr": "Okuma modu", "fa": "حالت مطالعه", "ur": "مطالعہ موڈ",
 "hi": "पठन मोड", "bn": "পাঠ মোড", "id": "Mode baca",
 "ms": "Mod bacaan", "zh": "阅读模式", "ja": "読書モード",
 "so": "Habka akhriska", "sw": "Hali ya kusoma", "ha": "Yanayin karatu",
},

"quran.readingOn": {
 "fr": "📖 Mode lecture activé", "en": "📖 Reading mode on",
 "es": "📖 Modo lectura activado", "ru": "📖 Режим чтения включён",
 "bs": "📖 Način čitanja uključen", "ar": "📖 تم تفعيل وضع القراءة",
 "tr": "📖 Okuma modu açık", "fa": "📖 حالت مطالعه روشن شد",
 "ur": "📖 مطالعہ موڈ چالو", "hi": "📖 पठन मोड चालू",
 "bn": "📖 পাঠ মোড চালু", "id": "📖 Mode baca aktif",
 "ms": "📖 Mod bacaan aktif", "zh": "📖 阅读模式已开启",
 "ja": "📖 読書モードをオンにしました", "so": "📖 Habka akhriska waa shidan",
 "sw": "📖 Hali ya kusoma imewashwa", "ha": "📖 An kunna yanayin karatu",
},

"quran.readingOff": {
 "fr": "Mode lecture désactivé", "en": "Reading mode off",
 "es": "Modo lectura desactivado", "ru": "Режим чтения выключен",
 "bs": "Način čitanja isključen", "ar": "تم إيقاف وضع القراءة",
 "tr": "Okuma modu kapalı", "fa": "حالت مطالعه خاموش شد",
 "ur": "مطالعہ موڈ بند", "hi": "पठन मोड बंद",
 "bn": "পাঠ মোড বন্ধ", "id": "Mode baca nonaktif",
 "ms": "Mod bacaan dimatikan", "zh": "阅读模式已关闭",
 "ja": "読書モードをオフにしました", "so": "Habka akhriska waa demis",
 "sw": "Hali ya kusoma imezimwa", "ha": "An kashe yanayin karatu",
},
}
