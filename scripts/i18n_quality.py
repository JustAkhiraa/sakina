#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Audit de qualite des 18 dictionnaires.

check.py verifie qu'une cle existe partout. Il ne dit rien de ce qu'elle
contient. Ce script cherche les erreurs qui passent la parite :

  1. marqueurs      {n}, {km}… perdus ou inventes — casse le texte affiche
  2. ecriture       du latin dans une langue qui ne s'ecrit pas en latin
  3. non traduit    la valeur francaise recopiee telle quelle
  4. collisions     deux cles de sens different partageant une traduction
  5. balises        <strong>/<em> desequilibres dans les cles -html
  6. vides          chaine vide ou absurdement courte

Chaque famille a ses exceptions legitimes, declarees plus bas : « AMOLED »
est « AMOLED » partout, un sigle institutionnel ne se traduit pas, et une
langue peut legitimement reutiliser un mot court pour deux cles.
"""
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "js" / "i18n"

LANGS = ["en", "es", "ru", "bs", "ar", "tr", "fa", "ur", "hi", "bn",
         "id", "ms", "zh", "ja", "so", "sw", "ha"]

# Ecriture attendue : si aucun caractere de ce bloc n'apparait alors que la
# chaine contient du latin, c'est probablement du francais oublie.
SCRIPTS = {
    "ru": (r"[Ѐ-ӿ]", "cyrillique"),
    "ar": (r"[؀-ۿ]", "arabe"),
    "fa": (r"[؀-ۿ]", "arabe"),
    "ur": (r"[؀-ۿ]", "arabe"),
    "hi": (r"[ऀ-ॿ]", "devanagari"),
    "bn": (r"[ঀ-৿]", "bengali"),
    "zh": (r"[一-鿿]", "han"),
    "ja": (r"[぀-ヿ一-鿿]", "kana/kanji"),
}

# Valeurs identiques au francais qui le sont a bon droit : marques, sigles,
# noms propres, unites, termes techniques universels.
OK_SAME = {
    # Identiques en francais et en anglais, sans que rien manque :
    "Contact",
    "Note — S.{s}:{a}",
    "Juz' {n}",

    # Skins et themes : des noms, pas des mots
    "AMOLED", "Sakura", "Matrix", "Voxel", "Terminal", "Midgar", "Zellige",
    "Retro CRT", "Liquid Glass", "Neon Lime", "Copper Dawn", "Royal Cinzel",
    "Masjid", "Aqua", "Indigo", "Jade", "Rose", "Violet", "Cristal",
    # Chimie : nomenclature internationale
    "Agar-agar", "Ponceau 4R", "Sorbitol", "Mannitol", "Lactitol", "Pektin",
    # Methodes de calcul : sigles institutionnels
    "ISNA", "Diyanet (Türkiye)", "Kemenag (Indonesia)", "JAKIM (Malaysia)",
    "UOIF (France 12°)", "Moonsighting Committee", "Muslim World League",
    "Egyptian Authority", "Tehran (Iran)", "Gulf (Dubai)", "Umm al-Qura",
    "Qatar", "Kuwait", "Safar", "Rajab", "Ramadan",
    # Instruments et sons : noms internationaux
    "Gong", "Handpan", "Kalimba", "Marimba", "Tabla", "Chiptune", "8-bit",
    "Laser", "Modem 56k", "Digital", "Pulse", "Blip pixel", "Bip digital",
    # Tajwid : termes arabes techniques, jamais traduits
    "Ghunna", "Madd", "Qalqala",
    # Vocabulaire islamique passe tel quel dans les langues latines
    "Fajr", "Maghrib", "Salat", "Qibla", "Tasbih", "Kaaba",
    "dhikr", "dhikrs", "Dhikrs",
    "Iftar (Maghrib)", "Imsak (Suhoor)", "Riyad as-Salihin",
    "Omar Hisham Al-Arabi",
    # Mots que le francais partage avec l'anglais
    "Reset", "Session", "Sessions", "Navigation", "Volume", "Protection",
    "Routines", "Routines & Protection", "Note", "✏️ Notes", "📷 Scan",
    "📳 Vibration", "Avatars", "Skins", "Europe", "Favori", "Novice",
    "Patient", "Sage", "Chaste", "Intention & basmala",
    "Cycle 2/3", "Cycle 3/3", "{n} sections",
    "Hadiths", "Sections", "Sources", "Simple",
    # Auteurs : des noms de personnes
    "Sa'id ibn Ali ibn Wahf Al-Qahtani",
}
# Prefixes de cles dont la valeur peut legitimement etre identique partout
# « hds. » : les noms des recueils de hadith — Bukhari, Muslim, Abu Dawud,
# Tirmidhi, Ibn Hibban, al-Bayhaqi. Ce sont des noms propres : les traduire
# serait les rendre meconnaissables a qui cherche la reference.
OK_SAME_PREFIX = ("skn.", "add.E", "cm.", "hij.", "bth.", "dut.", "hds.")

# Cles dont le sens autorise une meme traduction (synonymes courts)
OK_COLLIDE = {"com.ok", "com.yes", "com.close", "com.done", "com.back",
              # « Ma série » et « Mes séries » ne se distinguent pas en
              # anglais, en indonésien ni en malais. La fusion est la
              # langue, pas une perte.
              "serie.mine", "serie.defaultName"}

# Le francais emploie parfois deux tournures pour une meme idee, la ou une
# autre langue n'en a qu'une. La fusion est alors correcte, pas une perte :
# on la declare plutot que de la signaler a chaque passage.
FR_SYNONYMS = [
    {"Réinitialiser", "Remettre à zéro", "Reset"},
    {"Désactivés", "Désactivé"},
    {"Activés", "Activé"},
    {"Suivant", "Prochain", "PROCHAINE"},
    {"Téléchargement…", "Chargement…"},
    {"Douas", "Invocations"},
    {"dhikrs", "dhikr"},
    {"⟳ Détection en cours…", "⟳ Recherche…"},
    {"Thème", "Ambiances"},
    {"Réglages", "Paramètres"},
    {"Références", "Sources"},
    {"Rappel", "Mémo", "Note"},
]

MARK = re.compile(r"\{(\w+)\}")
TAG = re.compile(r"</?(\w+)[^>]*>")
LATIN = re.compile(r"[A-Za-z]{4,}")


def parse(path):
    """Lit un dictionnaire JS : { "cle": "valeur", … }."""
    src = path.read_text(encoding="utf-8")
    out, i = {}, 0
    pat = re.compile(r'^[ \t]*"([\w.-]+)"[ \t]*:[ \t]*', re.M)
    for m in pat.finditer(src):
        j = m.end()
        if j >= len(src) or src[j] not in "\"'":
            continue
        q, j, buf = src[j], j + 1, []
        while j < len(src):
            c = src[j]
            if c == "\\":
                nxt = src[j + 1]
                buf.append({"n": "\n", "t": "\t"}.get(nxt, nxt))
                j += 2
                continue
            if c == q:
                break
            buf.append(c)
            j += 1
        out[m.group(1)] = "".join(buf)
    return out


def latin_ratio(s):
    letters = [c for c in s if c.isalpha()]
    if not letters:
        return 0.0
    return sum(1 for c in letters if "LATIN" in unicodedata.name(c, "")) / len(letters)


def main():
    limit = 200 if "--full" in sys.argv else 25
    only = next((a[7:] for a in sys.argv if a.startswith("--lang=")), None)
    fr = parse(I18N / "fr.js")
    print(f"reference : {len(fr)} cles\n")
    findings = defaultdict(list)

    for code in ([only] if only else LANGS):
        d = parse(I18N / f"{code}.js")

        for k, v in d.items():
            ref = fr.get(k)

            # 1 ── marqueurs
            if ref is not None:
                want, got = set(MARK.findall(ref)), set(MARK.findall(v))
                if want != got:
                    miss = ", ".join(sorted(want - got)) or "—"
                    extra = ", ".join(sorted(got - want)) or "—"
                    findings["marqueurs"].append(
                        f"{code} {k}: manque {{{miss}}}, en trop {{{extra}}}")

            # 5 ── balises
            if k.endswith("Html") or "<" in (ref or ""):
                if sorted(TAG.findall(ref or "")) != sorted(TAG.findall(v)):
                    findings["balises"].append(f"{code} {k}")

            # 6 ── vides
            if not v.strip():
                findings["vides"].append(f"{code} {k}")
            # La longueur se juge plus loin : comparer au francais n'a pas de
            # sens entre ecritures, le chinois disant en quatre signes ce que
            # le francais met vingt lettres a dire.

            # 3 ── non traduit
            if (ref is not None and v == ref and len(ref) > 3
                    and v not in OK_SAME
                    and not k.startswith(OK_SAME_PREFIX)
                    and re.search(r"[A-Za-z]", v)):
                findings["non-traduit"].append(f"{code} {k}: « {v[:56]} »")

            # 2 ── ecriture. Les marques et sigles s'ecrivent en latin
            # partout : AMOLED reste AMOLED en japonais.
            if (code in SCRIPTS and LATIN.search(v)
                    and v not in OK_SAME
                    and not k.startswith(OK_SAME_PREFIX)):
                block, name = SCRIPTS[code]
                if not re.search(block, v) and latin_ratio(v) > 0.6:
                    findings["ecriture"].append(
                        f"{code} {k}: aucun {name} — « {v[:52]} »")

        # ── longueurs : chaque langue a sa propre densite face au francais.
        # On calcule sa mediane, puis on ne signale que ce qui s'en ecarte
        # brutalement — une chaine tronquee, pas une langue concise.
        ratios = []
        for k, v in d.items():
            ref = fr.get(k)
            if ref and len(ref) >= 30 and v.strip():
                ratios.append(len(v) / len(ref))
        if ratios:
            ratios.sort()
            med = ratios[len(ratios) // 2]
            floor = med * 0.40
            for k, v in d.items():
                ref = fr.get(k)
                if not ref or len(ref) < 30 or not v.strip():
                    continue
                r = len(v) / len(ref)
                # « Salat qada » dit en deux mots ce que le francais met une
                # parenthese a expliquer : le terme est deja complet la-bas.
                if k == "row.qada" and code in ("id", "ms"):
                    continue
                if r < floor:
                    findings["tronquees"].append(
                        f"{code} {k}: ratio {r:.2f} contre {med:.2f} attendu "
                        f"— « {v[:44]} »")

        # 4 ── collisions
        rev = defaultdict(list)
        for k, v in d.items():
            if len(v) > 6 and not k.startswith(OK_SAME_PREFIX):
                rev[v].append(k)
        for v, ks in rev.items():
            if len(ks) < 2 or set(ks) <= OK_COLLIDE:
                continue
            frs = [fr.get(k, "") for k in ks]
            if len(set(frs)) < 2:
                continue          # le francais fusionne deja : pas une erreur
            # Deux libelles francais proches (« Méthode de calcul » ici,
            # « Méthode » la) fusionnent legitimement une fois traduits.
            # On ne signale que les sens franchement distincts.
            if any(set(frs) <= grp for grp in FR_SYNONYMS):
                continue          # tournures francaises declarees equivalentes

            def words(s):
                return {w for w in re.findall(r"\w{4,}", s.lower())}
            base = words(frs[0])
            if all(base & words(f) for f in frs[1:]):
                continue
            findings["collisions"].append(
                f"{code} {' = '.join(ks)} → « {v[:40] }»   "
                f"fr: {' | '.join(f[:26] for f in frs)}")

    order = ["marqueurs", "balises", "vides", "ecriture", "tronquees",
             "non-traduit", "collisions"]
    total = sum(len(findings[c]) for c in order)
    for cat in order:
        rows = findings[cat]
        if not rows:
            print(f"  · {cat} : rien")
            continue
        # repartition par langue : une anomalie concentree sur une seule
        # langue se lit differemment d'une anomalie repartie sur les 17
        per = defaultdict(int)
        for r in rows:
            per[r.split()[0]] += 1
        spread = " ".join(f"{c}:{n}" for c, n in sorted(per.items(),
                                                        key=lambda x: -x[1]))
        print(f"\n── {cat} : {len(rows)}   [{spread}]")
        for r in rows[:limit]:
            print(f"     {r}")
        if len(rows) > limit:
            print(f"     … et {len(rows)-limit} de plus")
    print(f"\n{total} anomalie(s)")
    return 1 if findings["marqueurs"] or findings["vides"] else 0


if __name__ == "__main__":
    sys.exit(main())
