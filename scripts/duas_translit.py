#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Translittere la phonetique des invocations vers les ecritures non latines.

La ligne phonetique servait a tout le monde la meme romanisation savante
— « Rabbi-shraḥ lī ṣadrī » — y compris sous une interface japonaise, ou elle
ne se lit pas. Elle n'a de valeur que pour qui sait lire l'alphabet employe.

On ne traduit pas : on retranscrit un son. La romanisation de depart est sans
ambiguite (ā ī ū pour les longues, ḥ ṣ ḍ ṭ ẓ pour les emphatiques, th dh sh
kh gh pour les digrammes), ce qui rend la conversion deterministe et donc
verifiable : une erreur se corrige a un seul endroit, pour les trente-sept
invocations a la fois.

Deux ecritures sont volontairement absentes :
  · l'arabe, ou la phonetique doublerait le texte affiche juste au-dessus ;
  · le persan et l'ourdou, qui lisent deja l'alphabet arabe — une ligne en
    ecriture perso-arabe y serait la copie du texte original.
Pour ces trois langues l'application masque la ligne plutot que d'inventer.

    python scripts/duas_translit.py --demo          # controle sur des mots connus
    python scripts/duas_translit.py --duas          # apercu des 37 invocations
    python scripts/duas_translit.py --write         # ecrit js/data/phonetics.js
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent

# ── Analyse de la romanisation ───────────────────────────────────────────
# L'ordre compte : les digrammes avant les lettres simples.
CONSONNES = ["th", "dh", "sh", "kh", "gh",
             "ḥ", "ṣ", "ḍ", "ṭ", "ẓ",
             "b", "t", "j", "d", "r", "z", "s", "f", "q", "k", "l", "m",
             "n", "h", "w", "y", "'", "’", "ʾ", "ʿ"]
# Deux conventions cohabitent dans le projet : le macron pour les
# invocations (« Rabbi-shraḥ lī ṣadrī »), l'accent circonflexe pour les noms
# des 99 (« Ar-Rahmân »). Toutes deux notent la voyelle longue.
LONGUES = {"ā": "a", "ī": "i", "ū": "u", "â": "a", "î": "i", "û": "u"}
BREVES = {"a", "i", "u", "e", "o"}


def jetons(source):
    """Suite de (type, valeur) : ('C', 'sh'), ('V', 'a', longue?), …

    Le doublement d'une consonne (shadda) est conserve tel quel : chaque
    ecriture le rend a sa maniere, gemination en japonais, lettre doublee
    ailleurs.

    L'analyse se fait sur une copie en minuscules — une majuscule de debut
    de phrase n'est pas un son, et la laisser passer rendait « Bismi-llāh »
    en « Bисми-лла̄х »."""
    mot = source.lower()
    out, i = [], 0
    while i < len(mot):
        c = mot[i]
        if c in " -–—·":
            out.append(("|", c if c == " " else "-"))
            i += 1
            continue
        if c in "(),.…!?[]«»×0123456789":
            out.append(("~", c))
            i += 1
            continue
        pris = None
        for k in CONSONNES:
            if mot.startswith(k, i):
                pris = k
                break
        if pris:
            out.append(("C", "'" if pris in "’ʾʿ" else pris))
            i += len(pris)
            continue
        bas = c.lower()
        if bas in LONGUES:
            out.append(("V", LONGUES[bas], True))
            i += 1
            continue
        if bas in BREVES:
            # diphtongue : « ay » et « aw » seulement si rien ne suit le
            # semi-consonne. « labbayka » oui, « tawakkaltu » non.
            if bas == "a" and i + 1 < len(mot) and mot[i + 1] in "yw":
                suite = mot[i + 2:i + 3].lower()
                if not (suite in BREVES or suite in LONGUES):
                    out.append(("D", "ay" if mot[i + 1] == "y" else "aw"))
                    i += 2
                    continue
            out.append(("V", bas, False))
            i += 1
            continue
        out.append(("~", c))
        i += 1
    return out


def decoupe(texte):
    """Prepare la romanisation.

    Certaines lignes portent une consigne francaise entre crochets —
    « [Nommer la chose] » dans l'istikhara. Ce n'est pas de l'arabe : la
    transcrire phonetiquement donnerait du charabia. On la remplace par des
    points de suspension ; la consigne elle-meme figure deja, traduite, dans
    le sens de l'invocation."""
    t = unicodedata.normalize("NFC", texte)
    return re.sub(r"\s*\[[^\]]*\]\s*", " … ", t).strip()


# ── Cyrillique (russe) ───────────────────────────────────────────────────
RU_C = {"b": "б", "t": "т", "th": "с", "j": "дж", "ḥ": "х", "kh": "х",
        "d": "д", "dh": "з", "r": "р", "z": "з", "s": "с", "sh": "ш",
        "ṣ": "с", "ḍ": "д", "ṭ": "т", "ẓ": "з", "'": "'", "gh": "г",
        "f": "ф", "q": "к", "k": "к", "l": "л", "m": "м", "n": "н",
        "h": "х", "w": "в", "y": "й"}
# « e » et « o » n'appartiennent pas a la romanisation savante de l'arabe,
# mais certaines lignes en portent (noms propres, conventions locales). Les
# omettre faisait planter la conversion sur une seule etape de routine.
RU_V = {"a": "а", "i": "и", "u": "у", "e": "э", "o": "о"}
RU_VL = {"a": "а̄", "i": "ӣ", "u": "ӯ", "e": "э̄", "o": "о̄"}
RU_D = {"ay": "ай", "aw": "ау"}
# « й » suivi d'une voyelle donne я/ю/е en russe : plus lisible.
RU_YOD = {"а": "я", "у": "ю", "и": "и", "а̄": "я̄", "ӯ": "ю̄", "ӣ": "ӣ"}


def vers_ru(texte):
    out = []
    js = jetons(decoupe(texte))
    for n, j in enumerate(js):
        if j[0] == "C":
            s = RU_C.get(j[1], j[1])
            if j[1] == "y":
                suiv = js[n + 1] if n + 1 < len(js) else None
                if suiv and suiv[0] == "V":
                    continue          # traite avec la voyelle
            out.append(s)
        elif j[0] == "V":
            v = (RU_VL if j[2] else RU_V)[j[1]]
            prec = js[n - 1] if n else None
            if prec and prec[0] == "C" and prec[1] == "y":
                v = RU_YOD.get(v, "й" + v)
            out.append(v)
        elif j[0] == "D":
            out.append(RU_D[j[1]])
        else:
            out.append(j[1])
    return "".join(out)


# ── Devanagari (hindi) et bengali ────────────────────────────────────────
# Les deux ecritures fonctionnent pareil : consonne porteuse d'un « a »
# implicite, matra pour les autres voyelles, virama pour l'absence.
DEV = {
 "C": {"b": "ब", "t": "त", "th": "स", "j": "ज", "ḥ": "ह", "kh": "ख़",
       "d": "द", "dh": "ज़", "r": "र", "z": "ज़", "s": "स", "sh": "श",
       "ṣ": "स", "ḍ": "द", "ṭ": "त", "ẓ": "ज़", "'": "अ", "gh": "ग़",
       "f": "फ़", "q": "क़", "k": "क", "l": "ल", "m": "म", "n": "न",
       "h": "ह", "w": "व", "y": "य"},
 "M": {"a": "", "i": "ि", "u": "ु", "e": "े", "o": "ो"},
 "ML": {"a": "ा", "i": "ी", "u": "ू", "e": "े", "o": "ो"},
 "I": {"a": "अ", "i": "इ", "u": "उ", "e": "ए", "o": "ओ"},
 "IL": {"a": "आ", "i": "ई", "u": "ऊ", "e": "ए", "o": "ओ"},
 "D": {"ay": "ै", "aw": "ौ"},
 "ID": {"ay": "ऐ", "aw": "औ"},
 "virama": "्",
}
BEN = {
 # « ওয়া » et « য়া » : en bengali la semi-consonne porte la matra, une
 # base « ও » nue donnerait « ওা », qui ne se lit pas.
 "C": {"b": "ব", "t": "ত", "th": "স", "j": "জ", "ḥ": "হ", "kh": "খ",
       "d": "দ", "dh": "য", "r": "র", "z": "য", "s": "স", "sh": "শ",
       "ṣ": "স", "ḍ": "দ", "ṭ": "ত", "ẓ": "য", "'": "আ", "gh": "গ",
       "f": "ফ", "q": "ক", "k": "ক", "l": "ল", "m": "ম", "n": "ন",
       "h": "হ", "w": "ওয়", "y": "য়"},
 # La voyelle inherente du bengali est un « ô », pas un « a » : contrairement
 # au devanagari, le « a » bref arabe doit porter sa matra.
 "M": {"a": "া", "i": "ি", "u": "ু", "e": "ে", "o": "ো"},
 "ML": {"a": "া", "i": "ী", "u": "ূ", "e": "ে", "o": "ো"},
 "I": {"a": "আ", "i": "ই", "u": "উ", "e": "এ", "o": "ও"},
 "IL": {"a": "আ", "i": "ঈ", "u": "ঊ", "e": "এ", "o": "ও"},
 "D": {"ay": "ৈ", "aw": "ৌ"},
 "ID": {"ay": "ঐ", "aw": "ঔ"},
 "virama": "্",
}


def vers_indien(texte, T):
    out = []
    js = jetons(decoupe(texte))
    n = 0
    while n < len(js):
        j = js[n]
        if j[0] == "C":
            base = T["C"].get(j[1], "")
            suiv = js[n + 1] if n + 1 < len(js) else None
            # Le ayn n'a pas de lettre en devanagari ni en bengali. Suivi
            # d'une voyelle il s'efface derriere elle, qui prend alors sa
            # forme independante — « 'uqdatan » donne उ, non अ + matra de u.
            # Sans voyelle derriere, il disparait : une consonne nue y
            # ecrirait अ्, qui ne se lit pas.
            if j[1] == "'":
                if suiv and suiv[0] == "V":
                    out.append((T["IL"] if suiv[2] else T["I"])[suiv[1]])
                    n += 2
                elif suiv and suiv[0] == "D":
                    out.append(T["ID"][suiv[1]])
                    n += 2
                else:
                    n += 1
                continue
            if suiv and suiv[0] == "V":
                out.append(base + (T["ML"] if suiv[2] else T["M"])[suiv[1]])
                n += 2
                continue
            if suiv and suiv[0] == "D":
                out.append(base + T["D"][suiv[1]])
                n += 2
                continue
            out.append(base + T["virama"])       # consonne nue
            n += 1
            continue
        if j[0] == "V":
            out.append((T["IL"] if j[2] else T["I"])[j[1]])
        elif j[0] == "D":
            out.append(T["ID"][j[1]])
        else:
            out.append(j[1])
        n += 1
    return "".join(out)


# ── Katakana (japonais) ──────────────────────────────────────────────────
# Ecriture syllabique : il faut une voyelle apres chaque consonne. Une
# consonne en fin de syllabe prend donc une voyelle d'appui, sauf « n »
# qui a son propre signe, et une consonne doublee devient un petit tsu.
KANA = {
 "b":  {"a": "バ", "i": "ビ", "u": "ブ", "e": "ベ", "o": "ボ"},
 "t":  {"a": "タ", "i": "ティ", "u": "トゥ", "e": "テ", "o": "ト"},
 "ṭ":  {"a": "タ", "i": "ティ", "u": "トゥ", "e": "テ", "o": "ト"},
 "th": {"a": "サ", "i": "スィ", "u": "ス", "e": "セ", "o": "ソ"},
 "j":  {"a": "ジャ", "i": "ジ", "u": "ジュ", "e": "ジェ", "o": "ジョ"},
 "ḥ":  {"a": "ハ", "i": "ヒ", "u": "フ", "e": "ヘ", "o": "ホ"},
 "h":  {"a": "ハ", "i": "ヒ", "u": "フ", "e": "ヘ", "o": "ホ"},
 "kh": {"a": "ハ", "i": "ヒ", "u": "フ", "e": "ヘ", "o": "ホ"},
 "d":  {"a": "ダ", "i": "ディ", "u": "ドゥ", "e": "デ", "o": "ド"},
 "ḍ":  {"a": "ダ", "i": "ディ", "u": "ドゥ", "e": "デ", "o": "ド"},
 "dh": {"a": "ザ", "i": "ズィ", "u": "ズ", "e": "ゼ", "o": "ゾ"},
 "z":  {"a": "ザ", "i": "ズィ", "u": "ズ", "e": "ゼ", "o": "ゾ"},
 "ẓ":  {"a": "ザ", "i": "ズィ", "u": "ズ", "e": "ゼ", "o": "ゾ"},
 "r":  {"a": "ラ", "i": "リ", "u": "ル", "e": "レ", "o": "ロ"},
 "s":  {"a": "サ", "i": "スィ", "u": "ス", "e": "セ", "o": "ソ"},
 "ṣ":  {"a": "サ", "i": "スィ", "u": "ス", "e": "セ", "o": "ソ"},
 "sh": {"a": "シャ", "i": "シ", "u": "シュ", "e": "シェ", "o": "ショ"},
 "gh": {"a": "ガ", "i": "ギ", "u": "グ", "e": "ゲ", "o": "ゴ"},
 "f":  {"a": "ファ", "i": "フィ", "u": "フ", "e": "フェ", "o": "フォ"},
 "q":  {"a": "カ", "i": "キ", "u": "ク", "e": "ケ", "o": "コ"},
 "k":  {"a": "カ", "i": "キ", "u": "ク", "e": "ケ", "o": "コ"},
 "l":  {"a": "ラ", "i": "リ", "u": "ル", "e": "レ", "o": "ロ"},
 "m":  {"a": "マ", "i": "ミ", "u": "ム", "e": "メ", "o": "モ"},
 "n":  {"a": "ナ", "i": "ニ", "u": "ヌ", "e": "ネ", "o": "ノ"},
 "w":  {"a": "ワ", "i": "ウィ", "u": "ウ", "e": "ウェ", "o": "ウォ"},
 "y":  {"a": "ヤ", "i": "イ", "u": "ユ", "e": "イェ", "o": "ヨ"},
 "'":  {"a": "ア", "i": "イ", "u": "ウ", "e": "エ", "o": "オ"},
}
# Voyelle d'appui d'une consonne sans voyelle, choisie pour rester lisible.
APPUI = {"t": "o", "ṭ": "o", "d": "o", "ḍ": "o", "j": "u", "sh": "u",
         "ch": "u", "k": "u", "q": "u", "g": "u"}
KANA_V = {"a": "ア", "i": "イ", "u": "ウ", "e": "エ", "o": "オ"}
KANA_D = {"ay": "アイ", "aw": "アウ"}


def vers_ja(texte):
    js = jetons(decoupe(texte))
    out = []
    n = 0
    while n < len(js):
        j = js[n]
        if j[0] == "C":
            c = j[1]
            suiv = js[n + 1] if n + 1 < len(js) else None
            # Consonne doublee : petit tsu. Sauf n et m, dont la geminee
            # passe par le signe nasal — アッラーフンマ, pas フムマ.
            if suiv and suiv[0] == "C" and suiv[1] == c:
                out.append("ン" if c in "nm" else "ッ")
                n += 1
                continue
            table = KANA.get(c)
            if not table:
                out.append(j[1])
                n += 1
                continue
            if suiv and suiv[0] == "V":
                out.append(table[suiv[1]] + ("ー" if suiv[2] else ""))
                n += 2
                continue
            if suiv and suiv[0] == "D":
                out.append(table["a"] + ("イ" if suiv[1] == "ay" else "ウ"))
                n += 2
                continue
            # Le « h » final d'un mot ne se rend pas en japonais : la voyelle
            # longue qui precede le porte deja. « Allāh » donne アッラー, non
            # アッラフ ; « Bismi-llāh » donne ビスミ・ッラー.
            if c == "h" and (suiv is None or suiv[0] in "|~") \
                    and n and js[n - 1][0] == "V" and js[n - 1][2]:
                n += 1
                continue
            if c == "n":
                out.append("ン")            # le seul son en coda du japonais
            elif c == "m":
                out.append("ム")            # ハムド, non ハンド
            else:
                out.append(table[APPUI.get(c, "u")])
            n += 1
            continue
        if j[0] == "V":
            out.append(KANA_V[j[1]] + ("ー" if j[2] else ""))
        elif j[0] == "D":
            out.append(KANA_D[j[1]])
        elif j[0] == "|":
            # « ・ » pour le trait d'union, qui lie deux mots ; une espace
            # ordinaire entre les mots. L'espace ideographique, elle, est si
            # large qu'elle disloquait la ligne.
            out.append("・" if j[1] == "-" else " ")
        else:
            out.append(j[1])
        n += 1
    return re.sub(r" +", " ", "".join(out)).strip()


# ── Pinyin (chinois) ─────────────────────────────────────────────────────
# Le lecteur chinois lit le pinyin ; on reste donc en lettres latines, mais
# avec les valeurs du pinyin et non celles de la romanisation savante.
ZH_C = {"b": "b", "t": "t", "th": "s", "j": "j", "ḥ": "h", "kh": "h",
        "d": "d", "dh": "z", "r": "r", "z": "z", "s": "s", "sh": "sh",
        "ṣ": "s", "ḍ": "d", "ṭ": "t", "ẓ": "z", "'": "'", "gh": "g",
        "f": "f", "q": "k", "k": "k", "l": "l", "m": "m", "n": "n",
        "h": "h", "w": "w", "y": "y"}
ZH_V = {"a": "a", "i": "i", "u": "u", "e": "e", "o": "o"}
ZH_VL = {"a": "ā", "i": "ī", "u": "ū", "e": "ē", "o": "ō"}


def vers_zh(texte):
    out = []
    for j in jetons(decoupe(texte)):
        if j[0] == "C":
            out.append(ZH_C.get(j[1], j[1]))
        elif j[0] == "V":
            out.append((ZH_VL if j[2] else ZH_V)[j[1]])
        elif j[0] == "D":
            out.append("ai" if j[1] == "ay" else "ao")
        else:
            out.append(j[1])
    return "".join(out)


# Le nom divin s'ecrit « Allah » dans les donnees, sans macron : la regle du
# « h » final ne s'y applique pas et la conversion rendait アッラフ. Il est
# trop frequent pour qu'on le laisse mal ecrit, et chaque ecriture a de
# toute facon sa forme recue.
EXCEPTIONS = {
    "allah":  {"ru": "Аллах", "hi": "अल्लाह", "bn": "আল্লাহ",
               "ja": "アッラー", "zh": "Allāh"},
    "allāh":  {"ru": "Аллах", "hi": "अल्लाह", "bn": "আল্লাহ",
               "ja": "アッラー", "zh": "Allāh"},
}


def _exception(texte, code):
    return EXCEPTIONS.get(texte.strip().lower(), {}).get(code)


ECRITURES = {
    "ru": vers_ru,
    "hi": lambda s: vers_indien(s, DEV),
    "bn": lambda s: vers_indien(s, BEN),
    "ja": vers_ja,
    "zh": vers_zh,
}


# ── Sortie ───────────────────────────────────────────────────────────────
def lire_etapes():
    """Phonetique des etapes de routine, indexee par le slug du titre.

    Meme probleme que pour les invocations : la ligne phonetique des adhkar
    du matin s'affichait en romanisation savante sous une interface
    japonaise. Meme cle que rtx.* pour rester en phase avec le titre."""
    src = (ROOT / "js/data/routines.js").read_text(encoding="utf-8")
    out = {}
    for bloc in re.findall(r"\{[^{}]*\bph\s*:[^{}]*\}", src, re.S):
        def champ(nom):
            m = re.search(nom + r"\s*:\s*(['\"])((?:\\.|(?!\1).)*)\1", bloc, re.S)
            return m.group(2).replace("\\'", "'") if m else ""
        titre, ph = champ("title"), champ("ph")
        if titre and ph:
            out[_slug(titre)] = ph
    return out


def _slug(s):
    """Meme calcul que routines.js, pour que les cles se correspondent."""
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return re.sub(r"-{2,}", "-", s)[:34]


def lire_asma():
    """Translitteration des 99 Noms, indexee par leur numero.

    « Ar-Rahmân » en lettres latines pose la meme difficulte que la ligne
    phonetique des invocations : un lecteur japonais ne le lit pas."""
    d = json.loads((ROOT / "content/books/asma.json").read_text(encoding="utf-8"))
    return {f"asma.{x['n']}": x["tr"] for x in d["names"] if x.get("tr")}


def lire_duas():
    src = (ROOT / "js/data/duas.js").read_text(encoding="utf-8")
    blocs, prof, deb = [], 0, None
    for i, c in enumerate(src):
        if c == "{":
            if prof == 0:
                deb = i
            prof += 1
        elif c == "}":
            prof -= 1
            if prof == 0 and deb is not None:
                blocs.append(src[deb:i + 1]); deb = None

    def champ(b, nom):
        m = re.search(nom + r"\s*:\s*(['\"])((?:\\.|(?!\1).)*)\1", b, re.S)
        return m.group(2).replace("\\'", "'") if m else ""

    out = []
    for b in blocs:
        i, p = champ(b, "id"), champ(b, "phonetic")
        if i and p:
            out.append((i, p))
    return out


DEMO = ["Allāhumma", "Bismi-llāh", "Al-ḥamdu liLlāhi", "Labbayka-llāhumma",
        "Subḥāna-llāhi wa bi-ḥamdihi", "Astaghfiru-llāh", "Ghufrānak"]


def main():
    if "--demo" in sys.argv:
        for mot in DEMO:
            print(f"\n{mot}")
            for code, f in ECRITURES.items():
                print(f"   {code}  {f(mot)}")
        return 0

    duas = lire_duas()
    if "--duas" in sys.argv:
        for did, ph in duas:
            print(f"\n── {did}\n   __  {ph}")
            for code, f in ECRITURES.items():
                print(f"   {code}  {f(ph)}")
        return 0

    if "--write" in sys.argv:
        etapes, asma = lire_etapes(), lire_asma()
        table = {}
        for code, f in ECRITURES.items():
            g = lambda v, c=code, f=f: _exception(v, c) or f(v)
            table[code] = {**{did: g(ph) for did, ph in duas},
                           **{f"rtx.{k}": g(v) for k, v in etapes.items()},
                           **{k: g(v) for k, v in asma.items()}}
        corps = ",\n".join(
            f"  {code}: " + json.dumps(t, ensure_ascii=False, indent=2)
            .replace("\n", "\n  ")
            for code, t in table.items())
        entete = (
            "/* SAKINA — Phonetique des invocations, par ecriture.\n"
            "   Genere par scripts/duas_translit.py depuis la romanisation savante\n"
            "   de js/data/duas.js. Ne pas modifier a la main : corriger la\n"
            "   regle dans duas_translit.py et regenerer, sinon la correction ne\n"
            "   vaut que pour une invocation au lieu des trente-sept.\n\n"
            "   L'arabe, le persan et l'ourdou sont absents a dessein : ils\n"
            "   lisent deja l'alphabet du texte affiche au-dessus. */\n")
        (ROOT / "js/data/phonetics.js").write_text(
            entete + "export const PHONETICS={\n" + corps + "\n};\n",
            encoding="utf-8")
        print(f"js/data/phonetics.js — {len(ECRITURES)} écritures × "
              f"{len(duas)} invocations et {len(etapes)} étape(s) de routine")
        return 0

    print(__doc__)
    return 0


if __name__ == "__main__":
    sys.exit(main())
