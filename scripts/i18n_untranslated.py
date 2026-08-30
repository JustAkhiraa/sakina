#!/usr/bin/env python3
"""Inventaire des textes visibles non traduisibles.

    python scripts/i18n_untranslated.py

Deux façons pour un texte d'échapper à la traduction :

  1. dans index.html, un élément visible sans attribut data-i18n ;
  2. dans le JS, une chaîne écrite en dur qui atterrit dans le DOM
     (textContent, innerHTML, toast, placeholder…).

Le second cas est le plus sournois : aucune balise ne peut l'atteindre, et
rien ne le signale — la page s'affiche simplement dans la mauvaise langue.

Un gabarit `innerHTML` court sur dix lignes ; seule la première porte le nom
du puits. On capture donc l'expression entière affectée au puits, puis on en
extrait les morceaux littéraux (hors `${…}`) avant d'y chercher du français.
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent

# Un texte destiné à l'utilisateur : accent français, ou mot-outil français.
FRENCH = re.compile(
    r"[àâäéèêëîïôöùûüçœÀÂÉÈÊËÎÏÔÙÛÇ]"
    r"|\b(le|la|les|des|une|un|du|au|aux|vos|votre|pour|avec|sans|dans|sur"
    r"|est|sont|pas|plus|tout|tous|cette|ce|vers|par|non|oui|jours|mois)\b",
    re.I,
)
# Ce qui n'est pas du texte d'interface
# Balises dont le texte appartient au bloc qui les contient.
EN_LIGNE = {"strong", "em", "b", "i", "br", "small", "code",
            "sub", "sup", "u", "mark"}

SKIP = re.compile(
    r"^[\s\d.,:;%/\\|+*=<>~^&#@_'\"-]*$"        # ponctuation, nombres
    r"|^[a-z][a-z0-9-]*$"                        # identifiants, classes
    r"|^(https?:|data:|\./|\.\./|/)"             # chemins et URL
    r"|^[\w.-]+\.(js|json|css|html|png|svg|mp3)$"
    r"|^(rgba?|var|calc|translate|rotate|px|em|rem)\b",
    re.I,
)
# Attributs dont la valeur s'affiche, à garder quand on retire le balisage
TEXT_ATTRS = re.compile(r'\b(?:placeholder|title|alt|aria-label)="([^"$]{2,})"')

SINK = re.compile(
    r"(?:\.innerHTML|\.textContent|\.innerText|\.placeholder|\.value|\.label)\s*\+?="
    r"|\b(?:toast|confirmDlg|alert)\s*\("
)


def strip_comments(src: str) -> str:
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


def expression_at(src: str, i: int) -> str:
    """L'expression qui commence en i, jusqu'à la fin de l'instruction.

    Suit les imbrications et les chaînes pour ne pas s'arrêter sur un `;`
    ou une `)` qui se trouve à l'intérieur d'un gabarit."""
    depth = 0
    quote = None          # ', " ou ` en cours
    tpl_expr = 0          # profondeur des ${ … } dans un gabarit
    j = i
    while j < len(src):
        c = src[j]
        if quote:
            if c == "\\":
                j += 2
                continue
            if quote == "`" and c == "$" and src[j + 1 : j + 2] == "{":
                tpl_expr += 1
                j += 2
                continue
            if quote == "`" and c == "}" and tpl_expr:
                tpl_expr -= 1
            elif c == quote and not tpl_expr:
                quote = None
        elif c in "'\"`":
            quote = c
        elif c in "([{":
            depth += 1
        elif c in ")]}":
            if depth == 0:
                return src[i:j]
            depth -= 1
        elif c == ";" and depth == 0:
            return src[i:j]
        elif c == "\n" and depth == 0 and src[i:j].strip():
            return src[i:j]
        j += 1
    return src[i:j]


def literal_chunks(expr: str) -> list[str]:
    """Les morceaux de texte littéral d'une expression, `${…}` exclus."""
    out, i, n = [], 0, len(expr)
    while i < n:
        c = expr[i]
        if c not in "'\"`":
            i += 1
            continue
        quote, i = c, i + 1
        buf, tpl_expr = [], 0
        while i < n:
            c = expr[i]
            if c == "\\":
                buf.append(expr[i : i + 2])
                i += 2
                continue
            if quote == "`" and c == "$" and expr[i + 1 : i + 2] == "{":
                tpl_expr += 1
                i += 2
                continue
            if tpl_expr:
                if c == "{":
                    tpl_expr += 1
                elif c == "}":
                    tpl_expr -= 1
                i += 1
                continue
            if c == quote:
                i += 1
                break
            buf.append(c)
            i += 1
        out.append("".join(buf))
    return out


def visible_text(chunk: str) -> list[str]:
    """Le texte qu'un utilisateur lira : hors balises, plus les attributs
    dont la valeur s'affiche (placeholder, title…)."""
    parts = [v for v in TEXT_ATTRS.findall(chunk)]
    parts += re.split(r"<[^>]*>", chunk)
    return [p.strip() for p in parts if p.strip()]


def audit_js() -> dict[str, list[tuple[int, str]]]:
    out: dict[str, list[tuple[int, str]]] = {}
    for f in sorted(ROOT.glob("js/**/*.js")):
        if f.parent.name == "i18n":          # les dictionnaires eux-mêmes
            continue
        src = strip_comments(f.read_text(encoding="utf-8"))
        hits, seen = [], set()
        for m in SINK.finditer(src):
            expr = expression_at(src, m.end())
            line = src[: m.start()].count("\n") + 1
            for chunk in literal_chunks(expr):
                for text in visible_text(chunk):
                    if SKIP.match(text) or not FRENCH.search(text):
                        continue
                    if (line, text) in seen:
                        continue
                    seen.add((line, text))
                    hits.append((line, text[:70]))
        if hits:
            out[f.relative_to(ROOT).as_posix()] = sorted(hits)
    return out


def audit_html() -> list[tuple[int, str, str]]:
    """Tout texte visible d'index.html qu'aucune clé ne couvre.

    On ne se limite pas à une liste de classes : un paragraphe d'explication
    n'en porte aucune et resterait invisible à l'inventaire. On parcourt donc
    chaque bloc, en remontant à sa balise ouvrante pour savoir s'il est déjà
    marqué (`data-i18n`, `data-i18n-html`)."""
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = re.sub(r"<(script|style|svg)\b.*?</\1>", "", html, flags=re.S)
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)

    # Les balises en ligne ne coupent pas une phrase : on les efface pour que
    # « Le <strong>Qadâ'</strong> consiste… » compte comme un seul texte.
    INLINE = re.compile(r"</?(?:strong|em|b|i|span|br|small|code|sub|sup)\b[^>]*>")
    # `data-i18n-js` : le texte est pose par le script, qui passe par t().
    # Le francais du balisage n'est qu'un garde-fou si le JS ne tourne pas.
    # `data-i18n-js` : le texte est pose par le script, qui passe par t().
    # Sa valeur nomme la cle employee ; nu, il signale un texte compose
    # (un endonyme de langue, un assemblage de plusieurs cles).
    marked = re.compile(r"\bdata-i18n(?:-html|-ph)?\s*=|\bdata-i18n-js\b")
    out, seen = [], set()

    for m in re.finditer(r"<(\w+)([^>]*)>((?:[^<]|" + INLINE.pattern + r")+)<", html):
        tag, attrs, inner = m.group(1), m.group(2), m.group(3)
        if tag in ("script", "style", "option") and not inner.strip():
            continue
        text = INLINE.sub("", inner).replace("\n", " ").strip()
        text = re.sub(r"\s{2,}", " ", text)
        if len(text) < 2 or SKIP.match(text) or marked.search(attrs):
            continue
        # Une enveloppe dont le texte vient d'un descendant marque n'est
        # pas un manque : c'est la forme normale du balisage.
        if marked.search(inner):
            continue
        # Une balise en ligne non marquee n'a pas de texte a elle : il
        # appartient a son bloc, qui sera signale s'il manque un marquage.
        if tag in EN_LIGNE and not marked.search(attrs):
            continue
        if not FRENCH.search(text) and not re.search(r"[A-Za-zÀ-ÿ]{4}", text):
            continue
        line = html[: m.start()].count("\n") + 1
        cls = (re.search(r'class="([^"]+)"', attrs) or [None, tag])[1].split()[0]
        if (line, text) in seen:
            continue
        seen.add((line, text))
        out.append((line, cls, text[:70]))

    for m in re.finditer(r'placeholder="([^"]{2,120})"', html):
        line = html[: m.start()].count("\n") + 1
        head = html.rfind("<", 0, m.start())
        if marked.search(html[head : m.start()]) or "data-i18n-ph" in html[head : html.find(">", m.start())]:
            continue
        if not SKIP.match(m.group(1)):
            out.append((line, "placeholder", m.group(1)[:70]))
    return sorted(out)


def main() -> int:
    js = audit_js()
    html = audit_html()

    total_js = sum(len(v) for v in js.values())
    print(f"── JS : {total_js} chaînes françaises en dur atteignant l'écran ──\n")
    for f, hits in sorted(js.items(), key=lambda kv: -len(kv[1])):
        print(f"  {f}  ({len(hits)})")
        for line, txt in hits[:8]:
            print(f"      {line:>4}  {txt}")
        if len(hits) > 8:
            print(f"      … {len(hits)-8} de plus")
        print()

    print(f"── HTML : {len(html)} éléments visibles sans data-i18n ──\n")
    for line, cls, txt in html[:25]:
        print(f"  {line:>5}  [{cls}]  {txt}")
    if len(html) > 25:
        print(f"  … {len(html)-25} de plus")

    print(f"\n  TOTAL À TRAITER : {total_js + len(html)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
