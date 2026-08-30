#!/usr/bin/env python3
"""Vérifications d'intégrité de Sakina — à lancer avant chaque commit.

    python scripts/check.py

Le projet n'a ni build ni bundler : rien ne signale un chemin cassé. Le cas
le plus sournois est la liste SHELL du service worker, car un fichier
manquant y fait échouer l'installation **en silence** — l'application perd
le hors-ligne sans qu'aucune erreur n'apparaisse.

Ce script attrape cette classe de fautes :

  1. entrées SHELL / CORPUS du service worker introuvables
  2. imports ES qui ne résolvent vers aucun fichier
  3. getElementById(...) visant un identifiant qui n'existe nulle part
  4. variable locale « t » masquant la fonction de traduction
  5. clés data-i18n absentes du dictionnaire
  6. traductions déclarées sans fichier de corpus, et l'inverse
  7. livres du registre sans JSON, et l'inverse

Sortie : 0 si tout va bien, 1 sinon.
"""
import json
import os
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
ERRORS: list[str] = []
NOTES: list[str] = []


def read(rel: str) -> str:
    return (ROOT / rel).read_text(encoding="utf-8")


def js_files() -> list[Path]:
    return sorted(ROOT.glob("js/**/*.js"))


# ── 1. Service worker : SHELL et CORPUS ──────────────────────────────────
def check_service_worker() -> None:
    sw = read("sw.js")
    listed = 0
    for block in ("SHELL", "CORPUS"):
        m = re.search(rf"const {block}\s*=\s*\[(.*?)\];", sw, re.S)
        if not m:
            ERRORS.append(f"sw.js : liste {block} introuvable")
            continue
        for path in re.findall(r"'\./([^']+)'", m.group(1)):
            listed += 1
            if not (ROOT / path).exists():
                ERRORS.append(f"sw.js [{block}] : « {path} » n'existe pas")
    # './' seul désigne index.html, déjà couvert
    NOTES.append(f"service worker : {listed} fichiers précachés vérifiés")

    # Tout module atteignable depuis app.js doit être précaché, sinon
    # l'application se charge en ligne mais casse hors connexion.
    shell = set(re.findall(r"'\./([^']+)'", sw))
    seen: set[Path] = set()
    stack = [ROOT / "js/app.js"]
    while stack:
        f = stack.pop()
        if f in seen or not f.exists():
            continue
        seen.add(f)
        for spec in re.findall(
            r"^\s*import\s+.*?from\s+['\"](\.[^'\"]+)['\"]", f.read_text(encoding="utf-8"), re.M
        ):
            stack.append((f.parent / spec).resolve())
    for f in sorted(seen):
        rel = f.relative_to(ROOT).as_posix()
        if rel not in shell:
            ERRORS.append(f"sw.js : « {rel} » est importé mais absent de SHELL (casse le hors-ligne)")
    NOTES.append(f"graphe de modules : {len(seen)} atteignables depuis app.js")

    # Les dictionnaires de langue sont importés dynamiquement : le graphe
    # statique ne les voit pas, il faut les vérifier à part.
    langs = sorted(ROOT.glob("js/i18n/*.js"))
    for p in langs:
        rel = p.relative_to(ROOT).as_posix()
        if rel not in shell:
            ERRORS.append(f"sw.js : « {rel} » absent de SHELL (langue indisponible hors ligne)")
    NOTES.append(f"dictionnaires de langue : {len(langs)} précachés")


# ── 2. Imports ES ────────────────────────────────────────────────────────
def check_imports() -> None:
    n = 0
    for f in js_files():
        src = f.read_text(encoding="utf-8")
        for spec in re.findall(r"^\s*import\s+.*?from\s+['\"](\.[^'\"]+)['\"]", src, re.M):
            n += 1
            target = (f.parent / spec).resolve()
            if not target.exists():
                ERRORS.append(f"{f.relative_to(ROOT)} : import « {spec} » introuvable")
    NOTES.append(f"imports ES : {n} vérifiés")


# ── 3. Identifiants DOM ──────────────────────────────────────────────────
def check_dom_ids() -> None:
    # Deux pages servent du JS : l'application et la politique de
    # confidentialite, qui vit dans son propre onglet. Ne lire qu'index.html
    # faisait passer les identifiants de la seconde pour introuvables.
    html = chr(10).join(read(f) for f in ('index.html', 'privacy-policy.html'))
    ids = set(re.findall(r'id="([^"]+)"', html))
    for f in js_files():
        src = f.read_text(encoding="utf-8")
        ids |= set(re.findall(r"""\.id\s*=\s*['"]([\w-]+)['"]""", src))
        ids |= set(re.findall(r"""id=\\?["']([\w-]+)\\?["']""", src))

    n = 0
    for f in js_files():
        src = f.read_text(encoding="utf-8")
        for m in re.finditer(r"""(?:getElementById\(|\$\()['"]([\w-]+)['"]\)""", src):
            n += 1
            if m.group(1) not in ids:
                line = src[: m.start()].count("\n") + 1
                ERRORS.append(
                    f"{f.relative_to(ROOT)}:{line} : identifiant « {m.group(1)} » introuvable"
                )
    NOTES.append(f"identifiants DOM : {n} références vérifiées")


# ── 4. Clés i18n ─────────────────────────────────────────────────────────
CALL_T = re.compile(r"""(?<![\w.$])t\(\s*['"`]""")   # t('cle') — pas obj.t(…)


def _block_from(src: str, i: int) -> str | None:
    """Le bloc « { … } » qui commence au premier caractère non blanc après i."""
    while i < len(src) and src[i].isspace():
        i += 1
    if i >= len(src) or src[i] != "{":
        return None
    depth = 0
    for j in range(i, len(src)):
        if src[j] == "{":
            depth += 1
        elif src[j] == "}":
            depth -= 1
            if depth == 0:
                return src[i : j + 1]
    return src[i:]


def _enclosing_block(src: str, i: int) -> str:
    """Le bloc « { … } » le plus proche qui entoure la position i."""
    depth = 0
    for j in range(i, -1, -1):
        if src[j] == "}":
            depth += 1
        elif src[j] == "{":
            if depth == 0:
                return _block_from(src, j) or src
            depth -= 1
    return src


def check_t_shadowing() -> None:
    """`t` est la fonction de traduction. Une variable locale du même nom la
    masque, et l'appel `t('cle')` lève « t is not a function » à l'exécution
    — sans que rien ne le signale au chargement. Le piège s'est présenté
    trois fois (thèmes, titres, traductions du Coran).

    Un `t` local n'est fautif que si sa portée appelle vraiment t() : les
    `arr.map(t=>t.id)` d'une seule ligne sont inoffensifs et signaler tout
    homonyme noierait les vrais cas."""
    decl = re.compile(
        r"(?:const|let|var)\s+t\s*=(?!=)"       # const t = …
        r"|\(\s*t\s*(?:,\s*[\w{}\[\]. ]+)*\)\s*=>"  # (t) => / (t, i) =>
        r"|(?<![\w.$])t\s*=>"                    # t => …
    )
    n = 0
    for f in sorted(ROOT.glob("js/**/*.js")):
        if f.parent.name == "i18n":
            continue
        src = f.read_text(encoding="utf-8")
        if not CALL_T.search(src):
            continue                            # ce fichier n'appelle pas t()
        for m in decl.finditer(src):
            if m.group().rstrip().endswith("=>"):
                # Corps entre accolades, sinon expression jusqu'au bout de la ligne.
                eol = src.find("\n", m.end())
                scope = _block_from(src, m.end()) or src[m.end() : eol if eol > 0 else len(src)]
            else:
                scope = _enclosing_block(src, m.start())
            if not CALL_T.search(scope):
                continue
            n += 1
            ERRORS.append(
                f"{f.relative_to(ROOT)}:{src[: m.start()].count(chr(10)) + 1} : « t » "
                f"redéfini dans une portée qui appelle t() — renommez la variable"
            )
    if not n:
        NOTES.append("aucune variable locale ne masque la fonction t()")


def check_t_imported() -> None:
    """Appeler t() sans l'importer lève « t is not defined » — mais seulement
    quand la ligne s'exécute. Une fonction rarement empruntée (ouvrir une
    routine, refuser la caméra) peut rester cassée des semaines sans que rien
    ne le signale au chargement. Le cas s'est présenté trois fois."""
    n = 0
    for f in js_files():
        # i18n.js *definit* t : il ne peut pas l'importer de lui-meme.
        if f.parent.name == "i18n" or f.as_posix().endswith("js/lib/i18n.js"):
            continue
        src = f.read_text(encoding="utf-8")
        if not CALL_T.search(src):
            continue
        if re.search(r"""import\s*\{[^}]*\bt\b[^}]*\}\s*from\s*['"][^'"]*lib/i18n\.js['"]""", src):
            continue
        line = src[: CALL_T.search(src).start()].count("\n") + 1
        n += 1
        ERRORS.append(
            f"{f.relative_to(ROOT)}:{line} : t() appele sans etre importe "
            f"— ajoutez import {{t}} from '.../lib/i18n.js'"
        )
    if not n:
        NOTES.append("t() est importe partout ou il est appele")


def check_duplicate_exports() -> None:
    """Deux `export const X` dans le même fichier lèvent « Identifier 'X' has
    already been declared » — le module entier ne se charge plus, et toute
    l'application avec lui. Le piège se tend quand on ajoute une constante
    sans voir qu'elle existe déjà cent lignes plus haut."""
    decl = re.compile(r"^export\s+(?:const|let|var|function|class)\s+(\w+)", re.M)
    n = 0
    for f in js_files():
        names: dict[str, int] = {}
        src = f.read_text(encoding="utf-8")
        for m in decl.finditer(src):
            line = src[: m.start()].count("\n") + 1
            if m.group(1) in names:
                n += 1
                ERRORS.append(
                    f"{f.relative_to(ROOT)}:{line} : « {m.group(1)} » deja exporte "
                    f"ligne {names[m.group(1)]} — le module ne se chargera pas"
                )
            else:
                names[m.group(1)] = line
    if not n:
        NOTES.append("aucun export en double")


def check_i18n() -> None:
    """Le français fait référence : toute clé utilisée doit y figurer, et la
    couverture des autres langues se mesure par rapport à lui."""
    def keys_of(path: Path) -> set[str]:
        # Le trait d'union fait partie des clés dérivées d'un slug
        # (dua.aisance-eloquence.t, rtx.1er-cycle-al-ikhlas…).
        return set(re.findall(r'^\s*"([\w.-]+)"\s*:', path.read_text(encoding="utf-8"), re.M))

    base = ROOT / "js/i18n/fr.js"
    if not base.exists():
        ERRORS.append("js/i18n/fr.js manquant : plus aucun repli de traduction")
        return
    ref = keys_of(base)
    used = set(re.findall(r'data-i18n(?:-html|-ph)?="([\w.-]+)"', read("index.html")))
    for k in sorted(used - ref):
        ERRORS.append(f"index.html : clé i18n « {k} » absente de js/i18n/fr.js")

    # Le manifeste, les fichiers et le catalogue doivent s'accorder : une
    # langue proposée sans dictionnaire provoque un 404 et une interface
    # à moitié traduite.
    manifest = ROOT / "js/i18n/index.js"
    if manifest.exists():
        declared = set(
            re.findall(r"'(\w{2})'", re.search(
                r"AVAILABLE_LANGS\s*=\s*\[(.*?)\]", manifest.read_text(encoding="utf-8"), re.S
            ).group(1))
        )
        on_disk = {p.stem for p in ROOT.glob("js/i18n/*.js")} - {"index"}
        for c in sorted(declared - on_disk):
            ERRORS.append(f"i18n/index.js : « {c} » annoncé mais js/i18n/{c}.js manquant")
        for c in sorted(on_disk - declared):
            NOTES.append(f"js/i18n/{c}.js présent mais absent de AVAILABLE_LANGS")
        catalog = set(re.findall(r"code:'(\w{2})'", read("js/data/catalog.js")))
        offered = declared & catalog
        NOTES.append(f"sélecteur : {len(offered)} langues proposées et traduites")

    # Parité stricte : une clé manquante retombe silencieusement sur le
    # français, ce qui donne une interface panachée que rien ne signale.
    # Une clé en trop est du poids mort, ou le vestige d'un renommage.
    for p in sorted(ROOT.glob("js/i18n/*.js")):
        if p.name in ("fr.js", "index.js"):   # référence, et manifeste
            continue
        src = p.read_text(encoding="utf-8")
        got = re.findall(r'^\s*"([\w.-]+)"\s*:', src, re.M)
        seen = set(got)
        missing = [k for k in sorted(ref) if k not in seen]
        # Certaines familles ont leur francais dans les donnees, pas dans
        # fr.js : les absentes de la reference y sont donc normales.
        #  · dut.*  traductions publiees d'invocations — aucune edition ne
        #    couvre les 18 langues, le repli sur le francais est voulu ;
        #  · rtx.* / rtn.*  libelles d'etapes de routine, dont le francais
        #    vit dans js/data/routines.js.
        hors_dico = ("dut.", "rtx.", "rtn.")
        extra = [k for k in sorted(seen - ref) if not k.startswith(hors_dico)]
        dup = sorted({k for k in seen if got.count(k) > 1})
        if missing:
            ERRORS.append(
                f"js/i18n/{p.name} : {len(missing)} clé(s) manquante(s) — "
                f"{', '.join(missing[:6])}{'…' if len(missing) > 6 else ''}"
            )
        if extra:
            NOTES.append(f"js/i18n/{p.name} : {len(extra)} clé(s) hors référence")
        if dup:
            ERRORS.append(f"js/i18n/{p.name} : clé(s) en double — {', '.join(dup[:6])}")
    NOTES.append(
        f"i18n : {len(ref)} clés en français, {len(used)} utilisées, "
        f"{len(list(ROOT.glob('js/i18n/*.js')))} langues"
    )


# ── 5. Corpus coraniques ─────────────────────────────────────────────────
def check_quran() -> None:
    reg = read("js/data/translations.js")
    declared = set(re.findall(r"code:'(\w+)'", reg))
    on_disk = {p.stem.replace("quran-", "") for p in ROOT.glob("content/quran/quran-*.json")}
    on_disk.discard("ar")  # le texte arabe n'est pas une traduction

    for c in sorted(declared - on_disk):
        ERRORS.append(f"translations.js : « {c} » déclaré mais content/quran/quran-{c}.json manquant")
    for c in sorted(on_disk - declared):
        NOTES.append(f"content/quran/quran-{c}.json présent mais non déclaré dans translations.js")

    if not (ROOT / "content/quran/quran-ar.json").exists():
        ERRORS.append("content/quran/quran-ar.json manquant : le lecteur n'a plus de texte arabe")

    # Les corpus moissonnes depuis le web gardent parfois leurs entites HTML.
    # Le rendu passe par textContent (quran.js), donc « &quot; » s'affiche en
    # toutes lettres. Reparable d'un coup : scripts/quran_entities.py --write
    ent = re.compile(r"&(?:[a-zA-Z][a-zA-Z0-9]{1,10}|#\d{1,6}|#x[0-9a-fA-F]{1,5});")
    for p in sorted(ROOT.glob("content/quran/quran-*.json")):
        n = len(ent.findall(p.read_text(encoding="utf-8")))
        if n:
            ERRORS.append(
                f"content/quran/{p.name} : {n} entité(s) HTML brute(s), affichées "
                f"telles quelles — python scripts/quran_entities.py --write"
            )

    NOTES.append(f"corpus : {len(declared)} traductions déclarées")


# ── 6. Livres ────────────────────────────────────────────────────────────
def check_books() -> None:
    src = read("js/data/books.js")
    for path in re.findall(r"(?:src|textSrc):'(content/books/[^']+)'", src):
        if not (ROOT / path).exists():
            ERRORS.append(f"books.js : « {path} » déclaré mais absent")

    # Les guides traduisibles existent en plusieurs fichiers — fruits.en.json
    # a cote de fruits.json — charges par la langue courante et non declares
    # dans BOOKS. Ce ne sont pas des orphelins.
    localise = re.compile(r"\.[a-z]{2}\.json$")
    for p in sorted(ROOT.glob("content/books/*.json")):
        if localise.search(p.name):
            continue
        rel = f"content/books/{p.name}"
        if rel not in src:
            NOTES.append(f"{rel} présent mais référencé nulle part dans books.js")
        try:
            json.loads(p.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            ERRORS.append(f"{rel} : JSON invalide ({e})")
    NOTES.append(f"livres : {len(list(ROOT.glob('content/books/*.json')))} JSON validés")



# ── 7 bis. Francais en dur dans l'affichage ──────────────────────────────
def check_i18n_leaks() -> None:
    """La regle qui manquait : aucun texte francais ecrit en dur dans
    js/features, js/core ou js/lib.

    Compter les cles manquantes ne suffisait pas. Le francais ne fuyait pas
    par des traductions absentes mais par du texte jamais confie au
    dictionnaire — une fonction qui traduit sa premiere ligne et oublie les
    six suivantes. Le francais vit dans js/data et js/i18n/fr.js ; ailleurs,
    il est une erreur."""
    sys.path.insert(0, str(ROOT / "scripts"))
    try:
        import i18n_leaks
    except Exception as e:
        ERRORS.append(f"i18n_leaks.py illisible ({e})")
        return
    finally:
        sys.path.pop(0)

    # La boucle vit dans i18n_leaks.scanner() et nulle part ailleurs.
    # Elle etait recopiee ici : elargir la liste des dossiers dans
    # l'outil ne changeait alors rien a la verification.
    trouvees = i18n_leaks.scanner()

    for chemin, ligne, val in trouvees[:8]:
        ERRORS.append(f"{chemin}:{ligne} : français en dur — « {val[:60]} »")
    if len(trouvees) > 8:
        ERRORS.append(f"… et {len(trouvees)-8} autre(s) — python scripts/i18n_leaks.py")
    if not trouvees:
        NOTES.append("aucun français en dur dans le code d'affichage")


# ── 7 ter. Chaque livre a sa clé de titre ────────────────────────────────
def check_books_i18n() -> None:
    """« Comment faire la Salât » s'est affiche en francais dans les
    dix-sept langues parce qu'on avait ajoute le livre a BOOKS sans
    l'inscrire dans BOOK_I18N. La table doit couvrir le catalogue."""
    data = read("js/data/books.js")
    vue = read("js/features/books.js")
    livres = set(re.findall(r"^  (\w+)\s*:\s*\{", data, re.M))
    m = re.search(r"const BOOK_I18N=\{(.*?)\};", vue, re.S)
    if not m:
        ERRORS.append("books.js : table BOOK_I18N introuvable")
        return
    mappes = set(re.findall(r"(\w+)\s*:\s*'", m.group(1)))
    for k in sorted(livres - mappes):
        ERRORS.append(
            f"books.js : « {k} » est dans le catalogue mais pas dans "
            f"BOOK_I18N — son titre restera en français partout")
    NOTES.append(f"bibliothèque : {len(livres)} livres, tous avec leur clé de titre")


# ── 7 quinquies. Méthodes de calcul sans clé ─────────────────────────────
def check_calc_methods() -> None:
    """Le catalogue décrit quatorze méthodes de calcul ; neuf seulement
    avaient une clé de nom. « UOIF (France 12°) », « Diyanet (Türkiye) »,
    « Kemenag (Indonesia) », « JAKIM (Malaysia) » s'affichaient tels quels
    sous une interface japonaise, et personne ne pouvait le voir : ces
    champs vivent dans js/data/, où le français est autorisé.

    Tout n'a pas besoin d'une clé. « ISNA » est un sigle,
    « MoonsightingCommittee.com » un nom de domaine : justes dans les
    dix-huit langues, les traduire serait dix-huit fois la même chaîne à
    maintenir. La règle porte donc sur ce qui contient un mot d'une langue
    — un nom de pays, une phrase — et non sur les sigles."""
    cat = read("js/data/catalog.js")
    fr = read("js/i18n/fr.js")
    # Un jeton unique qui est un sigle, un domaine ou une marque se lit
    # pareil partout : ISNA, MoonsightingCommittee.com. Tout le reste — un
    # nom de pays, une phrase — doit avoir sa cle.
    marque = re.compile(r"^(?:[A-Z0-9]+|\S*\.\S+|\S*[a-z]\S*[A-Z]\S*)$")
    mot = re.compile(r"[A-Za-zÀ-ÿ]{3,}")
    manques = 0
    for m in re.finditer(r"\{id:(\d+),\s*name:'([^']*)',\s*desc:'([^']*)'", cat):
        ident, nom, desc = m.group(1), m.group(2), m.group(3)
        for champ, val, suff in (("nom", nom, "n"), ("description", desc, "d")):
            if marque.match(val) or not mot.search(val):
                continue          # sigle, domaine : bon dans toutes les langues
            if f'"cm.{ident}.{suff}"' in fr or f"'cm.{ident}.{suff}'" in fr:
                continue
            manques += 1
            ERRORS.append(
                f"catalog.js : méthode {ident} — {champ} « {val} » n'a pas de "
                f"clé cm.{ident}.{suff}, il restera en français partout")
    if not manques:
        NOTES.append("méthodes de calcul : chacune traduisible a sa clé")


# ── 7 sexies. Clés égarées dans un dictionnaire de langue ────────────────
def check_i18n_strays() -> None:
    """Une clé écrite dans un dictionnaire de langue mais absente du
    français n'est jamais lue : rien ne la demande. Elle ne casse rien —
    c'est le problème.

    Un outil d'apport a écrit huit invocations malaises sans leur préfixe
    « dut. », dans le mauvais dictionnaire de son fichier source. Il a
    annoncé « +8 clés » : il comptait les lignes préparées, pas les lignes
    arrivées. La vérification est passée au vert, l'application a continué
    d'afficher du français, et seul un comptage à la main l'a montré.

    Les traductions d'invocations (dut.*) vivent légitimement hors du
    français : leur original est dans js/data/duas.js. C'est la seule
    famille tolérée."""
    FAMILLES_HORS_FR = {"dut"}

    def cles(p: Path) -> set[str]:
        return set(re.findall(r'^\s*"([\w.-]+)"\s*:', p.read_text(encoding="utf-8"), re.M))

    base = ROOT / "js/i18n/fr.js"
    if not base.exists():
        return
    ref = cles(base)
    total = 0
    for p in sorted(ROOT.glob("js/i18n/*.js")):
        if p.stem in ("index", "fr"):
            continue
        egarees = sorted(
            k for k in cles(p) - ref
            if ("." not in k) or k.split(".")[0] not in FAMILLES_HORS_FR)
        for k in egarees[:4]:
            ERRORS.append(
                f"js/i18n/{p.name} : la clé « {k} » n'existe pas en français "
                f"et n'appartient à aucune famille de contenu — personne ne la lira")
        if len(egarees) > 4:
            ERRORS.append(f"js/i18n/{p.name} : … et {len(egarees)-4} autre(s)")
        total += len(egarees)
    if not total:
        NOTES.append("dictionnaires de langue : aucune clé égarée")


# ── 7 septies. Champ français du catalogue servi tel quel ────────────────
def check_books_raw() -> None:
    """Le catalogue des livres porte du français — c'est sa place, js/data/
    est le seul endroit où il a le droit d'exister. Mais il ne doit sortir à
    l'écran qu'enveloppé : bookTitle(), bookAuthor(), bookDesc(),
    bookSrcNote(), bookSearchPh(), qui vont tous chercher la traduction.

    Deux appels envoyaient `b.title` directement à l'en-tête de la feuille :
    « COMMENT FAIRE LA SALÂT » et « FAIRE LES ABLUTIONS » s'affichaient en
    français au-dessus d'un contenu japonais. Le détecteur de français en
    dur ne pouvait rien voir — ce n'est pas une chaîne littérale, c'est la
    lecture d'un champ.

    La règle : une ligne qui lit l'un de ces champs doit, sur la même ligne,
    le confier à tf() ou à l'une des enveloppes."""
    CHAMPS = ("title", "author", "desc", "srcNotes", "searchPh")
    src = read("js/features/books.js")
    fautes = 0
    for n, ligne in enumerate(src.split(chr(10)), 1):
        touche = [c for c in CHAMPS if re.search(r"\bb\.%s\b" % c, ligne)]
        if not touche:
            continue
        if "tf(" in ligne or re.search(r"\bbook[A-Z]\w*\(", ligne):
            continue
        fautes += 1
        ERRORS.append(
            f"js/features/books.js:{n} : « b.{touche[0]} » part à l'écran sans "
            f"passer par le dictionnaire — il restera en français partout")
    if not fautes:
        NOTES.append("livres : aucun champ du catalogue servi sans traduction")


# ── 7 octies. Assistant de démarrage redessiné à moitié ──────────────────
def check_onboarding_redraw() -> None:
    """L'assistant construit six grilles en JS ; changer de langue à sa
    première étape n'en redessinait que quatre. Les deux grilles de thèmes
    gardaient la langue du démarrage, et un lecteur japonais lisait
    « SOMBRES », « OR », « BRAISE » à l'étape suivante — alors que les
    traductions existaient.

    La cause n'était pas deux appels oubliés : c'était qu'il fallait tenir
    une liste à la main. Elle est maintenant dans redessine(), et cette
    règle vérifie qu'aucune fonction de construction ne lui échappe."""
    src = read("js/features/onboarding.js")
    m = re.search(r"function redessine\(\)\{(.*?)\n\}", src, re.S)
    if not m:
        ERRORS.append("onboarding.js : redessine() introuvable — "
                      "le redessin au changement de langue n'est plus centralisé")
        return
    corps = m.group(1)
    baties = set(re.findall("^function (build[A-Z][a-zA-Z]*)", src, re.M))
    oubliees = sorted(b for b in baties if b not in corps)
    for b in oubliees:
        ERRORS.append(
            f"onboarding.js : « {b}() » n'est pas appelée par redessine() — "
            f"ce qu'elle construit restera dans la langue du démarrage")
    if not oubliees:
        NOTES.append(f"assistant : {len(baties)} grille(s), toutes redessinées "
                     f"au changement de langue")


# ── 7 quater. Thèmes annoncés sans style ─────────────────────────────────
def check_themes() -> None:
    """Le catalogue annonce des récompenses, les tokens leur donnent leurs
    couleurs, et rien ne vérifiait que les deux listes se correspondent.

    Huit accents et huit ambiances étaient annoncés sans exister en CSS.
    Un accent sans règle retombe sur :root — « Ardoise », « Cuivre » et
    « Argent » affichaient tous de l'or. Une ambiance sans règle garde les
    tokens sombres alors qu'applyTheme peint déjà le fond avec la teinte
    annoncée : les six ambiances claires donnaient un texte clair sur fond
    clair."""
    sys.path.insert(0, str(ROOT / "scripts"))
    try:
        import theme_gaps
    except Exception as e:
        ERRORS.append(f"theme_gaps.py illisible ({e})")
        return
    finally:
        sys.path.pop(0)

    trous = theme_gaps.manquants()
    for libelle, attr, d in trous[:8]:
        ERRORS.append(
            f'catalog.js : {libelle} « {d} » est proposé mais {attr}="{d}" '
            f"n'existe dans aucun CSS")
    if len(trous) > 8:
        ERRORS.append(f"… et {len(trous)-8} autre(s) — python scripts/theme_gaps.py")
    if not trous:
        NOTES.append("thèmes, accents et skins : tous ceux proposés ont leur style")


# ── 8. Inventaire i18n ───────────────────────────────────────────────────
def check_i18n_inventory() -> None:
    """Le texte traduisible ne vit pas qu'en js/i18n/ : il vient aussi des
    donnees, ou les traductions se greffent par tf('cle', francais). Ce repli
    est silencieux — une cle absente affiche le francais sans rien signaler.
    C'est ce qui laissait passer des ecrans non traduits.

    scripts/i18n_scan.py denombre les trois gisements ; on verifie ici qu'aucun
    texte affichable n'echappe a la fois au dictionnaire et aux donnees."""
    sys.path.insert(0, str(ROOT / "scripts"))
    try:
        import i18n_scan
    except Exception as e:                       # outil casse : on le dit
        ERRORS.append(f"i18n_scan.py illisible ({e})")
        return
    finally:
        sys.path.pop(0)

    inv = i18n_scan.inventaire()
    orphelines = [k for k, v in inv.items() if not v["dans_fr"]]
    for k in sorted(orphelines)[:10]:
        ERRORS.append(
            f"i18n : « {k} » est affichee ({inv[k]['source']}) mais n'a de "
            f"texte ni dans fr.js ni dans les donnees"
        )
    if len(orphelines) > 10:
        ERRORS.append(f"i18n : … et {len(orphelines)-10} autre(s)")

    # Une cle sans objet dans une langue n'est pas une lacune : le sens d'une
    # invocation n'a pas a etre traduit en arabe.
    manques = {c: sum(1 for k in inv
                      if k not in i18n_scan.dico(c)
                      and not i18n_scan.sans_objet(c, k))
               for c in i18n_scan.LANGS}
    total = sum(manques.values())
    pire = max(manques.items(), key=lambda x: x[1])
    NOTES.append(
        f"inventaire i18n : {len(inv)} cles traduisibles, {total} traduction(s) "
        f"manquante(s) au total (max {pire[1]} en {pire[0]})"
    )


def main() -> int:
    for fn in (
        check_service_worker,
        check_imports,
        check_dom_ids,
        check_t_shadowing,
        check_t_imported,
        check_duplicate_exports,
        check_i18n,
        check_quran,
        check_books,
        check_books_i18n,
        check_i18n_leaks,
        check_calc_methods,
        check_i18n_strays,
        check_books_raw,
        check_onboarding_redraw,
        check_themes,
        check_i18n_inventory,
    ):
        try:
            fn()
        except Exception as e:  # une vérification cassée ne doit pas masquer les autres
            ERRORS.append(f"{fn.__name__} a échoué : {e}")

    for n in NOTES:
        print(f"  · {n}")
    print()
    if ERRORS:
        print(f"✗ {len(ERRORS)} problème(s) :\n")
        for e in ERRORS:
            print(f"    {e}")
        return 1
    print("✓ tout est cohérent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
