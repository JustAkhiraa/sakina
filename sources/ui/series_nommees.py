#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Series d'invocations nommees, et plusieurs.

Une seule serie anonyme obligeait a defaire pour refaire. Les moments ne se
ressemblent pas : le matin n'est pas le coucher, ni la maladie. Nommer une
serie, c'est ce qui la fait passer d'un reglage a une pratique — d'ou le champ
du nom en premier dans le compositeur, et non en dernier.
"""

LOTS = {

"serie.mine": {
 "fr": "Mes séries", "en": "My series", "es": "Mis series",
 "ru": "Мои серии", "bs": "Moji nizovi", "ar": "سلاسلي",
 "tr": "Dizilerim", "fa": "زنجیره‌های من", "ur": "میرے سلسلے",
 "hi": "मेरी श्रृंखलाएँ", "bn": "আমার ধারাগুলো", "id": "Rangkaian saya",
 "ms": "Rangkaian saya", "zh": "我的序列", "ja": "わたしのドゥアー集",
 "so": "Taxanahayga", "sw": "Mifululizo yangu", "ha": "Jeruruwana",
},

"serie.newTitle": {
 "fr": "Nouvelle série", "en": "New series", "es": "Nueva serie",
 "ru": "Новая серия", "bs": "Novi niz", "ar": "سلسلة جديدة",
 "tr": "Yeni dizi", "fa": "زنجیرهٔ تازه", "ur": "نیا سلسلہ",
 "hi": "नई श्रृंखला", "bn": "নতুন ধারা", "id": "Rangkaian baru",
 "ms": "Rangkaian baru", "zh": "新建序列", "ja": "新しい集",
 "so": "Taxane cusub", "sw": "Mfululizo mpya", "ha": "Sabon jeri",
},

"serie.editTitle": {
 "fr": "Modifier la série", "en": "Edit the series",
 "es": "Modificar la serie", "ru": "Изменить серию",
 "bs": "Izmijeni niz", "ar": "تعديل السلسلة", "tr": "Diziyi düzenle",
 "fa": "ویرایش زنجیره", "ur": "سلسلہ ترمیم کریں", "hi": "श्रृंखला बदलें",
 "bn": "ধারা সম্পাদনা", "id": "Ubah rangkaian", "ms": "Ubah rangkaian",
 "zh": "编辑序列", "ja": "集を編集する", "so": "Wax ka beddel taxanaha",
 "sw": "Hariri mfululizo", "ha": "Gyara jerin",
},

"serie.namePh": {
 "fr": "Nom de la série — Matin, Avant de dormir…",
 "en": "Series name — Morning, Before sleep…",
 "es": "Nombre de la serie — Mañana, Antes de dormir…",
 "ru": "Название серии — Утро, Перед сном…",
 "bs": "Naziv niza — Jutro, Prije spavanja…",
 "ar": "اسم السلسلة — الصباح، قبل النوم…",
 "tr": "Dizi adı — Sabah, Uyumadan önce…",
 "fa": "نام زنجیره — صبح، پیش از خواب…",
 "ur": "سلسلے کا نام — صبح، سونے سے پہلے…",
 "hi": "श्रृंखला का नाम — सुबह, सोने से पहले…",
 "bn": "ধারার নাম — সকাল, ঘুমের আগে…",
 "id": "Nama rangkaian — Pagi, Sebelum tidur…",
 "ms": "Nama rangkaian — Pagi, Sebelum tidur…",
 "zh": "序列名称 —— 清晨、睡前…",
 "ja": "集の名前 — 朝、就寝前…",
 "so": "Magaca taxanaha — Subax, Ka hor hurdada…",
 "sw": "Jina la mfululizo — Asubuhi, Kabla ya kulala…",
 "ha": "Sunan jeri — Safiya, Kafin barci…",
},

"serie.defaultName": {
 "fr": "Ma série", "en": "My series", "es": "Mi serie", "ru": "Моя серия",
 "bs": "Moj niz", "ar": "سلسلتي", "tr": "Dizim", "fa": "زنجیرهٔ من",
 "ur": "میرا سلسلہ", "hi": "मेरी श्रृंखला", "bn": "আমার ধারা",
 "id": "Rangkaian saya", "ms": "Rangkaian saya", "zh": "我的序列",
 "ja": "わたしの集", "so": "Taxankayga", "sw": "Mfululizo wangu",
 "ha": "Jerina",
},

"serie.saved": {
 "fr": "✦ « {name} » enregistrée", "en": "✦ “{name}” saved",
 "es": "✦ «{name}» guardada", "ru": "✦ «{name}» сохранена",
 "bs": "✦ „{name}“ spremljen", "ar": "✦ حُفظت «{name}»",
 "tr": "✦ “{name}” kaydedildi", "fa": "✦ «{name}» ذخیره شد",
 "ur": "✦ «{name}» محفوظ ہو گیا", "hi": "✦ «{name}» सहेजी गई",
 "bn": "✦ «{name}» সংরক্ষিত", "id": "✦ “{name}” disimpan",
 "ms": "✦ “{name}” disimpan", "zh": "✦ 已保存「{name}」",
 "ja": "✦ 「{name}」を保存しました", "so": "✦ «{name}» waa la keydiyey",
 "sw": "✦ “{name}” imehifadhiwa", "ha": "✦ An ajiye “{name}”",
},

"serie.delete": {
 "fr": "Supprimer", "en": "Delete", "es": "Eliminar", "ru": "Удалить",
 "bs": "Obriši", "ar": "حذف", "tr": "Sil", "fa": "حذف",
 "ur": "حذف کریں", "hi": "हटाएँ", "bn": "মুছুন", "id": "Hapus",
 "ms": "Padam", "zh": "删除", "ja": "削除", "so": "Tirtir",
 "sw": "Futa", "ha": "Share",
},

"serie.delAsk": {
 "fr": "Supprimer « {name} » ?", "en": "Delete “{name}”?",
 "es": "¿Eliminar «{name}»?", "ru": "Удалить «{name}»?",
 "bs": "Obrisati „{name}“?", "ar": "هل تحذف «{name}»؟",
 "tr": "“{name}” silinsin mi?", "fa": "«{name}» حذف شود؟",
 "ur": "کیا «{name}» حذف کر دیا جائے؟", "hi": "क्या «{name}» हटाएँ?",
 "bn": "«{name}» মুছবেন?", "id": "Hapus “{name}”?",
 "ms": "Padam “{name}”?", "zh": "删除「{name}」？",
 "ja": "「{name}」を削除しますか？", "so": "Ma tirtiraysaa «{name}»?",
 "sw": "Ufute “{name}”?", "ha": "A share “{name}”?",
},

"serie.delOk": {
 "fr": "Supprimer", "en": "Delete", "es": "Eliminar", "ru": "Удалить",
 "bs": "Obriši", "ar": "حذف", "tr": "Sil", "fa": "حذف",
 "ur": "حذف کریں", "hi": "हटाएँ", "bn": "মুছুন", "id": "Hapus",
 "ms": "Padam", "zh": "删除", "ja": "削除", "so": "Tirtir",
 "sw": "Futa", "ha": "Share",
},

"serie.deleted": {
 "fr": "Série supprimée", "en": "Series deleted", "es": "Serie eliminada",
 "ru": "Серия удалена", "bs": "Niz obrisan", "ar": "حُذفت السلسلة",
 "tr": "Dizi silindi", "fa": "زنجیره حذف شد", "ur": "سلسلہ حذف ہو گیا",
 "hi": "श्रृंखला हटाई गई", "bn": "ধারা মুছে ফেলা হয়েছে",
 "id": "Rangkaian dihapus", "ms": "Rangkaian dipadam", "zh": "序列已删除",
 "ja": "集を削除しました", "so": "Taxanaha waa la tirtiray",
 "sw": "Mfululizo umefutwa", "ha": "An share jerin",
},

"serie.none": {
 "fr": "Aucune série pour l'instant",
 "en": "No series yet",
 "es": "Aún no hay ninguna serie",
 "ru": "Пока ни одной серии",
 "bs": "Zasad nijedan niz",
 "ar": "لا سلاسل بعد",
 "tr": "Henüz dizi yok",
 "fa": "هنوز زنجیره‌ای نیست",
 "ur": "ابھی کوئی سلسلہ نہیں",
 "hi": "अभी कोई श्रृंखला नहीं",
 "bn": "এখনো কোনো ধারা নেই",
 "id": "Belum ada rangkaian",
 "ms": "Belum ada rangkaian",
 "zh": "还没有序列",
 "ja": "まだ集がありません",
 "so": "Weli taxane ma jiro",
 "sw": "Bado hakuna mfululizo",
 "ha": "Babu jeri tukuna",
},
}
