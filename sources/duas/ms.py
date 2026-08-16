#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques relevees dans l'edition malaise.

Source : « Hisnul Muslim », Sa'id bin 'Ali bin Wahf al-Qahtani, traduction
malaise d'Abu Anas Madani (Abdul Basit bin Abdul Rahman), Madinah 1423 H.
Le PDF est un scan : le texte vient de l'OCR (scripts/hisn_ocr.py, puis
scripts/out/hisn_ocr_ms.txt), relu ligne a ligne.

Le bruit d'OCR a ete corrige la ou il etait manifeste et sans ambiguite —
« kKkesihatan » pour « kesihatan », « bertawal,<kal » pour « bertawakkal ».
Rien d'autre n'a ete touche.

Cette edition numerote ses chapitres, pas ses invocations : le numero entre
crochets est celui du chapitre.

Onze invocations restent a relever : cette edition les place dans des
chapitres que l'OCR rend mal, et il vaut mieux les laisser que de deviner.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

MS = {
# [1]
"au-reveil-standard":
 "Segala puji bagi Allah yang menghidupkan kami selepas mematikan kami dan "
 "kepadaNya kami akan kembali.",
# [1]
"reveil-la-nuit-tahajjud":
 "Tiada Tuhan yang berhak disembah melainkan Allah yang Esa, tiada sekutu "
 "bagiNya, bagiNya kekuasaan dan bagiNya pujian dan Dia berkuasa atas setiap "
 "sesuatu. Maha suci Allah, segala puji bagi Allah dan tiada Tuhan yang "
 "berhak disembah melainkan Allah, Allah Maha Besar, tiada daya dan upaya "
 "melainkan dengan keizinan Allah. Ya Allah, ampunilah daku.",
# [1]
"gratitude-pour-la-sante":
 "Segala puji bagi Allah yang memberikan nikmat kesihatan pada tubuhku dan "
 "mengembalikan kepadaku rohku dan mengizinkan aku untuk mengingatiNya.",
# [6]
"avant-d-entrer-aux-toilettes":
 "Dengan nama Allah. Ya Allah, aku berlindung denganMu daripada syaitan "
 "jantan dan syaitan betina.",
# [7]
"en-sortant-des-toilettes":
 "Aku memohon keampunan daripadaMu.",
# [8]
"avant-les-ablutions":
 "Dengan nama Allah.",
# [9]
"apres-les-ablutions":
 "Aku mengaku bahawasanya tiada Tuhan yang berhak disembah melainkan Allah "
 "Yang Maha Esa, Yang tiada sekutu bagiNya, dan aku mengaku bahawasanya Nabi "
 "Muhammad itu hambaNya dan pesuruhNya.",
# [10]
"en-sortant-de-la-maison":
 "Dengan nama Allah, aku bertawakkal kepadaNya dan tiada daya serta upaya "
 "kecuali dengan keizinan Allah.",
# [11]
"en-entrant-dans-la-maison":
 "Dengan nama Allah kami masuk dan dengan nama Allah kami keluar dan kepada "
 "Allah kami bertawakkal.",
# [13]
"entrer-a-la-mosquee":
 "Ya Allah, bukakanlah kepadaku pintu-pintu rahmatMu.",
# [14]
"sortir-de-la-mosquee":
 "Ya Allah, aku memohon kepadaMu limpah kurniaanMu.",
# [24]
"demande-par-le-nom-supreme":
 "Ya Allah, aku memohon kepadaMu bahawa aku mengaku bahawa Engkaulah Tuhan "
 "yang Esa, tiada Tuhan yang berhak disembah melainkan Engkau, yang Esa, yang "
 "bergantung padaNya setiap sesuatu, Yang tidak beranak dan diperanakkan, dan "
 "tidak ada seorang pun yang setara denganNya.",
# [25]
"apres-chaque-priere":
 "Aku memohon keampunanMu, Ya Allah (tiga kali). Ya Allah, Engkau sejahtera "
 "daripada segala keaiban, daripada Engkaulah datangnya kesejahteraan, "
 "bertambah-tambah berkatMu, Ya Allah, Tuhan Yang mempunyai Kebesaran dan "
 "Kemuliaan.",
# [26]
"istikhara-consultation-divin":
 "Ya Allah, aku memohon petunjuk daripadaMu dengan ilmuMu dan aku memohon "
 "ketentuan daripadaMu dengan kekuasaanMu dan aku memohon daripadaMu akan "
 "limpah kurniaanMu yang besar. Sesungguhnya Engkau Maha Berkuasa sedangkan "
 "aku tidak berkuasa, dan Engkau Maha Mengetahui sedangkan aku tidak "
 "mengetahui, dan Engkaulah Yang Maha Mengetahui segala perkara yang ghaib. "
 "Ya Allah, seandainya Engkau mengetahui bahawasanya urusan ini adalah baik "
 "bagiku pada agamaku, kehidupanku dan kesudahan urusanku, takdirkanlah ia "
 "bagiku dan permudahkanlah serta berkatkanlah bagiku padanya. Dan seandainya "
 "Engkau mengetahui bahawa urusan ini mendatangkan keburukan bagiku pada "
 "agamaku, kehidupanku dan kesudahan urusanku, maka jauhkanlah ia daripadaku "
 "dan jauhkanlah aku daripadanya, dan takdirkanlah kebaikan untukku dalam "
 "sebarang keadaan sekalipun, kemudian redhailah aku dengannya.",
# [27]
"dhikr-hautement-recompense":
 "Maha Suci Allah dan aku memujiNya sebanyak makhluk ciptaanNya, keredhaan "
 "diriNya, seberat timbangan ArasyNya dan sebanyak tinta KalimahNya.",
# [81]
"avant-les-rapports-intimes":
 "Dengan nama Allah. Ya Allah, jauhkan kami daripada syaitan dan jauhkanlah "
 "syaitan daripada anak yang Engkau rezekikan kepada kami.",
# [118]
"sur-safa-et-marwa-3":
 "Tiada Tuhan yang berhak disembah melainkan Allah Yang Esa, tiada sekutu "
 "bagiNya, bagiNya kerajaan dan bagiNya kepujian dan Dia berkuasa ke atas "
 "setiap sesuatu. Tiada Tuhan melainkan Allah Yang Esa, tiada sekutu bagiNya. "
 "Allah telah menepati janjiNya dan membela hambaNya dan mengalahkan tentera "
 "musuh dengan sendiriNya.",
}

AUTRES = {
    "rtx.al-fatiha": "Al-Fatihah",
    "rtx.astaghfirullah-3": "Astaghfirullah ×3",
}


def main():
    p = ROOT / "js" / "i18n" / "ms.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in MS.items()] + list(AUTRES.items())
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        p.write_text(re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src),
                     encoding="utf-8")
    print(f"ms : +{len(ajouts)} clé(s) sur {len(paires)}")


if __name__ == "__main__":
    main()
