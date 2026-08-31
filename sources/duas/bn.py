#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques relevees dans l'edition bengalie de Hisn al-Muslim.

Source : « হিসনুল মুসলিম », Sa'id b. Ali b. Wahf al-Qahtani, traduction et
edition de Dr Abu Bakr Muhammad Zakaria — le meme traducteur que le corpus
coranique bengali de l'application
(inspirations/docs trad/risala_bn_hisn_almuslim.pdf).

Comment le texte a ete obtenu. La couche texte du PDF sort en encodage
herite : la police mappe ses glyphes sur de mauvais points Unicode, si bien
que হ ressort en ি. Le document *s'affiche* pourtant correctement — l'OCR des
pages rendues lit donc juste (scripts/out/hisn_ocr_bn.txt, 71 % de bengali).

L'edition numerote ses entrees en chiffres bengalis : « ১৩৬-১ » est
l'invocation 136. C'est le meilleur repere — mais il ne dispense pas de lire :
deux resultats obtenus par ce numero ne correspondaient pas au contenu
attendu, et n'ont pas ete retenus.

Correction manifeste : « তল্লাহ » pour « আল্লাহ », faute d'OCR sur un mot
qui revient partout ailleurs correctement.

Onze relevees sur les vingt-quatre possibles. Les autres n'ont pas ete
retrouvees avec certitude : l'OCR perd la traduction de certaines entrees au
profit de leur translitteration, et une invocation tronquee presentee comme
complete serait pire qu'une invocation absente.

Restent a trouver : au-reveil-standard, avant-les-ablutions,
en-sortant-des-toilettes, sortir-de-la-mosquee, apres-chaque-priere,
protection-totale-3, dhikr-hautement-recompense, la-main-sur-le-front-de-l-ep,
avant-les-rapports-intimes, doua-du-voyage, la-talbiya, sur-safa-et-marwa-3,
en-cas-de-douleur.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

BN = {
# [2] Au reveil pendant la nuit
"reveil-la-nuit-tahajjud":
 "একমাত্র আল্লাহ ছাড়া কোনো হক্ব ইলাহ নেই, তাঁর কোনো শরীক নেই; আল্লাহ "
 "পবিত্র-মহান। সকল হামদ-প্রশংসা আল্লাহর। আল্লাহ ছাড়া কোনো হক্ব ইলাহ নেই। আল্লাহ "
 "সবচেয়ে বড়। সুউচ্চ সুমহান আল্লাহর সাহায্য ছাড়া (পাপ কাজ থেকে দূরে থাকার) কোনো "
 "উপায় এবং (সৎকাজ করার) কোনো শক্তি কারো নেই। হে রব্ব! আমাকে ক্ষমা করুন।",
# [3] Gratitude pour la sante
"gratitude-pour-la-sante":
 "সকল হামদ-প্রশংসা আল্লাহর জন্য, যিনি আমার দেহকে নিরাপদ করেছেন, আমার রূহকে আমার "
 "নিকট ফেরত দিয়েছেন এবং আমাকে তাঁর যিকির করার অনুমতি দিয়েছেন।",
# [10] Avant d'entrer aux toilettes
"avant-d-entrer-aux-toilettes":
 "[আল্লাহর নামে।] হে আল্লাহ! আমি আপনার নিকট অপবিত্র নর জিন্ন ও নারী জিন্ন থেকে "
 "আশ্রয় চাই।",
# [13] Apres les ablutions
"apres-les-ablutions":
 "আমি সাক্ষ্য দিচ্ছি যে, একমাত্র আল্লাহ ছাড়া কোনো হক্ব ইলাহ নেই, তাঁর কোনো শরীক "
 "নেই। আমি আরও সাক্ষ্য দিচ্ছি যে, মুহাম্মাদ তাঁর বান্দা ও রাসূল।",
# [16] En sortant de la maison
"en-sortant-de-la-maison":
 "আল্লাহর নামে (বের হচ্ছি)। আল্লাহর ওপর ভরসা করলাম। আর আল্লাহর সাহায্য ছাড়া "
 "(পাপ কাজ থেকে দূরে থাকার) কোনো উপায় এবং (সৎকাজ করার) কোনো শক্তি কারো নেই।",
# [18] En entrant dans la maison
"en-entrant-dans-la-maison":
 "আল্লাহর নামে আমরা প্রবেশ করলাম, আল্লাহর নামেই আমরা বের হলাম। অতঃপর ঘরের "
 "লোকজনকে সালাম দিবে।",
# [20] En entrant a la mosquee
"entrer-a-la-mosquee":
 "হে আল্লাহ! আপনি আমার জন্য আপনার রহমতের দরজাসমূহ খুলে দিন।",
# [65] Demande par le Nom supreme
"demande-par-le-nom-supreme":
 "হে আল্লাহ! আমি আপনার কাছে চাই। কেননা, আমি সাক্ষ্য দেই যে, আপনি একক সত্তা, "
 "অমুখাপেক্ষী — সকল কিছু আপনার মুখাপেক্ষী, যিনি কাউকে জন্ম দেননি এবং জন্ম নেননি। "
 "আর যাঁর সমকক্ষ কেউ নেই।",
# [74] Istikhara
"istikhara-consultation-divin":
 "হে আল্লাহ! আমি আপনার জ্ঞানের সাহায্যে আপনার নিকট কল্যাণ কামনা করছি। আপনার "
 "কুদরতের সাহায্যে আপনার নিকট শক্তি কামনা করছি এবং আপনার মহান অনুগ্রহের প্রার্থনা "
 "করছি। কেননা আপনিই শক্তিধর, আমি শক্তিহীন। আপনি জ্ঞানবান, আমি জ্ঞানহীন এবং আপনি "
 "গায়েবী বিষয় সম্পর্কে মহাজ্ঞানী।",
# [136] Se suffire du licite
"se-suffire-du-licite":
 "হে আল্লাহ! আপনি আমাকে আপনার হালাল দ্বারা পরিতুষ্ট করে আপনার হারাম থেকে ফিরিয়ে "
 "রাখুন এবং আপনার অনুগ্রহ দ্বারা আপনি ছাড়া অন্য সকলের থেকে আমাকে অমুখাপেক্ষী করে "
 "দিন।",
# [139] Debloquer une situation
"debloquer-une-situation":
 "হে আল্লাহ! আপনি যা সহজ করেছেন তা ছাড়া কোনো কিছুই সহজ নয়। আর যখন আপনি ইচ্ছা "
 "করেন তখন কঠিনকেও সহজ করে দেন।",
}


def main():
    p = ROOT / "js" / "i18n" / "bn.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in BN.items()]
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        neuf, n = re.subn(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src)
        if n != 1:
            raise SystemExit("bn.js ne se termine pas par « }; » — rien ecrit")
        p.write_text(neuf, encoding="utf-8")
    relu = p.read_text(encoding="utf-8")
    manque = [k for k, _ in paires if f'"{k}"' not in relu]
    if manque:
        raise SystemExit(f"bn : {len(manque)} clé(s) absente(s) après écriture")
    print(f"bn : +{len(ajouts)} clé(s) écrite(s), {len(paires)} vérifiée(s) présentes")


if __name__ == "__main__":
    main()
