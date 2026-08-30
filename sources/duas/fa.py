#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques relevees dans l'edition persane de Hisn al-Muslim.

Source : « پناهگاه مسلمان » (Panahgah-e Mosalman), Sa'id b. Ali b. Wahf
al-Qahtani, edition persane publiee — inspirations/docs trad/fa_hisn_muslim.pdf.
Le numero entre crochets est celui de l'edition.

Aucune retraduction du francais : ce sont les phrases de l'edition, reprises
telles quelles. Comme en turc et en anglais, on donne le passage entier
publie meme quand l'arabe affiche dans l'application n'en montre qu'un
extrait — tailler la phrase de l'editeur serait la reecrire.

Comment le texte a ete obtenu — le detail compte, il a coute une matinee :
l'OCR (scripts/hisn_ocr.py) lit bien le persan mais perd des lignes entieres
aux sauts de page, ce qui tronquait une invocation sur quatre sans que rien
ne le signale. Le PDF a en fait une couche texte complete, mais dans l'ordre
visuel et en formes de presentation arabes. scripts/fa_pdf.py la reconstruit
depuis les coordonnees des caracteres, scripts/fa_rubrique.py isole une
rubrique. Le texte ci-dessous vient de la, relu a la main.

Trois corrections manifestes, appliquees et pas devinees :
 · la police du PDF ecrit ھ (heh urdu, U+06BE) la ou le persan ecrit ه ;
 · le PDF perd les liants sans chasse : « می شود » est reecrit « می‌شود » ;
 · les guillemets sortent inverses par le sens de lecture — »به حق« devient
   «به حق».
Rien d'autre n'a ete touche.

Quatre invocations de l'application ne figurent dans aucune edition :
avant-le-repas et apres-le-repas (les editions retiennent d'autres
formulations), en-voyant-la-ka-ba (al-Bayhaqi) et
apres-les-2-rak-ahs-en-commu (Ibn Abi Chayba).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

FA = {
# [1] Au reveil
"au-reveil-standard":
 "تمام ستایش‌ها از آنِ خدایی است که پس از میراندن ما را زنده کرده است، "
 "و بازگشت به سوی اوست.",
# [2] Au reveil pendant la nuit
"reveil-la-nuit-tahajjud":
 "هیچ معبودی به جز الله «به حق» وجود ندارد، یکتاست و شریک ندارد، و پادشاهی "
 "و ستایش از آنِ اوست، و او بر هر چیز تواناست. الله پاک و منزّه است، و حمد "
 "از آنِ اوست، و هیچ معبودی به جز الله «به حق» وجود ندارد، و خدا بزرگ‌ترین "
 "است، و هیچ حول و قدرتی بجز از طرف خدای بلندمرتبه و بزرگ نیست. خدایا! "
 "مرا بیامرز.",
# [3] Gratitude pour la sante
"gratitude-pour-la-sante":
 "تمام ستایش‌ها مر خدایی راست که به جسمم سلامت بخشید، و روحم را به من "
 "بازگرداند، و به من اجازه ذکرش را داد.",
# [10] Avant d'entrer aux toilettes
"avant-d-entrer-aux-toilettes":
 "[به نام خدا] الهی! از جن‌های خبیث و پلید، أعم از زن و مرد، به تو پناه می‌برم.",
# [11] En sortant des toilettes
"en-sortant-des-toilettes":
 "الهی! از تو آمرزش می‌طلبم.",
# [12] Avant les ablutions
"avant-les-ablutions":
 "به نام خدا.",
# [13] Apres les ablutions
"apres-les-ablutions":
 "شهادت می‌دهم که بجز الله، معبودی «به حق» وجود ندارد، یکتاست و شریکی برای "
 "او نیست، و شهادت می‌دهم که محمّد، بنده و فرستادۀ اوست.",
# [16] En sortant de la maison
"en-sortant-de-la-maison":
 "به نام خدا، بر خدا توکل کردم، و هیچ قدرت و توانائی جز از طرف خدا نیست.",
# [18] En entrant dans la maison
"en-entrant-dans-la-maison":
 "به نام الله داخل شدیم، و بنام الله خارج گشتیم، و بر پروردگارمان توکل "
 "نمودیم. و بعد از خواندن دعای فوق، به خانواده‌اش سلام بگوید.",
# [20] En entrant a la mosquee
"entrer-a-la-mosquee":
 "الهی! درهای رحمت خود را بر من بگشا.",
# [21] En sortant de la mosquee
"sortir-de-la-mosquee":
 "الهی! از تو فضل را مسألت می‌نمایم.",
# [65] Demande par le Nom supreme
"demande-par-le-nom-supreme":
 "پروردگارا! من تنها از تو «احتیاجاتم را» می‌خواهم، چرا که شهادت می‌دهم که "
 "تو الله هستی، و هیچ معبودی بجز تو «به حق» وجود ندارد، تو آن یکتا و کمال "
 "مطلق و سَرورِ والای برآورندۀ امیدها و برطرف‌کنندۀ نیازمندی‌ها هستی که نه "
 "زاده است، و نه زائیده شده است، و همتایی ندارد.",
# [66] Apres chaque priere
"apres-chaque-priere":
 "از الله طلب آمرزش می‌کنم [سه مرتبه]. الهی تو سلامی، و سلامتی از جانب تو "
 "است، تو بسیار بابرکتی، ای صاحب عظمت و بزرگی.",
# [74] Istikhara
"istikhara-consultation-divin":
 "ای الله! به وسیلۀ علمت از تو طلب خیر می‌کنم، و بوسیلۀ قدرتت از تو توانایی "
 "می‌خواهم، از تو فضل بسیارت را مسألت می‌نمایم، زیرا تو توانایی و من ناتوان، "
 "و تو می‌دانی و من نمی‌دانم، و تو دانندۀ امور پنهان هستی. الهی! اگر در علم "
 "تو این کار — حاجت خود را نام می‌برد — باعث خیر من در دین و آخرت است، آن را "
 "برایم مقدور و آسان بگردان، و در آن برکت عنایت فرما، و چنانچه در علم تو این "
 "کار برایم در دنیا و آخرت باعث بدی است، پس آن را از من، و مرا از آن، منصرف "
 "بگردان، و خیر را برای من هر کجا که هست مقدّر نما، و آنگاه مرا با آن خشنود "
 "بگردان.",
# [86] Protection totale, trois fois
"protection-totale-3":
 "به نام خدایی که با نام وی هیچ چیز در زمین و آسمان، گزندی نمی‌رساند، و او "
 "شنوا و دانا است.",
# [94] Dhikr hautement recompense
"dhikr-hautement-recompense":
 "تسبیح و پاکی الله و ستایش او را به تعداد آفریدگانش و خشنودی‌اش و سنگینی "
 "عرشش و جوهر سخنانش، بیان می‌نمایم.",
# [136] Se suffire du licite
"se-suffire-du-licite":
 "ای الله! مرا با رزق حلالت، کفایت کن، و رزق حرام نصیبم مگردان، و با فضل "
 "خود از دیگران بی‌نیاز کن.",
# [139] Debloquer une situation
"debloquer-une-situation":
 "الهی! انجام هیچ کاری آسان نیست مگر آن را تو آسان بگردانی و توئی که هرگاه "
 "بخواهی، مشکل را آسان می‌گردانی.",
# [191] La main sur le front de l'epouse
"la-main-sur-le-front-de-l-ep":
 "بار الها! من از تو خیر او، خُلُق و خوی نیکی‌اش را مسألت می‌نمایم و از بدی "
 "او و بدی خُلُق و خویش به تو پناه می‌برم.",
# [192] Avant les rapports intimes
"avant-les-rapports-intimes":
 "به نام الله! خدایا! ما را از شیطان دور بدار، و شیطان را از آنچه به ما "
 "عنایت می‌فرمائی [یعنی فرزند] محروم کن.",
# [207] Doua du voyage
"doua-du-voyage":
 "الله اکبر، الله اکبر، الله اکبر. الهی! ما در این سفر خواهان نیکی و تقوی و "
 "عملی هستیم که باعث خشنودی تو باشد. بار الها! این سفر را برای ما آسان "
 "بگردان و دوری راه را برای ما نزدیک کن. ای الله! تویی همراه ما در این سفر، "
 "و تو جانشین ما در خانواده هستی. بار الها! از مشقت‌های سفر، و دیدن مناظر "
 "غم‌انگیز، و تحوّل ناگوار در مال و خانواده به تو پناه می‌برم.",
# [233] La talbiya
"la-talbiya":
 "گوش بفرمانم، ای الله، گوش بفرمانم، تو شریکی نداری، گوش بفرمانم، همانا "
 "ستایش و نعمت و سلطنت از آنِ تو است، و تو شریکی نداری.",
# [236] Sur Safa et Marwa
"sur-safa-et-marwa-3":
 "به جز الله، معبود دیگری «به حق» وجود ندارد، یگانه است و شریکی ندارد، "
 "پادشاهی از آن اوست، و ستایش مخصوص اوست، او بر هر چیز توانا است، بجز او "
 "معبود دیگری «به حق» وجود ندارد، یگانه است، اوست که وعده‌اش را تحقّق بخشید، "
 "و بنده‌اش را پیروز کرد، و به تنهایی گروه‌ها را شکست داد.",
# [243] En cas de douleur
"en-cas-de-douleur":
 "به نام الله [سه بار]. من به خدا و قدرتش پناه می‌برم از شرّ آنچه به آن دچار "
 "می‌شوم و از آن بیم دارم و می‌ترسم [هفت بار].",
}


def main():
    p = ROOT / "js" / "i18n" / "fa.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in FA.items()]
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        p.write_text(re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src),
                     encoding="utf-8")
    print(f"fa : +{len(ajouts)} clé(s) sur {len(paires)}")


if __name__ == "__main__":
    main()
