#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Les deux etats de la carte « serie d'invocations ».

L'ancienne carte annoncait un mecanisme — « choisissez vos douas, elles
s'enchainent une par une ». Elle disait comment la fonction marche, pas
pourquoi on la voudrait.

La nouvelle propose une pratique quand la serie est vide, et rappelle ce qu'on
a bati quand elle existe. Les libelles suivent : « Composer ma serie » est un
geste, pas un titre de fonctionnalite.

`serie.row` et `serie.rowSub` ne servent plus ; ils restent en place, une cle
retiree se rate plus souvent qu'elle ne se remplace.
"""

LOTS = {

"serie.compose": {
 "fr": "Composer ma série", "en": "Build my series",
 "es": "Componer mi serie", "ru": "Собрать свою серию",
 "bs": "Sastavi svoj niz", "ar": "كوِّن سلسلتك",
 "tr": "Kendi dizimi oluştur", "fa": "زنجیرهٔ خود را بسازید",
 "ur": "اپنا سلسلہ بنائیں", "hi": "अपनी श्रृंखला बनाएँ",
 "bn": "নিজের ধারা গড়ুন", "id": "Susun rangkaian saya",
 "ms": "Susun rangkaian saya", "zh": "编排我的序列",
 "ja": "自分のドゥアー集をつくる", "so": "Samee taxankaaga",
 "sw": "Tengeneza mfululizo wangu", "ha": "Gina jerina",
},

"serie.composeSub": {
 "fr": "Vos douas, dans votre ordre — prêtes à enchaîner",
 "en": "Your duas, in your order — ready to run through",
 "es": "Sus súplicas, en su orden — listas para encadenar",
 "ru": "Ваши мольбы, в вашем порядке — готовые к чтению подряд",
 "bs": "Vaše dove, vašim redom — spremne za nizanje",
 "ar": "أدعيتك، بترتيبك — جاهزة للتوالي",
 "tr": "Dualarınız, kendi sıranızla — art arda okumaya hazır",
 "fa": "دعاهای شما، به ترتیب خودتان — آمادهٔ پیوسته‌خواندن",
 "ur": "آپ کی دعائیں، آپ کی ترتیب میں — یکے بعد دیگرے پڑھنے کو تیار",
 "hi": "आपकी दुआएँ, आपके क्रम में — एक के बाद एक पढ़ने को तैयार",
 "bn": "আপনার দোয়া, আপনার ক্রমে — পরপর পড়ার জন্য প্রস্তুত",
 "id": "Doa Anda, dalam urutan Anda — siap dibaca berurutan",
 "ms": "Doa anda, mengikut susunan anda — sedia dibaca berturut-turut",
 "zh": "你的祈祷，按你的次序 —— 可连贯诵读",
 "ja": "あなたのドゥアーを、あなたの順に。続けて唱えられます",
 "so": "Ducooyinkaaga, sida aad rabto — diyaar u kala dambeeya",
 "sw": "Dua zako, kwa mpangilio wako — tayari kufuatana",
 "ha": "Addu'o'inka, cikin tsarinka — a shirye don bi da bi",
},

"serie.go": {
 "fr": "Lancer", "en": "Start", "es": "Iniciar", "ru": "Начать",
 "bs": "Pokreni", "ar": "ابدأ", "tr": "Başlat", "fa": "آغاز",
 "ur": "شروع", "hi": "शुरू", "bn": "শুরু", "id": "Mulai",
 "ms": "Mula", "zh": "开始", "ja": "はじめる", "so": "Bilow",
 "sw": "Anza", "ha": "Fara",
},

"serie.edit": {
 "fr": "Modifier ma série", "en": "Edit my series",
 "es": "Modificar mi serie", "ru": "Изменить серию",
 "bs": "Izmijeni niz", "ar": "تعديل السلسلة",
 "tr": "Dizimi düzenle", "fa": "ویرایش زنجیره",
 "ur": "سلسلہ ترمیم کریں", "hi": "श्रृंखला बदलें",
 "bn": "ধারা সম্পাদনা", "id": "Ubah rangkaian",
 "ms": "Ubah rangkaian", "zh": "编辑序列",
 "ja": "集を編集する", "so": "Wax ka beddel taxanaha",
 "sw": "Hariri mfululizo", "ha": "Gyara jerin",
},
}
