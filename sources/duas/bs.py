#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques manquantes de l'edition bosniaque de Hisn al-Muslim.

Source : « Hisnul-muslim — Zastita svakog muslimana », Sa'id b. Ali b. Wahf
al-Qahtani, edition bosniaque publiee (inspirations/docs trad/bs_Hisnul_muslim.pdf).
Le PDF porte une couche texte propre, directement lisible — pas d'OCR.

Ce fichier ne reprend que les sept qui manquaient ; les dix-sept autres
etaient deja dans js/i18n/bs.js et ne sont pas retouchees.

L'edition donne d'abord la translitteration puis la traduction bosniaque.
C'est la traduction qui est relevee, jamais la translitteration.

Attention a la numerotation : elle suit la numerotation commune jusque vers
210 puis s'en ecarte. Safa et Marwa y est l'entree 218 et non 236 — le 236
de cette edition est l'invocation du sacrifice. Reperer par le contenu, pas
par le numero, au-dela de 210.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

BS = {
# [2] Au reveil pendant la nuit
"reveil-la-nuit-tahajjud":
 "Nema boga osim Allaha, Jedinoga, Koji Sebi ravnoga nema. Njemu vlast "
 "pripada i Njemu pripada svaka zahvalnost. Njegova je moć iznad svake druge "
 "moći, neka je slavljen Allah i neka Mu je hvala; nema boga osim Allaha. "
 "Allah je najveći. Nema moći i sile osim Allahove, Moćnog i Velikog. "
 "Gospodaru moj, oprosti mi.",
# [11] En sortant des toilettes
"en-sortant-des-toilettes":
 "Za oprost Te molim.",
# [12] Avant les ablutions
"avant-les-ablutions":
 "U ime Allaha.",
# [21] En sortant de la mosquee
"sortir-de-la-mosquee":
 "Allahu moj, molim Ti se da me obaspeš dobrom.",
# [66] Apres chaque priere
"apres-chaque-priere":
 "Allaha za oprost molim (3X). Allahu, Ti si Es-Selam i od Tebe je selam, "
 "blagodaran si Ti, Koji posjeduješ veličinu i plemenitost.",
# [74] Istikhara
"istikhara-consultation-divin":
 "Allahu, Tebe pitam za odgovor (rješenje) pomoću Tvoga znanja, i od Tebe "
 "pomoć tražim Tvojom moći; molim Te za Tvoju veliku dobrotu, jer Ti to "
 "možeš, a ja ne mogu, i jer Ti to znaš, a ja ne znam. Ti si Jedini znalac "
 "tajnog. Allahu, ako je ovo (imenovati o čemu se radi) dobro za mene, moju "
 "vjeru i moj život, i moju smrt, omogući da se dogodi, i olakšaj mi, zatim "
 "me blagoslovi tim. A ako znaš da će u ovome biti zlo za mene, vjeru moju i "
 "život i moju smrt, otkloni ga od mene i mene sačuvaj od njega. Odredi mi u "
 "tome dobro gdjegod ono bilo, zatim me učini zadovoljnim s tim.",
# [218 dans cette edition] Sur Safa et Marwa
"sur-safa-et-marwa-3":
 "Nema boga osim Allaha, Jedinoga, Koji Sebi ravnoga nema. Njemu pripada sva "
 "vlast i zahvalnost i On je iznad svega. Nema boga osim Allaha, Jedinoga, "
 "Koji ispunjava Svoje obećanje i pomaže Svojem robu, i sve protivnike Sam "
 "porazi.",
}


def main():
    p = ROOT / "js" / "i18n" / "bs.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in BS.items()]
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        p.write_text(re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src),
                     encoding="utf-8")
    print(f"bs : +{len(ajouts)} clé(s) sur {len(paires)}")


if __name__ == "__main__":
    main()
