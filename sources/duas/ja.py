#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques manquantes de l'edition japonaise de Hisn al-Muslim.

Source : « ムスリムの砦 » (Hisn al-Muslim), Sa'id b. Ali b. Wahf al-Qahtani,
edition japonaise publiee (inspirations/docs trad/ja_Hisn_Almuslim.pdf).
Couche texte propre, pas d'OCR.

Cette edition ne numerote pas ses invocations selon la numerotation commune :
ses numeros repartent a chaque rubrique — son « 11 » est une invocation du
tashahhud, pas la sortie des toilettes. Le repere est le titre de rubrique,
numerote en pleine chasse : « 6．トイレに入る時のドアー ».

L'edition donne la translitteration en katakana puis la traduction entre
「 」. C'est le contenu de ces crochets qui est releve. Les notes du
traducteur, appelees par ①, ne sont pas reprises : elles expliquent un terme
et ne font pas partie de l'invocation.

Quatre invocations de l'application ne figurent dans aucune edition :
avant-le-repas, apres-le-repas, en-voyant-la-ka-ba et
apres-les-2-rak-ahs-en-commu.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

JA = {
# [2] Au reveil pendant la nuit
"reveil-la-nuit-tahajjud":
 "唯一で並ぶもの無きお方アッラー以外に真に崇拝すべきものはありません。"
 "主権と讃美はかれのもので、かれは全能です。アッラーに称えあれ。"
 "全ての讃美はアッラーにあります。アッラー以外に真に崇拝すべきものは無く、"
 "アッラーは偉大で、至高至大のアッラーの他にいかなる威力も強大なるものも"
 "ありません。主よ、私をお赦し下さい。",
# [10] Avant d'entrer aux toilettes
"avant-d-entrer-aux-toilettes":
 "アッラーの御名において。アッラーよ、私は男女の悪魔からあなたにご加護を"
 "求めます。",
# [11] En sortant des toilettes
"en-sortant-des-toilettes":
 "あなたにお赦しを求めます。",
# [12] Avant les ablutions
"avant-les-ablutions":
 "アッラーの御名において。",
# [13] Apres les ablutions
"apres-les-ablutions":
 "かれに並ぶ者なきアッラー以外に真に崇拝すべきものはなく、"
 "ムハンマドはかれのしもべであり、使徒であることを証言します。",
# [16] En sortant de la maison
"en-sortant-de-la-maison":
 "アッラーの御名において。私はアッラーにこの身を委ねます。"
 "至高至大のアッラーの他にいかなる威力も強大なるものもありません。",
# [74] Istikhara
"istikhara-consultation-divin":
 "アッラーよ、私はあなたの知識による選択を求めます。あなたのお力を求めます。"
 "私は偉大なるあなたの恩恵を求めます。あなたこそは何事も可能なお方で、"
 "私は無力です。あなたこそご存知で、私は無知です。"
 "あなたは不可視なる世界をご存知の御方です。アッラーよ、しかじか"
 "（ここで最善の決断や選択を求めるところの問題を述べる）が私の宗教と生活と"
 "事の結末にとって最善であるとご存知ならば、私にそれを可能にし、"
 "容易くして下さい。それからそれにおいて私を祝福して下さい。"
 "そしてもししかじかが私の宗教と生活と事の結末にとって悪いとご存知ならば、"
 "それを私から遠ざけ、そして私をそれから遠ざけて下さい。"
 "そしてそれがどんなことであろうと、最善の事を私に可能にして下さい。"
 "それからそれによって私を満足させて下さい。",
# [94] Dhikr hautement recompense
"dhikr-hautement-recompense":
 "創造物の数だけ、（アッラー）御自身の御満悦を得るまで、玉座の装飾の重さだけ、"
 "そして御言葉が書かれたインクの量だけ、私はアッラーを称賛し、"
 "アッラーを讃えます。（朝を迎えた時3回言う）",
# [191] La main sur le front de l'epouse
"la-main-sur-le-front-de-l-ep":
 "アッラーよ、私はそこにある良きものを求め、あなたがそのように創造された"
 "ところの良きものを求めます。そしてそこにある悪から、"
 "そしてあなたがそのように創造されたところの悪しきものからのご加護を"
 "求めます。",
# [207] Doua du voyage
"doua-du-voyage":
 "アッラーは偉大なり。アッラーは偉大なり。アッラーは偉大なり。"
 "『これらのものを私たちに服従させた御方を讃えます。"
 "これは私たち自身では出来なかったことです。"
 "本当に私たちは、私たちの主の御許に必ず帰るのです。』"
 "アッラーよ、私たちはこの私たちの旅において、善行と敬虔さを乞います。"
 "そしてあなたがご満悦される行いを求めます。"
 "アッラーよ、私たちのこの旅を容易くして下さい。そしてその距離を縮めて"
 "下さい。アッラーよ、あなたは旅の道連れであり、（残した）家族の後見人です。"
 "アッラーよ、私はあなたに旅の困難と風景がもたらす倦怠さから、"
 "そして財産と家族に万一のことがないよう、あなたにご加護を求めます。",
# [233] La talbiya
"la-talbiya":
 "アッラーよ、あなたの御許に馳せ参じました。あなたの御許に馳せ参じました。"
 "あなたに並ぶ者はいません。讃美と恩恵と主権は、並ぶ者無きあなたの物です。",
# [236] Sur Safa et Marwa
"sur-safa-et-marwa-3":
 "唯一のアッラー以外に真に崇拝すべきものはなく、かれに並ぶ何ものもありません。"
 "主権はかれに属し讃美もかれに属します。かれは全てにおいて全能です。"
 "唯一のアッラー以外に真に崇拝すべきものはいません。かれは約束を履行し、"
 "そのしもべを勝利させ、（背信の）徒党を敗走させました。",
# [243] En cas de douleur
"en-cas-de-douleur":
 "体の痛みを感じたところに手を置き、こう言いなさい。"
 "『アッラーの御名において。』（3回）そして次のように7回言いなさい。"
 "『私はアッラーとかれの力において、私が見出し、"
 "警戒するところの悪からのご加護を求めます。』",
}


def main():
    p = ROOT / "js" / "i18n" / "ja.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in JA.items()]
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        neuf, n = re.subn(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src)
        if n != 1:
            raise SystemExit("ja.js ne se termine pas par « }; » — rien ecrit")
        p.write_text(neuf, encoding="utf-8")
    relu = p.read_text(encoding="utf-8")
    manque = [k for k, _ in paires if f'"{k}"' not in relu]
    if manque:
        raise SystemExit(f"ja : {len(manque)} clé(s) absente(s) après écriture")
    print(f"ja : +{len(ajouts)} clé(s) écrite(s), {len(paires)} vérifiée(s) présentes")


if __name__ == "__main__":
    main()
