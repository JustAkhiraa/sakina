#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques manquantes de l'edition somalie de Hisn al-Muslim.

Source : « Xisnul Muslim », Sa'id b. Ali b. Wahf al-Qahtani, edition somalie
publiee (inspirations/docs trad/so_Xisnul_Muslim.pdf). Couche texte propre,
pas d'OCR. La numerotation suit la numerotation commune.

L'edition donne la translitteration entre accolades puis la traduction
somalie entre guillemets. C'est la traduction qui est relevee.

Deux pieges de cette edition :
 · les notes de fin reprennent les memes numeros que le corps ; une recherche
   sur « 191- » y tombe la premiere. Il faut ecarter les occurrences suivies
   d'une reference de hadith.
 · **Safa et Marwa (236) n'a pas de traduction somalie** : l'edition n'en
   donne que la translitteration, le recit alentour restant en somali. Elle
   n'est donc pas relevee — une invocation absente vaut mieux qu'une
   invocation fabriquee.

Restent donc absentes en somali : sur-safa-et-marwa-3, plus les quatre que
nulle edition ne porte (avant-le-repas, apres-le-repas, en-voyant-la-ka-ba,
apres-les-2-rak-ahs-en-commu).
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

SO = {
# [2] Au reveil pendant la nuit
"reveil-la-nuit-tahajjud":
 "Ilaah xaq lagu caabudo majiro ilaahay mooyee, kaligii, cid wax la "
 "wadaagtana ma jirto. Wuxuu leeyahay boqornimo, wuxuuna leeyahay mahad, wax "
 "kastana wuu awoodaa. Ilaahay baa ka hufan xumaan, mahadna leh, ahna ilaaha "
 "xaq lagu caabudo, Allaana weyn, xeelad iyo awoodna waxay u sugnaadeen "
 "allihii sareeyay ee weynaa. Rabbiyow ii dambi dhaaf.",
# [12] Avant les ablutions
"avant-les-ablutions":
 "Magaca Ilaahay ayaan ku bilaabayaa.",
# [74] Istikhara
"istikhara-consultation-divin":
 "Allow ii door laba arimood middii roon, anigoo kugu waydiisanaya cilmigaaga "
 "iyo awoodaada darteed; waxaana ku weydiisanayaa fadligaaga, waayo adigu "
 "allow waad kartaa mana karo, waad ogtahayna mana ogi, waxaadna tahay "
 "ogaanshe-badane wixii maqan oo dhan. Allow haddii aad ogtahay in arinkani "
 "(wuu magacaabayaa baahidiisa) khayr u yahay diintayda, nolashayda iyo "
 "cidhib dembeedka arinkayga, allow ii qadar iina fududee. Haddaadse allow "
 "ogtahay in arinkani shar u yahay diintayda iyo nolashayda iyo waliba cirib "
 "dambeedka arinkayga, allow iga weeci, anigana iga jeedi, iina qadar khayrku "
 "meesha uu yahay, kadibna igu raali gali.",
# [191] La main sur le front de l'epouse
"la-main-sur-le-front-de-l-ep":
 "Allow waxaan anigu ku waydiisanayaa khayrkeeda iyo khayrka aad ku "
 "abuurtay, waxaana kaa magangalayaa sharkeeda iyo sharka aad ku abuurtay.",
# [207] Doua du voyage
"doua-du-voyage":
 "Eebaa weyn, Eebaa weyn, Eebaa weyn. Waxaa nasahan Eebaha noo sahley kan, "
 "mana nihin kuwo kara leyligiisa, annaguna xagga Eebahanno yaannu ayaan u "
 "gadoomaynaa. Allow waxaan ku waydiisanaynaa socdaalkayagan wanaag iyo "
 "taqwo (cabsi) iyo camal aad raali ka tahay. Allow noo dhib-yaree "
 "safarkanagan, fogaanshihiisana noo soo duub. Allow adigaa ah saaxiibka "
 "safarka, iyo ka aan ku dhawrayno ehelka. Allow waxaan kaa magan galayaa "
 "rafaadka safarka, iyo muuqaal xumo, iyo gadoon xumo xoolihii iyo reerkii.",
}


def main():
    p = ROOT / "js" / "i18n" / "so.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in SO.items()]
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        p.write_text(re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src),
                     encoding="utf-8")
    print(f"so : +{len(ajouts)} clé(s) sur {len(paires)}")


if __name__ == "__main__":
    main()
