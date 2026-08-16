#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques relevees dans l'edition anglaise.

Source : « Fortification of the Muslim through remembrance and supplication
from the Qur'an and Sunnah », Sa'id Ibn 'Ali Ibn Wahf al-Qahtani, Ministry of
Islamic Affairs, Riyad, 1435 H. Le PDF est un scan : le texte vient de l'OCR
(scripts/ocr_hisn.py, puis scripts/hisn_ocr_en.txt), relu ligne a ligne.
Cette edition numerote ses invocations entre parentheses.

L'anglais compte double ici : c'est le repli quand une langue n'a pas encore
son edition, et c'est son incompletude qui faisait qu'un lecteur indonesien
voyait sept invocations en anglais et vingt et une en francais.

Un ecart assume : l'edition rend as-Sami' par « The All-Seeing » [86], alors
que l'arabe affiche juste au-dessus dit « l'Audient ». On suit l'arabe.

Quatre invocations de l'application ne figurent pas dans cette edition :
avant-le-repas et apres-le-repas (autres formulations), en-voyant-la-ka-ba
(al-Bayhaqi) et apres-les-2-rak-ahs-en-commu (Ibn Abi Chayba).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

EN = {
# [11]
"en-sortant-des-toilettes":
 "I ask You [Allah] for forgiveness.",
# [13]
"apres-les-ablutions":
 "I bear witness that none has the right to be worshipped except Allah, "
 "alone, without any partner, and I bear witness that Muhammad is His slave "
 "and Messenger.",
# [16]
"en-sortant-de-la-maison":
 "In the name of Allah, I place my trust in Allah, and there is no might nor "
 "power except with Allah.",
# [18]
"en-entrant-dans-la-maison":
 "In the name of Allah we enter and in the name of Allah we leave, and upon "
 "our Lord we place our trust.",
# [20]
"entrer-a-la-mosquee":
 "O Allah, open the gates of Your mercy for me.",
# [21]
"sortir-de-la-mosquee":
 "O Allah, I ask You from Your favour.",
# [74]
"istikhara-consultation-divin":
 "O Allah, I seek Your counsel by Your knowledge and by Your power I seek "
 "strength and I ask You from Your immense favour, for verily You are able "
 "while I am not and verily You know while I do not and You are the Knower of "
 "the unseen. O Allah, if You know this affair — and here he mentions his "
 "need — to be good for me in relation to my religion, my life, and end, then "
 "decree and facilitate it for me, and bless me with it; and if You know this "
 "affair to be ill for me towards my religion, my life, and end, then remove "
 "it from me and remove me from it, and decree for me what is good wherever "
 "it be and make me satisfied with such.",
# [86]
"protection-totale-3":
 "In the name of Allah with whose name nothing is harmed on earth nor in the "
 "heavens and He is the All-Hearing, the All-Knowing.",
# [94]
"dhikr-hautement-recompense":
 "How perfect Allah is and I praise Him by the number of His creation and His "
 "pleasure, and by the weight of His throne, and the ink of His words.",
# [136]
"se-suffire-du-licite":
 "O Allah, make what is lawful enough for me, as opposed to what is unlawful, "
 "and spare me by Your grace, of need of others.",
# [139]
"debloquer-une-situation":
 "O Allah, there is no ease except in that which You have made easy, and You "
 "make the difficulty, if You wish, easy.",
# [191]
"la-main-sur-le-front-de-l-ep":
 "O Allah, I ask You for the goodness within her and the goodness that You "
 "have made her inclined towards, and I take refuge with You from the evil "
 "within her and the evil that You have made her inclined towards.",
# [192]
"avant-les-rapports-intimes":
 "In the name of Allah. O Allah, keep the devil away from us and keep the "
 "devil away from what You have blessed us with.",
# [207]
"doua-du-voyage":
 "O Allah, we ask You for birr and taqwa in this journey of ours, and we ask "
 "You for deeds which please You. O Allah, facilitate our journey and let us "
 "cover its distance quickly. O Allah, You are the Companion on the journey "
 "and the Successor over the family. O Allah, I take refuge with You from the "
 "difficulties of travel, from having a change of hearts and being in a bad "
 "predicament, and I take refuge in You from an ill-fated outcome with wealth "
 "and family.",
# [233]
"la-talbiya":
 "Here I am O Allah, [in response to Your call], here I am. Here I am, You "
 "have no partner, here I am. Verily all praise, grace and sovereignty belong "
 "to You. You have no partner.",
# [236]
"sur-safa-et-marwa-3":
 "None has the right to be worshipped except Allah, alone, without any "
 "partner. To Him belong all sovereignty and praise and He is over all things "
 "omnipotent. None has the right to be worshipped except Allah alone. He "
 "fulfilled His promise, aided His Servant and single-handedly defeated the "
 "allies.",
# [243]
"en-cas-de-douleur":
 "In the name of Allah [three times]. I take refuge in Allah and within His "
 "omnipotence from the evil that I feel and am wary of [seven times].",
}

AUTRES = {
    "rtx.al-fatiha": "Al-Fatihah",
    "rtx.astaghfirullah-3": "Astaghfirullah ×3",
}


def main():
    p = ROOT / "js" / "i18n" / "en.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in EN.items()] + list(AUTRES.items())
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        p.write_text(re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src),
                     encoding="utf-8")
    print(f"en : +{len(ajouts)} clé(s) sur {len(paires)}")


if __name__ == "__main__":
    main()
