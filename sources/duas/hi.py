#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques relevees dans l'edition hindi de Hisn al-Muslim.

Source : « हिस्न अल-मुस्लिम » (Hisn al-Muslim), Sa'id b. Ali b. Wahf
al-Qahtani, edition hindi publiee
(inspirations/docs trad/risala_hi_hisnul-muslim_4.0.pdf).

Comment le texte a ete obtenu. Le PDF porte une couche texte, mais sa police
mappe ses glyphes sur de mauvais points Unicode : ि ressort en ब et
reciproquement, si bien que « जिसने » devient « बजसने ». Le document
*s'affiche* pourtant correctement — l'OCR des pages rendues lit donc juste,
et c'est lui qu'on emploie (scripts/out/hisn_ocr_hi.txt, lu par
scripts/hi_rubrique.py).

Aucune retraduction du francais : ce sont les phrases de l'edition.

Quatorze relevees sur les vingt-quatre possibles. Les dix autres n'ont pas
ete retrouvees dans l'OCR par les mots qu'on leur cherchait : ni l'arabe ni
les titres de rubrique n'y sont fiables, et le reperage se fait donc par le
contenu hindi lui-meme. Ce n'est pas un refus, c'est un travail inacheve — on
ne devine pas une invocation qu'on n'a pas lue.

Restent a trouver : apres-les-ablutions, istikhara-consultation-divin,
protection-totale-3, dhikr-hautement-recompense, la-main-sur-le-front-de-l-ep,
avant-les-rapports-intimes, doua-du-voyage, la-talbiya, sur-safa-et-marwa-3,
en-cas-de-douleur.

Et quatre ne figurent dans aucune edition, hindi comprise : avant-le-repas,
apres-le-repas, en-voyant-la-ka-ba, apres-les-2-rak-ahs-en-commu.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

HI = {
# [1] Au reveil
"au-reveil-standard":
 "सारी प्रशंसा अल्लाह की है, जिसने हमें मृत्यु के पश्चात जीवन दिया और उसी की ओर "
 "लौटकर जाना है।",
# [2] Au reveil pendant la nuit
"reveil-la-nuit-tahajjud":
 "अल्लाह के सिवा कोई सत्य पूज्य नहीं है, वह अकेला है, उसका कोई साझी नहीं है, "
 "पूर्ण स्वामित्व बस उसी को प्राप्त है, सारी प्रशंसा उसी के लिए है और वह हर चीज़ "
 "करने में सक्षम है। अल्लाह पाक है, समस्त प्रशंसाएँ अल्लाह के लिए हैं, और अल्लाह "
 "के सिवा कोई भी सत्य पूज्य नहीं है, अल्लाह सबसे बड़ा है और उच्च एवं महान अल्लाह "
 "के अतिरिक्त न किसी के पास भलाई के मार्ग पर लगाने की शक्ति है, न बुराई से रोकने "
 "की क्षमता। हे मेरे प्रभु! मुझे क्षमा कर दे।",
# [3] Gratitude pour la sante
"gratitude-pour-la-sante":
 "सारी प्रशंसा उस अल्लाह की है, जिसने मुझे शारीरिक रूप से स्वस्थ रखा, मुझे मेरा "
 "प्राण लौटा दिया और मुझे अपने ज़िक्र की अनुमति दी।",
# [10] Avant d'entrer aux toilettes
"avant-d-entrer-aux-toilettes":
 "अल्लाह के नाम से। ऐ अल्लाह! मैं नापाक जिन्नों एवं नापाक जिन्नियों से तेरी शरण "
 "माँगता हूँ।",
# [11] En sortant des toilettes
"en-sortant-des-toilettes":
 "ऐ अल्लाह! मैं तेरी क्षमा का प्रार्थी हूँ।",
# [12] Avant les ablutions
"avant-les-ablutions":
 "मैं अल्लाह के नाम से शुरू करता हूँ।",
# [16] En sortant de la maison
"en-sortant-de-la-maison":
 "मैं अल्लाह का नाम लेकर निकलता हूँ। मैंने अल्लाह पर भरोसा किया। अल्लाह के "
 "अतिरिक्त न कोई भलाई का सामर्थ्य प्रदान कर सकता है और न बुराई से रोक सकता है।",
# [18] En entrant dans la maison
"en-entrant-dans-la-maison":
 "अल्लाह के नाम के साथ हम अंदर आए और अल्लाह के नाम के साथ हम बाहर निकले तथा "
 "अल्लाह ही पर हम ने भरोसा किया जो हमारा पालनहार है। यह दुआ पढ़ने के बाद अपने घर "
 "वालों को सलाम करे।",
# [20] En entrant a la mosquee
"entrer-a-la-mosquee":
 "ऐ अल्लाह! मेरे लिए अपनी कृपा के द्वार खोल दे।",
# [21] En sortant de la mosquee
"sortir-de-la-mosquee":
 "ऐ अल्लाह! मैं तेरे अनुग्रह का प्रार्थी हूँ।",
# [65] Demande par le Nom supreme
"demande-par-le-nom-supreme":
 "ऐ अल्लाह! मैं तुझसे विनती करता हूँ, क्योंकि मैं गवाही देता हूँ कि तेरे सिवा कोई "
 "सत्य पूज्य नहीं है, तू अकेला है, बेनियाज़ है, न तेरी कोई संतान है और न तू किसी "
 "की संतान है और न कोई तेरा समकक्ष है।",
# [66] Apres chaque priere
"apres-chaque-priere":
 "मैं अल्लाह से क्षमा याचना करता हूँ (तीन बार)। ऐ अल्लाह! तू ही सुरक्षा तथा शांति "
 "का मालिक है और तेरी ही ओर से सुरक्षा एवं शांति प्राप्त होती है। हे महानता और "
 "भलाई वाले! तू बड़ी बरकतों वाला है।",
# [136] Se suffire du licite
"se-suffire-du-licite":
 "ऐ अल्लाह! मुझे अपने हलाल चीज़ों के द्वारा अपनी हराम चीज़ों से बचा ले और मुझे "
 "अपने अनुग्रह से अपने अतिरिक्त अन्य लोगों से बेनियाज़ कर दे।",
# [139] Debloquer une situation
"debloquer-une-situation":
 "ऐ अल्लाह! आसान केवल वही कार्य है, जिसे तू आसान बनाए और तू जब चाहे तो कठिन कार्य "
 "को भी आसान बना दे।",
}


def main():
    p = ROOT / "js" / "i18n" / "hi.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in HI.items()]
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        neuf, n = re.subn(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src)
        if n != 1:
            raise SystemExit("hi.js ne se termine pas par « }; » — rien ecrit")
        p.write_text(neuf, encoding="utf-8")
    relu = p.read_text(encoding="utf-8")
    manque = [k for k, _ in paires if f'"{k}"' not in relu]
    if manque:
        raise SystemExit(f"hi : {len(manque)} clé(s) absente(s) après écriture")
    print(f"hi : +{len(ajouts)} clé(s) écrite(s), {len(paires)} vérifiée(s) présentes")


if __name__ == "__main__":
    main()
