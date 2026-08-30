#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques relevees dans l'edition indonesienne.

Source : « Hisnul Muslim — Kumpulan Doa dalam Alquran & Hadits », Sa'id bin
Ali al-Qahthani, edition indonesienne publiee (inspirations/docs trad/
id_hisn_almuslim.pdf). Le numero entre crochets est celui de l'edition.

Aucune retraduction du francais : ce sont les phrases de l'edition.

Quatre invocations de l'application n'y figurent pas : avant-le-repas et
apres-le-repas (l'edition retient d'autres formulations que celles retenues
ici), en-voyant-la-ka-ba (al-Bayhaqi) et apres-les-2-rak-ahs-en-commu
(Ibn Abi Chayba), qui ne relevent pas de Hisn al-Muslim.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

ID = {
# [1]
"au-reveil-standard":
 "Segala puji bagi Allah Yang membangunkan kami setelah ditidurkan-Nya dan "
 "kepada-Nya kami dibangkitkan.",
# [2]
"reveil-la-nuit-tahajjud":
 "Tiada Tuhan selain Allah, Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya "
 "kerajaan dan pujian. Dia-lah Yang Maha Kuasa atas segala sesuatu. Maha suci "
 "Allah, segala puji bagi Allah, tiada Tuhan selain Allah, Allah Maha Besar, "
 "tiada daya dan kekuatan kecuali dengan pertolongan Allah yang Maha Tinggi "
 "dan Maha Agung. Ya Tuhanku, ampunilah dosaku.",
# [3]
"gratitude-pour-la-sante":
 "Segala puji bagi Allah Yang telah memberikan kesehatan kepadaku, "
 "mengembalikan ruh dan merestuiku untuk berdzikir kepada-Nya.",
# [10]
"avant-d-entrer-aux-toilettes":
 "Dengan nama Allah. Ya Allah, sesungguhnya aku berlindung kepada-Mu dari "
 "godaan setan laki-laki dan perempuan.",
# [11]
"en-sortant-des-toilettes":
 "Aku minta ampun kepada-Mu.",
# [12]
"avant-les-ablutions":
 "Dengan nama Allah (aku berwudhu).",
# [13]
"apres-les-ablutions":
 "Aku bersaksi, bahwa tiada Tuhan yang haq kecuali Allah, Yang Maha Esa dan "
 "tiada sekutu bagi-Nya. Aku bersaksi, bahwa Muhammad adalah hamba dan "
 "utusan-Nya.",
# [16]
"en-sortant-de-la-maison":
 "Dengan nama Allah (aku keluar). Aku bertawakkal kepada-Nya, dan tiada daya "
 "dan kekuatan kecuali karena pertolongan Allah.",
# [18]
"en-entrant-dans-la-maison":
 "Dengan nama Allah, kami masuk (ke rumah), dengan nama Allah, kami keluar "
 "(darinya) dan kepada Tuhan kami, kami bertawakkal.",
# [20]
"entrer-a-la-mosquee":
 "Ya Allah, bukalah pintu-pintu rahmat-Mu untukku.",
# [21]
"sortir-de-la-mosquee":
 "Ya Allah, sesungguhnya aku minta kepada-Mu dari karunia-Mu.",
# [65]
"demande-par-le-nom-supreme":
 "Ya Allah, aku mohon kepada-Mu dengan bersaksi, bahwa Engkau adalah Allah, "
 "tiada Tuhan (yang berhak disembah) kecuali Engkau, Maha Esa, tidak "
 "membutuhkan sesuatu tapi segala sesuatu butuh kepada-Mu, tidak beranak dan "
 "tidak diperanakkan, tidak seorang pun yang menyamai-Nya.",
# [66]
"apres-chaque-priere":
 "Aku minta ampun kepada Allah (dibaca tiga kali). Ya Allah, Engkau pemberi "
 "keselamatan, dan dari-Mu keselamatan, Maha Suci Engkau, wahai Tuhan Yang "
 "Maha Agung dan Maha Mulia.",
# [74]
"istikhara-consultation-divin":
 "Ya Allah, sesungguhnya aku minta pilihan yang tepat kepada-Mu dengan ilmu "
 "pengetahuan-Mu, dan aku mohon kekuasaan-Mu (untuk mengatasi persoalanku) "
 "dengan ke-Maha Kuasaan-Mu. Aku mohon kepada-Mu sesuatu dari anugerah-Mu "
 "yang Maha Agung, sesungguhnya Engkau Maha Kuasa, sedang aku tidak kuasa, "
 "Engkau mengetahui, sedang aku tidak mengetahuinya dan Engkau adalah Maha "
 "Mengetahui hal yang ghaib. Ya Allah apabila Engkau mengetahui bahwa urusan "
 "ini (disebutkan masalahnya) lebih baik dalam agamaku, dan akibatnya "
 "terhadap diriku, takdirkanlah untukku, mudahkanlah jalannya, kemudian "
 "berilah berkah. Akan tetapi apabila Engkau mengetahui bahwa persoalan ini "
 "lebih berbahaya bagiku dalam agama, perekonomian dan akibatnya kepada "
 "diriku, maka singkirkanlah persoalan tersebut dan jauhkan aku daripadanya, "
 "takdirkan kebaikan untukku dimana saja kebaikan itu berada, kemudian "
 "berilah kerelaan-Mu kepadaku.",
# [86]
"protection-totale-3":
 "Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit "
 "tidak akan berbahaya. Dialah Yang Maha Mendengar lagi Maha Mengetahui.",
# [94]
"dhikr-hautement-recompense":
 "Maha Suci Allah, aku memuji-Nya sebanyak makhluk-Nya, sejauh kerelaan-Nya, "
 "seberat timbangan 'Arasy-Nya dan sebanyak tinta tulisan kalimat-Nya.",
# [136]
"se-suffire-du-licite":
 "Ya Allah, cukupilah aku dengan (rezeki)-Mu yang halal (hingga aku "
 "terhindar) dari yang haram. Kayakanlah aku dengan kenikmatan-Mu selain-Mu.",
# [139]
"debloquer-une-situation":
 "Ya Allah, tidak ada yang mudah kecuali apa yang Engkau mudahkan dan tidak "
 "ada yang sulit jika Engkau menghendakinya kemudahan.",
# [191]
"la-main-sur-le-front-de-l-ep":
 "Ya Allah, sesungguhnya aku mohon kepada-Mu kebaikannya dan apa yang telah "
 "Engkau ciptakan dalam wataknya. Dan aku mohon perlindungan kepada-Mu dari "
 "kejelekannya dan apa yang telah Engkau ciptakan dalam wataknya.",
# [192]
"avant-les-rapports-intimes":
 "Dengan nama Allah. Ya Allah, jauhkan kami dari setan, dan jauhkan setan "
 "untuk mengganggu apa yang Engkau rezekikan kepada kami.",
# [207]
"doua-du-voyage":
 "Ya Allah, sesungguhnya kami memohon kebaikan dan taqwa dalam bepergian ini, "
 "kami mohon perbuatan yang meridhakan-Mu. Ya Allah, permudahlah perjalanan "
 "kami ini, dan dekatkan jaraknya bagi kami. Ya Allah, Engkaulah teman dalam "
 "bepergian dan yang mengurusi keluargaku. Ya Allah, sesungguhnya aku "
 "berlindung kepada-Mu dari kelelahan dalam bepergian, pemandangan yang "
 "menyedihkan dan perubahan yang jelek dalam harta dan keluarga.",
# [233]
"la-talbiya":
 "Aku memenuhi panggilan-Mu, ya Allah aku memenuhi panggilan-Mu. Aku memenuhi "
 "panggilan-Mu, tiada sekutu bagi-Mu, aku memenuhi panggilan-Mu. Sesungguhnya "
 "pujaan dan nikmat adalah milik-Mu, begitu juga kerajaan, tiada sekutu "
 "bagi-Mu.",
# [236]
"sur-safa-et-marwa-3":
 "Tiada Tuhan yang berhak disembah selain Allah, Yang Maha Esa, tiada sekutu "
 "bagi-Nya. Bagi-Nya kerajaan dan pujian. Dia-lah Yang Maha Kuasa atas segala "
 "sesuatu. Tiada Tuhan yang berhak disembah selain Allah Yang Maha Esa, yang "
 "melaksanakan janji-Nya, membela hamba-Nya dan mengalahkan musuh sendirian.",
# [243]
"en-cas-de-douleur":
 "Bismillaah (tiga kali). Aku berlindung kepada Allah dan kekuasaan-Nya dari "
 "kejahatan sesuatu yang aku jumpai dan yang aku takuti (tujuh kali).",
}

AUTRES = {
    "rtx.al-fatiha": "Al-Fatihah",
    "rtx.astaghfirullah-3": "Astaghfirullah ×3",
}


def main():
    p = ROOT / "js" / "i18n" / "id.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in ID.items()] + list(AUTRES.items())
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        p.write_text(re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src),
                     encoding="utf-8")
    print(f"id : +{len(ajouts)} clé(s) sur {len(paires)}")


if __name__ == "__main__":
    main()
