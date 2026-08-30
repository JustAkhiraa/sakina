#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques manquantes de l'edition russe de Hisn al-Muslim.

Source : « Молитвы из Корана и Сунны » (Hisn al-Muslim), Sa'id b. Ali b.
Wahf al-Qahtani, edition russe publiee
(inspirations/docs trad/ru_Dua_iz_korana_i_sunny.pdf). Couche texte propre,
pas d'OCR.

L'edition ecrit « 207. "translitteration" Перевод: traduction ». Les titres
de chapitre portent eux aussi un numero, mais en capitales : on ancre donc
sur le numero suivi d'un guillemet, et on ne releve que ce qui suit
« Перевод: ».

Correction manifeste : « Прошу прошения » (n° 66) pour « Прошу прощения ».
Rien d'autre n'a ete touche. Les gloses de l'editeur entre parentheses, qui
expliquent un terme plutot que de porter l'invocation, ne sont pas reprises.

Quatre invocations de l'application ne figurent dans aucune edition :
avant-le-repas, apres-le-repas, en-voyant-la-ka-ba et
apres-les-2-rak-ahs-en-commu.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

RU = {
# [10] Avant d'entrer aux toilettes
"avant-d-entrer-aux-toilettes":
 "С именем Аллаха. О Аллах, поистине, я прибегаю к Тебе от порочности и "
 "дурных поступков.",
# [11] En sortant des toilettes
"en-sortant-des-toilettes":
 "Прости.",
# [12] Avant les ablutions
"avant-les-ablutions":
 "С именем Аллаха.",
# [13] Apres les ablutions
"apres-les-ablutions":
 "Свидетельствую, что нет бога, кроме одного лишь Аллаха, у которого нет "
 "сотоварища, и свидетельствую, что Мухаммад — Его раб и Его посланник.",
# [16] En sortant de la maison
"en-sortant-de-la-maison":
 "С именем Аллаха, я уповаю на Аллаха, нет мощи и силы ни у кого, кроме "
 "Аллаха.",
# [18] En entrant dans la maison
"en-entrant-dans-la-maison":
 "С именем Аллаха мы вошли, с именем Аллаха вышли и на Господа нашего стали "
 "уповать. Сказав это, вошедшему следует обратиться с приветствием к "
 "находящимся в доме.",
# [20] En entrant a la mosquee
"entrer-a-la-mosquee":
 "О Аллах, открой для меня врата милосердия Своего!",
# [21] En sortant de la mosquee
"sortir-de-la-mosquee":
 "О Аллах, поистине, я прошу Тебя о милости Твоей.",
# [66] Apres chaque priere
"apres-chaque-priere":
 "Прошу прощения у Аллаха (трижды). О Аллах, Ты — Мир и от Тебя — мир, "
 "благословен Ты, о Обладатель величия и Почитаемый!",
# [74] Istikhara
"istikhara-consultation-divin":
 "О Аллах, поистине, я прошу Тебя о помощи Твоим знанием и Твоим "
 "могуществом, и я прошу Тебя оказать мне великую милость, ибо Ты можешь, а "
 "я не могу, Ты знаешь, а я не знаю, и Ты знаешь всё о сокрытом! О Аллах, "
 "если знаешь Ты, что это дело (и человеку следует сказать, что он намерен "
 "сделать) станет благом для моей религии, для моей жизни и для исхода моих "
 "дел, то предопредели его мне, облегчи его для меня, а потом дай мне Своё "
 "благословение на это; если же Ты знаешь, что это дело окажется вредным "
 "для моей религии, для моей жизни и для исхода моих дел, то уведи его от "
 "меня, и уведи меня от него и суди мне благо, где бы оно ни было, а потом "
 "приведи меня к удовлетворённости им.",
# [86] Protection totale, trois fois
"protection-totale-3":
 "С именем Аллаха, с именем которого ничто не причинит вред ни на земле, ни "
 "на небе, ведь Он — Слышащий, Знающий! (Эти слова следует повторять "
 "трижды.)",
# [94] Dhikr hautement recompense
"dhikr-hautement-recompense":
 "Слава Аллаху и хвала Ему столько раз, сколько существует Его творений, и "
 "столько раз, сколько будет Ему угодно; пусть вес этих славословий и "
 "похвал будет равен весу Его трона и пусть для записи их потребуется "
 "столько же чернил, сколько нужно их для записи слов Его!",
# [139] Debloquer une situation
"debloquer-une-situation":
 "О Аллах, нет ничего лёгкого, кроме того, что Ты сделал лёгким, и если Ты "
 "пожелаешь, то сделаешь это затруднение лёгким!",
# [191] La main sur le front de l'epouse
"la-main-sur-le-front-de-l-ep":
 "О Аллах, поистине, я прошу Тебя о благе её и благе того, для чего Ты её "
 "создал, и прибегаю к Тебе от зла её и от зла того, для чего Ты её создал!",
# [207] Doua du voyage
"doua-du-voyage":
 "Аллах велик, Аллах велик, Аллах велик! Слава Тому, кто подчинил нам это, "
 "ведь нам такое не под силу! Поистине, мы к Господу нашему возвращаемся! "
 "О Аллах, поистине, мы просим Тебя о благочестии и богобоязненности в этом "
 "нашем путешествии, а также о совершении тех дел, которыми Ты останешься "
 "доволен! О Аллах, облегчи нам это наше путешествие и сократи для нас его "
 "дальность! О Аллах, Ты будешь спутником в этом путешествии и Ты "
 "останешься с семьёй; о Аллах, поистине, я прибегаю к Тебе от трудностей "
 "пути, от уныния, в которое я могу впасть от того, что увижу, и от "
 "неприятностей, касающихся имущества и семьи!",
# [233] La talbiya
"la-talbiya":
 "Вот я перед Тобой, о Аллах, вот я перед Тобой, нет у Тебя сотоварища, вот "
 "я перед Тобой; поистине, хвала Тебе, и милость принадлежит Тебе и "
 "владычество, нет у Тебя сотоварища!",
# [236] Sur Safa et Marwa
"sur-safa-et-marwa-3":
 "Нет бога, кроме одного лишь Аллаха, у которого нет сотоварища, Ему "
 "принадлежит владычество, Ему хвала, Он всё может! Нет бога, кроме одного "
 "лишь Аллаха, который выполнил Своё обещание, помог Своему рабу и один "
 "разбил племена.",
# [243] En cas de douleur
"en-cas-de-douleur":
 "Положи руку на то место, которое у тебя болит, и трижды скажи: «С именем "
 "Аллаха!» — после чего семь раз повтори: «Прибегаю к Аллаху и могуществу "
 "Его от зла того, что я ощущаю и чего опасаюсь!»",
}


def main():
    p = ROOT / "js" / "i18n" / "ru.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in RU.items()]
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        neuf, n = re.subn(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src)
        if n != 1:
            raise SystemExit("ru.js ne se termine pas par « }; » — rien ecrit")
        p.write_text(neuf, encoding="utf-8")
    relu = p.read_text(encoding="utf-8")
    manque = [k for k, _ in paires if f'"{k}"' not in relu]
    if manque:
        raise SystemExit(f"ru : {len(manque)} clé(s) absente(s) après écriture")
    print(f"ru : +{len(ajouts)} clé(s) écrite(s), {len(paires)} vérifiée(s) présentes")


if __name__ == "__main__":
    main()
