#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Invocations prophetiques relevees dans l'edition espagnole.

Source : « La Fortaleza del Musulmán », Sa'id ibn 'Ali ibn Wahf al-Qahtani,
edition espagnole publiee (inspirations/docs trad/es_Muslim_bastion.pdf).

Attention pour qui reprendra ce travail : cette edition suit la numerotation
commune jusqu'a l'entree 74, puis s'en ecarte — son numero 86 n'est pas celui
des editions turque ou indonesienne. Au-dela, les invocations ont ete
retrouvees par leur translitteration, que l'edition donne en regard de chaque
texte ; le numero indique entre crochets est celui de cette edition-ci.

Deux absences propres a cette edition : sur-safa-et-marwa-3 s'y trouve dans
le recit du pelerinage plutot que sous un numero (p104), d'ou son releve.

Quatre invocations de l'application ne figurent dans aucune edition :
avant-le-repas, apres-le-repas, en-voyant-la-ka-ba, apres-les-2-rak-ahs.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

ES = {
# [1]
"au-reveil-standard":
 "Alabado sea Allah, quien me ha devuelto la vida luego de haberme dado la "
 "muerte, y a Él será el retorno.",
# [2]
"reveil-la-nuit-tahajjud":
 "No hay divinidad excepto Allah, único, sin asociados. Suyo es el reino y la "
 "alabanza. Él es el Omnipotente. Glorificado sea Allah, la alabanza es para "
 "Allah, no hay divinidad excepto Allah, Allah es más Grande. No hay fuerza "
 "ni poder salvo en Allah, el Altísimo, el Grandioso. Señor, perdóname.",
# [3]
"gratitude-pour-la-sante":
 "Alabado sea Allah que me devolvió la salud al cuerpo, me ha devuelto mi "
 "espíritu y me ha permitido recordarle.",
# [10]
"avant-d-entrer-aux-toilettes":
 "¡Oh Allah! Ciertamente me refugio en Ti del demonio y sus secuaces.",
# [11]
"en-sortant-des-toilettes":
 "Te pido perdón.",
# [12]
"avant-les-ablutions":
 "En el nombre de Allah.",
# [13]
"apres-les-ablutions":
 "Atestiguo que no hay dios salvo Allah, único, sin asociado, y atestiguo que "
 "Muhámmad es Su siervo y mensajero.",
# [16]
"en-sortant-de-la-maison":
 "En el nombre de Allah, me encomiendo en Allah, no hay fuerza ni poder salvo "
 "en Allah.",
# [18]
"en-entrant-dans-la-maison":
 "En el nombre de Allah entramos y en el nombre de Allah salimos, y nos "
 "encomendamos a nuestro Señor.",
# [20]
"entrer-a-la-mosquee":
 "¡Oh Allah! Ábreme las puertas de Tu misericordia.",
# [21]
"sortir-de-la-mosquee":
 "¡Oh Allah! Ciertamente Te pido Tu favor.",
# [65]
"demande-par-le-nom-supreme":
 "Oh Señor, Te ruego atestiguando que Tú eres Allah, no hay dios salvo Tú, "
 "eres el Único, el Eterno, el que no engendra ni fue engendrado, y no hay "
 "nadie que se Le asemeje.",
# [66]
"apres-chaque-priere":
 "Perdóname (tres veces). Oh Allah, Tú eres la Paz y de Ti viene la Paz. "
 "Bendito Tú eres, oh Poseedor de la majestad y la generosidad.",
# [74]
"istikhara-consultation-divin":
 "Oh Allah, por cierto que Te consulto porque Tuyo es el conocimiento y el "
 "poder. Busco fortaleza y ruego de Tu inmenso favor, porque ciertamente Tú "
 "puedes y yo no puedo, Tú sabes y yo no sé, Tú eres el Conocedor de lo "
 "Oculto. ¡Oh Allah! Si Tú conoces que este asunto — y pronuncia su "
 "necesidad — es bueno para mí, para mi Din, mi vida y mi muerte, entonces "
 "decrétalo, facilítamelo y bendíceme con ello. Si Tú conoces que este asunto "
 "será un mal para mí, para mi Din, para mi vida y mi muerte, entonces aléjalo "
 "de mí y decreta para mí lo que es bueno dondequiera que sea, y hazme quedar "
 "satisfecho con ello.",
# [85]
"protection-totale-3":
 "En el nombre de Allah, con cuyo nombre nada perjudica, así en la tierra "
 "como en los cielos, y Él es quien todo lo oye, el Omnisapiente.",
# [87]
"dhikr-hautement-recompense":
 "Glorificado sea Allah y alabado sea, por el número de cuanto ha creado, por "
 "Su complacencia, por el peso de Su Trono y por la tinta de Sus palabras.",
# [128]
"se-suffire-du-licite":
 "Oh Señor, haz que me sea suficiente lo que concediste lícito y aleja de mí "
 "la necesidad de lo que has prohibido, y enriquéceme con Tu favor para que "
 "no tenga necesidad de otros.",
# [131]
"debloquer-une-situation":
 "Oh Señor, no hay facilidad sino en lo que has hecho fácil, y Tú facilitas "
 "lo difícil si así lo deseas.",
# [181]
"la-main-sur-le-front-de-l-ep":
 "Oh Allah, ciertamente Te solicito el bien que hay en ella y el bien de sus "
 "inclinaciones naturales, y me refugio en Ti del mal que hay en ella y del "
 "mal de sus inclinaciones naturales.",
# [182]
"avant-les-rapports-intimes":
 "En el nombre de Allah. Oh Señor, protégenos de Sheitán y aléjalo de cuanto "
 "nos provees.",
# [198]
"doua-du-voyage":
 "Oh Allah, Te rogamos que en este viaje realicemos lo que Te complace. Dios "
 "mío, facilítanos el viaje y acorta sus distancias. Oh Allah, Tú eres mi "
 "compañero en este viaje, y bajo Tu protección dejé mi familia. Dios mío, me "
 "refugio en Ti de todo lo malo que pueda encontrar en este viaje, y de todo "
 "lo que pueda suceder con mis bienes y mi familia.",
# [234]
"la-talbiya":
 "Oh Allah, heme aquí en respuesta a Tu llamada, aquí estoy. Aquí estoy, no "
 "tienes asociados, aquí estoy. Por cierto que toda alabanza, gracia y "
 "soberanía Te pertenecen, no tienes asociados.",
# p104, dans le recit du pelerinage
"sur-safa-et-marwa-3":
 "No hay dios sino Allah, único, sin asociados. Suyo es el Reino y Suya es la "
 "alabanza, y es sobre toda cosa poderoso. Ha cumplido con Su promesa, le ha "
 "dado la victoria a Su siervo, y sólo Él ha derrotado a los grupos aliados.",
# [231]
"en-cas-de-douleur":
 "En el nombre de Allah (tres veces). Me refugio en Allah y en Su omnipotencia "
 "del mal que siento y me preocupa (siete veces).",
}

AUTRES = {
    "rtx.al-fatiha": "Al-Fátiha",
    "rtx.astaghfirullah-3": "Astagfirullah ×3",
}


def main():
    p = ROOT / "js" / "i18n" / "es.js"
    src = p.read_text(encoding="utf-8")
    paires = [(f"dut.{k}", v) for k, v in ES.items()] + list(AUTRES.items())
    ajouts = [f"  {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)},"
              for k, v in paires if f'"{k}"' not in src]
    if ajouts:
        p.write_text(re.sub(r"\n\};\s*$", "\n" + "\n".join(ajouts) + "\n};\n", src),
                     encoding="utf-8")
    print(f"es : +{len(ajouts)} clé(s) sur {len(paires)}")


if __name__ == "__main__":
    main()
