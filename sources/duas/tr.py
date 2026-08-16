#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques relevees dans l'edition turque de Hisn al-Muslim.

Source : « Hisnul-Muslim — Duâ ve Zikirler », Sa'id b. Ali b. Wahf al-Qahtani,
edition turque publiee (inspirations/docs trad/tr_Hisnul_Muslim.pdf). Le
numero entre crochets est celui de l'edition, pour retrouver le passage.

Aucune retraduction du francais : ce sont les phrases de l'edition, reprises
telles quelles, sans les crochets d'apparat critique quand ils ne portent pas
l'invocation elle-meme.

Quatre invocations de l'application ne figurent pas dans cette edition :
avant-le-repas et apres-le-repas (l'edition retient d'autres formulations),
en-voyant-la-ka-ba (al-Bayhaqi) et apres-les-2-rak-ahs-en-commu (Ibn Abi
Chayba), qui ne relevent pas de Hisn al-Muslim.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

TR = {
# [1] Au reveil
"au-reveil-standard":
 "Bizi öldürdükten (uykudan) sonra dirilten Allah'a hamd olsun. Dönüş "
 "(kıyâmet günü yeniden diriliş), yalnızca O'nadır.",
# [2] Au reveil pendant la nuit
"reveil-la-nuit-tahajjud":
 "Allah'tan başka hak ilah yoktur. O birdir ve ortağı yoktur. Mülk O'nundur "
 "ve hamd da O'nadır. O, her şeye gücü yetendir. Allah'ı tüm noksanlıklardan "
 "tenzih ederim. Hamd Allah'adır. Allah'tan başka hak ilah yoktur ve Allah en "
 "büyüktür. Güç ve kuvvet, ancak yüce ve büyük olan Allah'a âittir. Rabbim! "
 "Bana mağfiret eyle.",
# [3] Gratitude pour la sante
"gratitude-pour-la-sante":
 "Bedenime âfiyet veren, ruhumu bana geri veren ve bana kendisini zikretme "
 "fırsatı veren Allah'a hamd olsun.",
# [10] Avant d'entrer aux toilettes
"avant-d-entrer-aux-toilettes":
 "Allah'ın adıyla. Allahım! Erkek ve dişi şeytanlardan sana sığınırım.",
# [11] En sortant des toilettes
"en-sortant-des-toilettes":
 "Allahım! Senden beni bağışlamanı dilerim.",
# [12] Avant les ablutions
"avant-les-ablutions":
 "Allah'ın adıyla (abdeste başlarım).",
# [13] Apres les ablutions
"apres-les-ablutions":
 "Allah'tan başka hak ilâh olmadığına, O'nun bir olduğuna ve ortağının "
 "bulunmadığına şehâdet ederim. Yine Muhammed -sallallahu aleyhi ve "
 "sellem-'in O'nun kulu ve elçisi olduğuna şehâdet ederim.",
# [16] En sortant de la maison
"en-sortant-de-la-maison":
 "Allah'ın adıyla (çıkarım). Allah'a tevekkül ettim. Güç ve kuvvet, ancak "
 "Allah'ındır.",
# [18] En entrant dans la maison
"en-entrant-dans-la-maison":
 "Allah'ın adıyla girdik, Allah'ın adıyla çıktık ve sadece Rabbimiz olan "
 "Allah'a tevekkül ettik.",
# [20] En entrant a la mosquee
"entrer-a-la-mosquee":
 "Allahım! Bana rahmetinin kapılarını aç.",
# [21] En sortant de la mosquee
"sortir-de-la-mosquee":
 "Allahım! Senin lütfundan isterim.",
# [65] Demande par le Nom supreme
"demande-par-le-nom-supreme":
 "Allahım! Senin Allah olduğuna, senden başka hak ilah olmadığına, bir ve "
 "samed olduğuna, doğmamış ve doğurmamış olduğuna, hiçbir benzerinin "
 "olmadığına şehâdet etmemi vesile kılarak senden dilerim.",
# [66] Apres chaque priere
"apres-chaque-priere":
 "Allah'tan mağfiret dilerim (üç kere). Allahım! Sen Selâm'sın (tüm "
 "noksanlıklardan uzaksın), selâmet sendendir. Ey azamet ve ikram sahibi! "
 "Senin bereketin pek çoktur.",
# [74] Istikhara
"istikhara-consultation-divin":
 "Allahım! İlmine başvurarak senden en hayırlı olanını isterim. Kudretine "
 "dayanarak senden en uygun olanını takdir etmeni isterim. Senden, yüce "
 "ihsanını isterim. Sen güç yetirirsin, ben güç yetiremem. Sen bilirsin, ben "
 "bilemem. Sen bilinmeyenleri en iyi bilensin. Allahım! Bu işi -burada "
 "ihtiyacını söyler- benim için; dinimde, yaşantımda ve işimin sonunda iyi "
 "biliyorsan, onu bana takdir et, kolaylaştır ve sonra bereketli kıl. Bu işin "
 "benim için; dinimde, yaşantımda ve işimin sonunda şerli olduğunu "
 "biliyorsan, onu benden, beni de ondan uzaklaştır ve benim için nerede "
 "olursa hayır olanı takdir et. Sonra beni ondan razı kıl.",
# [86] Protection totale, trois fois
"protection-totale-3":
 "İsmiyle yerde ve gökte hiçbir şeyin zarar veremediği Allah'ın adıyla "
 "sığınırım. O, hakkıyla işiten, her şeyi hakkıyla bilendir.",
# [94] Dhikr hautement recompense
"dhikr-hautement-recompense":
 "Yarattıklarının sayısınca, kendisinin râzı olacağı kadar, arşının ağırlığı "
 "ve kelimelerinin çokluğunca hamd ederek Allah'ı tüm noksanlıklardan tenzih "
 "ederim.",
# [136] Se suffire du licite
"se-suffire-du-licite":
 "Allahım! Helâl rızkınla yetinmeyi ve haramından uzak durmayı bana nasip "
 "eyle. Beni başkalarına muhtaç kılmayıp lütfunla zengin kıl.",
# [139] Debloquer une situation
"debloquer-une-situation":
 "Allahım! Senin kolay kıldığından başka kolay yoktur. Eğer sen dilersen "
 "zoru kolay kılarsın.",
# [191] La main sur le front de l'epouse
"la-main-sur-le-front-de-l-ep":
 "Allahım! Bunun hayrını ve bunda yarattığın şeyin hayrını dilerim. Bunun "
 "şerrinden ve bunda yarattığın şeyin şerrinden sana sığınırım.",
# [192] Avant les rapports intimes
"avant-les-rapports-intimes":
 "Allah'ın adıyla. Allahım! Bizi şeytandan, şeytanı da bizi rızıklandıracağın "
 "çocuktan uzak tut.",
# [207] Doua du voyage
"doua-du-voyage":
 "Allahım! Senden, bu yolculuğumuzda iyilik ve takva, râzı olacağın amel "
 "dileriz. Allahım! Bu yolculuğumuzu bize kolaylaştır ve onun uzaklığını bize "
 "yakın kıl. Allahım! Sen, yolculukta dost ve âilemiz için vekilsin. Allahım! "
 "Yolculuğun meşakkatinden, üzücü manzaradan, âilem ve malımda kötü "
 "değişikliklerden sana sığınırım.",
# [233] La talbiya
"la-talbiya":
 "Buyur, Allahım buyur! Buyur, senin ortağın yoktur, buyur! Hamd sanadır. "
 "Nimet ve mülk sana âittir. Senin hiçbir ortağın yoktur.",
# [236] Sur Safa et Marwa
"sur-safa-et-marwa-3":
 "Allah'tan başka hak ilah yoktur. O, birdir ve ortağı yoktur. Mülk O'nundur, "
 "hamd da O'nadır. O, her şeye gücü yetendir. Allah'tan başka hak ilah "
 "yoktur. O birdir. Vaadini yerine getirmiş, kuluna yardım etmiş ve grupları "
 "sadece o hezimete uğratmıştır.",
# [243] En cas de douleur
"en-cas-de-douleur":
 "Allah'ın adıyla (üç kere). Bulduğum ve korktuğum acının şerrinden, Allah'a "
 "ve O'nun kudretine sığınırım (yedi kere).",
}

# Deux libelles d'etape de routine, translitteres et non traduits.
AUTRES = {
    "rtx.al-fatiha": "Fâtiha",
    "rtx.astaghfirullah-3": "Estağfirullah ×3",
}


def main():
    p = ROOT / "js" / "i18n" / "tr.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in TR.items()] + list(AUTRES.items())
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        p.write_text(re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src),
                     encoding="utf-8")
    print(f"tr : +{len(ajouts)} clé(s) sur {len(paires)}")


if __name__ == "__main__":
    main()
