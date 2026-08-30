#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques manquantes de l'edition haoussa de Hisn al-Muslim.

Source : « Garkuwan Musulmi », Sa'id b. Ali b. Wahf al-Qahtani, edition
haoussa publiee (inspirations/docs trad/ha_garkuwan_musulmi.pdf). Le PDF
porte une couche texte propre — pas d'OCR.

Ce fichier ne reprend que les quatre qui manquaient ; les vingt autres
etaient deja dans js/i18n/ha.js.

L'edition numerote ses chapitres et non ses invocations : le reperage se
fait par le titre de rubrique, ou par l'en-tete arabe qui le precede
(دعاء السفر, دعاء صلاة الاستخارة). Chaque traduction est introduite par
« Ma'ana : » — c'est elle qui est relevee, jamais la translitteration.

Corrections manifestes, appliquees et pas devinees : la couche texte coupe
des mots au milieu, ce qui produit « ba mu tkasance » pour « ba mu kasance »,
« masu iya rijaya » pour « rinjaya », « wand aka yarda » pour « wanda ka
yarda », « mumnunar » pour « mummunar », « tarraya » pour « tarayya »,
« alkwarinsa » pour « alkawarinsa » et « randunonin » pour « rundunonin ».
Rien d'autre n'a ete touche.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

HA = {
# [12] Avant les ablutions
"avant-les-ablutions":
 "Da sunan Allah.",
# [74] Istikhara
"istikhara-consultation-divin":
 "Ya Allah! Ina neman zabinka domin iliminka, kuma ina neman ka bani iko "
 "domin ikonka, kuma ina rokonka daga falalarka mai girma domin kai ne mai "
 "iko ni kuwa bani da iko, kuma kai ne masani, ni kuwa ban sani ba, kuma kai "
 "ne masanin abubuwan boye. Ya Allah! Idan ka san cewa wannan al'amari — sai "
 "ya ambaci bukatar tasa — alheri ne gare ni a cikin addinina, da rayuwata, "
 "da kuma karshen al'amarina yanzunnan ko nan gaba, ka kaddara mini shi, "
 "kuma ka saukake mini shi, sannan ka albarkace ni a cikinsa; kuma idan ka "
 "san wannan al'amari sharri ne a gare ni a cikin addinina da rayuwata, da "
 "karshen al'amarina, ka kawar da shi daga gare ni, kuma ka kawar da ni daga "
 "gare shi, kuma ka kaddara mini alherin a duk inda yake, kuma ka sanya ni "
 "in yarda da shi.",
# [207] Doua du voyage
"doua-du-voyage":
 "Allah shi ne mai girma, Allah shi ne mai girma, Allah shi ne mai girma. "
 "Tsarki ya tabbata ga wanda ya hore mana wannan, kuma ba mu kasance masu "
 "iya rinjaya gareshi ba. Kuma lalle mu ga Ubangijinmu hakika masu komawa "
 "ne. Ya Allah lalle mu muna rokonka kyawawan al'amura da tsoronka a wannan "
 "tafiya tamu, kuma muna rokonka aiki wanda ka yarda da shi. Ya Allah ka "
 "sawwake mana wannan tafiya tamu, ka nade mana nisanta. Ya Allah kai ne "
 "ma'abocinmu a cikin wannan tafiya, kuma kai ne halifanmu a cikin iyalanmu. "
 "Ya Allah! Ina neman tsarinka daga wahalar tafiya, da abin gani mai sanya "
 "bacin rai, da kuma mummunar makoma ga iyali da dukiya.",
# [236] Sur Safa et Marwa
"sur-safa-et-marwa-3":
 "Babu wani abin bauta da cancanta sai shi, shi kadai yake, ba shi da "
 "abokin tarayya, mai iko ne a kan komai. Babu abin bautawa da cancanta sai "
 "Allah shi kadai yake. Allah ya gaskata alkawarinsa, ya taimaki bawansa, ya "
 "ruguza rundunonin kafirai shi kadai.",
}


def main():
    p = ROOT / "js" / "i18n" / "ha.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in HA.items()]
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        p.write_text(re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src),
                     encoding="utf-8")
    print(f"ha : +{len(ajouts)} clé(s) sur {len(paires)}")


if __name__ == "__main__":
    main()
