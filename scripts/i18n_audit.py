#!/usr/bin/env python3
"""Inventaire des textes visibles non traduisibles.

    python scripts/i18n_audit.py

Deux façons pour un texte d'échapper à la traduction :

  1. dans index.html, un élément visible sans attribut data-i18n ;
  2. dans le JS, une chaîne écrite en dur qui atterrit dans le DOM
     (textContent, innerHTML, toast, placeholder…).

Le second cas est le plus sournois : aucune balise ne peut l'atteindre, et
rien ne le signale — la page s'affiche simplement dans la mauvaise langue.
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
    r"|est|sont|pas|plus|tout|tous|cette|ce|vers|par|non|oui)\b",
    re.I,
)
# Ce qui n'est pas du texte d'interface
SKIP = re.compile(
    r"^[\s\d.,:;%/\\|+*=<>~^&#@_-]*$"          # ponctuation, nombres
    r"|^[a-z][a-z0-9-]*$"                       # identifiants, classes
    r"|^(https?:|data:|\./|\.\./|/)"            # chemins et URL
    r"|^[\w.-]+\.(js|json|css|html|png|svg|mp3)$"
    r"|^(rgba?|var|calc|translate|rotate|px|em|rem)\b",
    re.I,
)


def strip_comments(src: str) -> str:
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


def audit_js() -> dict[str, list[tuple[int, str]]]:
    """Chaînes françaises en dur qui finissent à l'écran."""
    sinks = re.compile(
        r"(textContent\s*=|innerHTML\s*(?:=|\+=)|toast\(|placeholder\s*=|title\s*=|\.label\s*=)"
    )
    out: dict[str, list[tuple[int, str]]] = {}
    for f in sorted(ROOT.glob("js/**/*.js")):
        if f.parent.name == "i18n":          # les dictionnaires eux-mêmes
            continue
        raw = f.read_text(encoding="utf-8")
        src = strip_comments(raw)
        hits: list[tuple[int, str]] = []
        for m in re.finditer(r"""(['"`])((?:(?!\1)[^\\]|\\.){3,120})\1""", src):
            text = m.group(2)
            if SKIP.match(text) or not FRENCH.search(text):
                continue
            # Le texte doit atterrir dans le DOM : on regarde la ligne
            line_start = src.rfind("\n", 0, m.start()) + 1
            line = src[line_start : src.find("\n", m.end())]
            if not sinks.search(line):
                continue
            if "t(" in line and "data-i18n" in line:
                continue
            hits.append((src[: m.start()].count("\n") + 1, text[:70]))
        if hits:
            out[f.relative_to(ROOT).as_posix()] = hits
    return out


def audit_html() -> list[tuple[int, str, str]]:
    """Éléments d'interface visibles sans data-i18n."""
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = re.sub(r"<(script|style|svg)\b.*?</\1>", "", html, flags=re.S)
    out = []
    pat = re.compile(
        r'<(\w+)([^>]*\bclass="(?:row-name|row-sub|sl|sh-title|phd-title|phd-sub|ms-lbl|ob-\w+)"[^>]*)>([^<]{2,90})<'
    )
    for m in pat.finditer(html):
        attrs, text = m.group(2), m.group(3).strip()
        if "data-i18n" in attrs or not text or SKIP.match(text):
            continue
        line = html[: m.start()].count("\n") + 1
        cls = re.search(r'class="([^"]+)"', attrs).group(1)
        out.append((line, cls, text[:70]))
    return out


def main() -> int:
    js = audit_js()
    html = audit_html()

    total_js = sum(len(v) for v in js.values())
    print(f"── JS : {total_js} chaînes françaises en dur atteignant l'écran ──\n")
    for f, hits in sorted(js.items(), key=lambda kv: -len(kv[1])):
        print(f"  {f}  ({len(hits)})")
        for line, txt in hits[:6]:
            print(f"      {line:>4}  {txt}")
        if len(hits) > 6:
            print(f"      … {len(hits)-6} de plus")
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
