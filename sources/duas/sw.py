#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques relevees dans l'edition swahilie de Hisn al-Muslim.

Source : « Kinga ya Muislamu katika nyiradi za Qur'ani na Hadithi za Mtume »,
Sa'id b. Ali b. Wahf al-Qahtani, edition swahilie publiee
(inspirations/docs trad/sw_Kinga_Ya_Muislamu.pdf). Le PDF est un vrai scan —
aucune couche texte — donc l'OCR (scripts/out/hisn_ocr_sw.txt), relu ligne a
ligne. Il est propre en swahili ; l'arabe en ressort illisible, ce qui est
sans consequence : l'application l'affiche deja.

L'edition numerote ses chapitres (« 96. Dua ya safari. ») et ses invocations
entre parentheses (« (243) »). Le second repere est le bon, mais attention :
les notes de fin reprennent les memes parentheses, si bien qu'une recherche
sur « (66) » y tombe d'abord.

Corrections manifestes, appliquees et pas devinees — l'OCR colle ou coupe des
mots : « hhakika » pour « hakika », « nani Mjuzi » pour « na ni Mjuzi »,
« tuna ingia » pour « tunaingia », « nizake » pour « ni zake », « niwake »
pour « ni wake », « wulichokizuia » pour « ulichokizuia », et un « O » isole
tombe au milieu de « Mwenyezi Mungu ». Rien d'autre n'a ete touche.

Quatre invocations de l'application ne figurent dans aucune edition :
avant-le-repas, apres-le-repas, en-voyant-la-ka-ba et
apres-les-2-rak-ahs-en-commu.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

SW = {
# [2] Au reveil pendant la nuit
"reveil-la-nuit-tahajjud":
 "Hapana mola apasae kuabudiwa kwa haki ila Mwenyezi Mungu, hali ya kuwa "
 "peke yake hana mshirika, ni wake ufalme, na ni zake sifa njema, na yeye "
 "juu ya kila kitu ni muweza. Ametakasika Mwenyezi Mungu, na sifa njema zote "
 "ni zake, na hapana mola apasae kuabudiwa kwa haki ila ni Mwenyezi Mungu, "
 "na Mwenyezi Mungu ni mkubwa, na hapana uwezo wala nguvu isipokuwa vyote "
 "vinatokana na Mwenyezi Mungu, alie juu, alie mtukufu. Ewe Mola; nisamehe.",
# [10] Avant d'entrer aux toilettes
"avant-d-entrer-aux-toilettes":
 "(Kwa jina la Mwenyezi Mungu.) Ewe Mwenyezi Mungu najilinda kwako kutokana "
 "na mashetani ya kiume na ya kike.",
# [11] En sortant des toilettes
"en-sortant-des-toilettes":
 "Nakuomba msamaha (Ewe Mwenyezi Mungu).",
# [12] Avant les ablutions
"avant-les-ablutions":
 "Kwa jina la Mwenyezi Mungu (ninatawadha).",
# [13] Apres les ablutions
"apres-les-ablutions":
 "Nakiri kwa moyo na kusema kwa ulimi kwamba hapana mola apasae kuabudiwa "
 "kwa haki ila ni Mwenyezi Mungu, peke yake, wala hana mshirika wake, na "
 "ninakiri kwamba Muhammad ni mja wake na ni mtume wake.",
# [16] En sortant de la maison
"en-sortant-de-la-maison":
 "Kwa jina la Mwenyezi Mungu (ninatoka), ninamtegemea Mwenyezi Mungu, na "
 "hapana uwezo wala nguvu ila vyote vinatokana na Mwenyezi Mungu.",
# [18] En entrant dans la maison
"en-entrant-dans-la-maison":
 "Kwa jina la Mwenyezi Mungu tunaingia, na kwa jina la Mwenyezi Mungu "
 "tunatoka, na Mola wetu tunamtegemea. Kisha asalimie watu walio ndani.",
# [65] Demande par le Nom supreme
"demande-par-le-nom-supreme":
 "Ewe Mwenyezi Mungu hakika mimi nakuomba kwa vile ninakiri kwa hakika "
 "kwamba Wewe ni Mwenyezi Mungu, hapana apasae kuabudiwa kwa haki ila Wewe, "
 "hali ya kuwa pekee, mwenye kutegemewa kwa haja zote, ambae hakuzaa wala "
 "hakuzaliwa, na wala hakuna mfano wake na kitu chochote.",
# [66] Apres chaque priere
"apres-chaque-priere":
 "Namuomba msamaha Mwenyezi Mungu (mara tatu). Ewe Mwenyezi Mungu Wewe ndie "
 "Amani, na kwako ndiko kutokako amani, Umetukuka Ewe mwenye utukufu na "
 "Ukarimu.",
# [74] Istikhara
"istikhara-consultation-divin":
 "Ewe Mwenyezi Mungu hakika mimi nakutaka muelekezo kwa ujuzi wako, na "
 "nakuomba uniwezeshe kwa uwezo wako, na nakuomba fadhila zako kubwa; hakika "
 "Wewe unaweza nami siwezi, nawe unajua nami sijui, nawe ni mjuzi wa yale "
 "yalio fichikana. Ewe Mwenyezi Mungu, iwapo jambo hili kutokana na ujuzi "
 "wako — (atalitaja jambo lake) — lina kheri kwangu katika dini yangu na "
 "maisha yangu na mwisho wa jambo langu (karibu au mbali), basi nakuomba "
 "uniwezeshe nilipate, na unifanyie wepesi, kisha unibariki. Na iwapo unajua "
 "kwamba jambo hili ni shari kwangu katika dini yangu na maisha yangu na "
 "mwisho wa jambo langu (karibu au mbali), basi liepushe na mimi nami "
 "niepushe nalo, na nipangie jambo jengine lenye kheri nami popote lilipo, "
 "kisha niridhishe kwalo.",
# [86] Protection totale, trois fois
"protection-totale-3":
 "Kwa jina la Mwenyezi Mungu, ambae hakidhuru kwa jina lake kitu chochote "
 "kile kilicho ardhini, wala mbinguni, nae ni Msikivu na ni Mjuzi. "
 "(mara tatu)",
# [94] Dhikr hautement recompense
"dhikr-hautement-recompense":
 "Ametakasika Mwenyezi Mungu, na sifa njema zote ni zake, kwa hisabu ya "
 "viumbe vyake, na radhi yake, na uzito wa arshi yake, na wino wa maneno "
 "yake. (mara tatu kila asubuhi)",
# [139] Debloquer une situation
"debloquer-une-situation":
 "Ewe Mwenyezi Mungu hakuna jepesi ila ulilolifanya jepesi, nawe unalifanya "
 "gumu jepesi ukitaka.",
# [191] La main sur le front de l'epouse
"la-main-sur-le-front-de-l-ep":
 "Ewe Mwenyezi Mungu, hakika mimi nakuomba kheri ya (mke) huyu, na kheri ya "
 "maumbile uliyomuumba nayo, na najilinda kwako na shari yake, na shari ya "
 "maumbile uliyomuumba nayo.",
# [192] Avant les rapports intimes
"avant-les-rapports-intimes":
 "Kwa jina la Mwenyezi Mungu. Ewe Mwenyezi Mungu tuepushe na shetani, na "
 "muepushe shetani na ulicho turuzuku.",
# [207] Doua du voyage
"doua-du-voyage":
 "Mwenyezi Mungu ni Mkubwa, Mwenyezi Mungu ni Mkubwa, Mwenyezi Mungu ni "
 "Mkubwa. Ametakasika ambaye ametudhalilishia sisi hiki, na hatukuwa sisi "
 "kwacho ni wenye uwezo, na sisi kwa Mola wetu tutarejeshwa. Ewe Mwenyezi "
 "Mungu hakika sisi tunakuomba katika safari yetu hii wema na ucha Mungu, na "
 "katika matendo unayoyaridhia. Ewe Mwenyezi Mungu ifanye nyepesi safari "
 "yetu hii, na ufupishe umbali wake. Ewe Mwenyezi Mungu, Wewe ndie Mwenzangu "
 "katika safari, na Mchungaji wa familia yangu. Ewe Mwenyezi Mungu, hakika "
 "mimi najilinda kwako kutokana na ugumu wa safari, na ubaya wa mtizamo, na "
 "uovu wa kubadilikiwa katika mali na familia.",
# [233] La talbiya
"la-talbiya":
 "Nimekuitika Ewe Mwenyezi Mungu nimekuitika, nimekuitika huna mshirika wako "
 "nimekuitika. Hakika sifa njema, na neema na Ufalme ni vyako, huna mshirika "
 "wako.",
# [236] Sur Safa et Marwa
"sur-safa-et-marwa-3":
 "Hapana mola apasae kuabudiwa kwa haki ila Mwenyezi Mungu hali ya kuwa peke "
 "yake, wala hana mshirika wake, ni wake Ufalme, na ni zake sifa njema, naye "
 "juu ya kila kitu ni Mueza. Hapana mola apasae kuabudiwa kwa haki ila "
 "Mwenyezi Mungu hali ya kuwa peke yake, ametekeleza ahadi yake, na "
 "amemnusuru mja wake, na amevishinda vikosi peke yake.",
# [243] En cas de douleur
"en-cas-de-douleur":
 "Weka mkono wako juu ya sehemu inayokuuma na kisha useme «Kwa jina la "
 "Mwenyezi Mungu» (mara tatu). Kisha useme mara saba: Najilinda kwa Mwenyezi "
 "Mungu na kwa uwezo wake kutokana na shari ya ninachokisikia na "
 "ninachokiogopa.",
}


def main():
    """Ecrit, puis verifie. Une version anterieure de ce writer annoncait
    « +8 clés » alors que la substitution avait vise le mauvais dictionnaire
    et ecrit des clés sans prefixe : le compte etait celui des lignes
    preparees, pas celui des lignes arrivees. On relit."""
    p = ROOT / "js" / "i18n" / "sw.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in SW.items()]
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        neuf, n = re.subn(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src)
        if n != 1:
            raise SystemExit("sw.js ne se termine pas par « }; » — rien ecrit")
        p.write_text(neuf, encoding="utf-8")
    relu = p.read_text(encoding="utf-8")
    manque = [k for k, _ in paires if f'"{k}"' not in relu]
    if manque:
        raise SystemExit(f"sw : {len(manque)} clé(s) absente(s) après écriture : {manque[:3]}")
    print(f"sw : +{len(ajouts)} clé(s) écrite(s), {len(paires)} vérifiée(s) présentes")


if __name__ == "__main__":
    main()
