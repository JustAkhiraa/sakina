#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques relevees dans l'edition chinoise de Hisn al-Muslim.

Source : «穆斯林的堡垒» — edition chinoise publiee du Hisn al-Muslim de
Sa'id b. Ali b. Wahf al-Qahtani (inspirations/docs trad/risala_zh_hisn_new.pdf).
Le numero entre crochets est celui de l'edition, qui suit la numerotation
commune : 267 entrees, strictement croissantes.

Aucune retraduction du francais : ce sont les phrases de l'edition.

Cette edition avait ete classee « sans source » parce que l'OCR n'en tirait
rien. C'etait une erreur de diagnostic : le PDF porte une couche texte
propre, directement lisible, et personne n'avait regarde. Trois editions se
trouvaient dans ce cas — chinoise, hindi, bengali.

Corrections manifestes, appliquees et pas devinees :
 · variantes de glyphes melees au corps simplifie : 髙→高, 賜→赐, 亊→事 ;
 · « 恕绕 » (n° 11) n'est pas un mot, « 恕饶 » — pardonner — l'est ;
 · l'entree 74 imprime deux fois la meme proposition (« 倘若你知道… »)
   avant de poursuivre ; la repetition n'est pas gardee.
Les references de hadith en fin d'entree — （穆）,（艾）,（铁） — ne font pas
partie de l'invocation et sont laissees de cote : l'application recompose la
sienne depuis `sources:`.

Quatre invocations de l'application ne figurent dans aucune edition :
avant-le-repas et apres-le-repas (les editions retiennent d'autres
formulations), en-voyant-la-ka-ba (al-Bayhaqi) et
apres-les-2-rak-ahs-en-commu (Ibn Abi Chayba).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

ZH = {
# [1] Au reveil
"au-reveil-standard":
 "感赞安拉！他使我起死回生，复活只归于他。",
# [2] Au reveil pendant la nuit
"reveil-la-nuit-tahajjud":
 "除安拉外，绝无应受崇拜的，独一无偶，国权与赞颂只归他，他是无所不能的主。"
 "赞主清净，万赞归主，除安拉外，绝无应受崇拜的，安拉至大，无法无力，"
 "唯凭清高、伟大的主宰。主啊！求你饶恕我吧！",
# [3] Gratitude pour la sante
"gratitude-pour-la-sante":
 "感赞安拉！他使我身体安康，使我灵魂又复原位，准许我记念他。",
# [10] Avant d'entrer aux toilettes
"avant-d-entrer-aux-toilettes":
 "奉安拉尊名，主啊！求你保护我免遭男女恶魔的伤害。",
# [11] En sortant des toilettes
"en-sortant-des-toilettes":
 "主啊！我们恳求你的恕饶！",
# [12] Avant les ablutions
"avant-les-ablutions":
 "做小净时，始念“奉主尊名”。",
# [13] Apres les ablutions
"apres-les-ablutions":
 "我见证：除安拉外，绝无应受崇拜的，独一无偶。我又见证：穆罕默德"
 "（愿主福安之）是他的仆人与使者。",
# [16] En sortant de la maison
"en-sortant-de-la-maison":
 "奉安拉尊名，我托靠安拉，无法无力，唯凭安拉。",
# [18] En entrant dans la maison
"en-entrant-dans-la-maison":
 "奉安拉尊名，我们进，我们出，我们只托靠安拉！而后，向家属道‘塞俩目’。",
# [20] En entrant a la mosquee
"entrer-a-la-mosquee":
 "我以伟大的安拉及其他的尊容和永恒的权威求保护，免遭被驱逐的恶魔的干扰，"
 "奉安拉尊名，祝福、祝平安于安拉的使者。主啊！求你为我打开仁慈之门吧！",
# [21] En sortant de la mosquee
"sortir-de-la-mosquee":
 "奉安拉尊名，祝福、祝安安拉的使者。主啊！我向你祈求你的恩惠！"
 "主啊！求你护佑我免遭被驱逐的恶魔的干扰。",
# [65] Demande par le Nom supreme
"demande-par-le-nom-supreme":
 "主啊！我祈求你，让我来见证：你是安拉，除你外，绝无应受崇拜的；"
 "你是独一的、无求的、无产生、也不被产生、无任何匹敌。",
# [66] Apres chaque priere
"apres-chaque-priere":
 "我向安拉求饶。（三次）主啊！你是和平的，和平来自你，"
 "尊严荣贵的主啊！你真吉庆啊！",
# [74] Istikhara
"istikhara-consultation-divin":
 "主啊！以你的知识求你给我福利，以你的大恩，赐我能力，恳求你给我宏恩，"
 "你是全能的，我是无能的；你有知识，我无知识；你深知隐奥的哲理。"
 "主啊！你知道某件事情对宗教和生活、现在和将来各方面都有利而无害的话，"
 "那么，求你帮助我克服困难，蒙得吉庆。倘若你知道某件事情在宗教和生活"
 "各方面都有害于我，那么，求你使我和那件事完全脱离关系，"
 "请你随时随地赐我做好事的能力，并使我愉快的去干它。",
# [86] Protection totale, trois fois
"protection-totale-3":
 "奉安拉尊名，安拉的尊名能预防天地的任何灾祸，安拉是全听的、全知的。"
 "（每天早晚念三次）",
# [94] Dhikr hautement recompense
"dhikr-hautement-recompense":
 "赞颂伟大的安拉超绝万物！以万物的数字，安拉的喜悦，“阿勒史”的斤量，"
 "以及他的言辞的墨汁的数字，感赞安拉！（早晚时念三次）",
# [136] Se suffire du licite
"se-suffire-du-licite":
 "主啊！求你使我满足于守法，而不犯法，赐我宏恩，无求于人。",
# [139] Debloquer une situation
"debloquer-une-situation":
 "主啊！没有人给我容易，只有你化难为易，化悲为欢。",
# [191] La main sur le front de l'epouse
"la-main-sur-le-front-de-l-ep":
 "主啊！我向你祈祷她的益处和她天性善良所带来的益处；"
 "我求你保护我免遭她的伤害和她天性邪恶所带来的伤害。",
# [192] Avant les rapports intimes
"avant-les-rapports-intimes":
 "奉安拉尊名。主啊！请你驱逐邪魔，勿使邪魔接近你给我们的恩惠！",
# [207] Doua du voyage
"doua-du-voyage":
 "赞颂安拉超绝万物，他为我们制服了此物，我们对他本是无能的，"
 "我们必定归于我们的养主。主啊！这次旅行中求你使我行善、敬畏，"
 "做你喜悦的工作。主啊！你使我旅途一帆风顺，一路平安。"
 "主啊！你是我旅途中的伴侣，家中的代理。主啊！我向你求护，"
 "免遭风尘之苦，颠沛之难，人财之险。",
# [233] La talbiya
"la-talbiya":
 "响应你，主啊！响应你，响应你，你独一无偶，一次又一次的响应你，"
 "赞颂福泽和统治权都归你所有，你独一无偶。",
# [236] Sur Safa et Marwa
"sur-safa-et-marwa-3":
 "除安拉外，绝无应受崇拜的，独一无偶，国权归他，赞颂归他，"
 "他是全能于万事的主。除独一的安拉外，绝无应受崇拜的。他实践了他的许约，"
 "援助了他的仆民，他独自消灭了联军。",
# [243] En cas de douleur
"en-cas-de-douleur":
 "你把手放在疼痛处，说三次“奉安拉尊名！”再说七次"
 "“我求尊贵全能的安拉保佑！免除我所遭到的痛苦及其后遗症。”",
}


def main():
    p = ROOT / "js" / "i18n" / "zh.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in ZH.items()]
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        p.write_text(re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src),
                     encoding="utf-8")
    print(f"zh : +{len(ajouts)} clé(s) sur {len(paires)}")


if __name__ == "__main__":
    main()
