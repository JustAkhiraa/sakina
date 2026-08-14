#!/usr/bin/env python3
"""Inventaire complet des textes francais restants.

    python scripts/fr_inventory.py

i18n_audit.py ne regarde que ce qui atteint un puits DOM. Or une bonne part
du francais restant vit dans les DONNEES — noms de sons, de themes, libelles
de methodes de calcul, notes d'additifs — que l'interface affiche telles
quelles. Ce script balaie tout : sources JS (code et donnees) et index.html,
et regroupe par fichier pour qu'on puisse vider la liste methodiquement.

Il ne dit pas ce qu'il FAUT traduire — un nom propre (« Riyad as-Salihin »,
« Marimba ») n'a pas a l'etre. Il dit ce qui RESTE en francais, a trier.
"""
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent

# Marqueurs de francais : accent, ou mot-outil qui n'existe pas en anglais.
FRENCH = re.compile(
    r"[àâäéèêëîïôöùûüçœÀÂÉÈÊËÎÏÔÖÙÛÜÇŒ]"
    r"|\b(le|la|les|des|une|un|du|au|aux|vos|votre|notre|pour|avec|sans|dans"
    r"|sur|est|sont|pas|plus|tout|tous|toute|cette|ce|ces|vers|par|non|oui"
    r"|puis|donc|mais|chaque|entre|selon|depuis|jusqu|apres|avant|quand)\b",
    re.I,
)
SKIP = re.compile(
    r"^[\s\d.,:;%/\\|+*=<>~^&#@_'\"()\[\]{}-]*$"
    r"|^[a-z][a-z0-9_-]*$"
    r"|^(https?:|data:|\./|\.\./|/)"
    r"|^[\w.-]+\.(js|json|css|html|png|svg|mp3|webmanifest)$"
    r"|^(rgba?|var|calc|translate|rotate|repeat|linear-gradient)\b",
    re.I,
)


def strip_comments(src: str) -> str:
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"^\s*//.*$", "", src, flags=re.M)


def js_strings(src: str):
    """Chaque litteral de chaine, avec sa ligne. Les gabarits sont decoupes
    sur `${…}` : seules les parties fixes nous interessent."""
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        if c not in "'\"`":
            i += 1
            continue
        line = src[:i].count("\n") + 1
        quote, i = c, i + 1
        buf, depth = [], 0
        while i < n:
            c = src[i]
            if c == "\\":
                buf.append(c); buf.append(src[i + 1] if i + 1 < n else ""); i += 2; continue
            if quote == "`" and c == "$" and src[i + 1 : i + 2] == "{":
                yield line, "".join(buf); buf = []
                depth, i = 1, i + 2
                while i < n and depth:
                    if src[i] == "{": depth += 1
                    elif src[i] == "}": depth -= 1
                    i += 1
                continue
            if c == quote:
                i += 1; break
            buf.append(c); i += 1
        yield line, "".join(buf)


def scan_js():
    out = {}
    for f in sorted(ROOT.glob("js/**/*.js")):
        if f.parent.name == "i18n":
            continue
        src = strip_comments(f.read_text(encoding="utf-8"))
        hits, seen = [], set()
        for line, s in js_strings(src):
            s = s.strip()
            if len(s) < 3 or SKIP.match(s) or not FRENCH.search(s):
                continue
            if s in seen:
                continue
            seen.add(s)
            hits.append((line, s))
        if hits:
            out[f.relative_to(ROOT).as_posix()] = hits
    return out


def scan_html():
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = re.sub(r"<(script|style|svg)\b.*?</\1>", "", html, flags=re.S)
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    INLINE = re.compile(r"</?(?:strong|em|b|i|span|br|small|code|sub|sup)\b[^>]*>")
    marked = re.compile(r"\bdata-i18n(?:-html|-ph)?\s*=")
    out, seen = [], set()
    for m in re.finditer(r"<(\w+)([^>]*)>((?:[^<]|" + INLINE.pattern + r")+)<", html):
        attrs, inner = m.group(2), m.group(3)
        text = re.sub(r"\s{2,}", " ", INLINE.sub("", inner).replace("\n", " ").strip())
        if len(text) < 3 or SKIP.match(text) or marked.search(attrs) or not FRENCH.search(text):
            continue
        line = html[: m.start()].count("\n") + 1
        if text in seen:
            continue
        seen.add(text)
        out.append((line, text))
    for m in re.finditer(r'(?:placeholder|title|alt|aria-label)="([^"]{3,})"', html):
        head = html.rfind("<", 0, m.start())
        tail = html.find(">", m.start())
        if marked.search(html[head:tail]) or not FRENCH.search(m.group(1)):
            continue
        out.append((html[: m.start()].count("\n") + 1, "[attr] " + m.group(1)))
    return sorted(out)


def main() -> int:
    js, html = scan_js(), scan_html()
    total = sum(len(v) for v in js.values()) + len(html)
    print(f"── {total} textes français restants ──\n")
    for f, hits in sorted(js.items(), key=lambda kv: -len(kv[1])):
        print(f"  {f}  ({len(hits)})")
        for line, s in hits[:14]:
            print(f"      {line:>5}  {s[:78]}")
        if len(hits) > 14:
            print(f"      … {len(hits)-14} de plus")
        print()
    if html:
        print(f"  index.html  ({len(html)})")
        for line, s in html[:20]:
            print(f"      {line:>5}  {s[:78]}")
        if len(html) > 20:
            print(f"      … {len(html)-20} de plus")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
