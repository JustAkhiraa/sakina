# -*- coding: utf-8 -*-
"""Ré-extraction de Riyad as-Salihin avec PyMuPDF. Verbatim : seuls en-têtes,
pieds de page et pagination sont retirés, aucun mot du texte n'est changé.

v5 corrige trois problèmes découverts par comparaison directe avec le PDF :
1. Le symbole de salutation (ﷺ) après « le Prophète »/« Messager de Dieu »
   n'est pas un caractère de police mais un DESSIN VECTORIEL (~470 segments,
   21.2×16.9pt) directement dans le flux de la page — invisible à toute
   extraction de texte classique. On le détecte géométriquement et on le
   réinjecte (U+FDFA) à la position exacte du mot qui le précède.
2. Le numéro+titre de chapitre était dupliqué en tête du corps du texte
   (déjà affiché séparément comme titre). Retiré.
3. Les citations coraniques d'introduction ("1 - Chapitre 98 verset 48…",
   "3.200 O vous qui avez cru…") ne recevaient pas de saut de paragraphe,
   contrairement au PDF source qui les sépare clairement.
"""
import re, json, io, os
from collections import defaultdict
import fitz

SRC = r'C:\Users\Aafif\Documents\Projets\tasbih\inspirations\pdf-sources\riyad-as-salihin-kechrid.pdf'
OUT = r'C:\Users\Aafif\Documents\Projets\tasbih\books\riyad.json'

doc = fitz.open(SRC)
SALUTATION = 'ﷺ'  # ﷺ

def is_salutation_icon(dr):
    r = dr['rect']
    items = dr.get('items', [])
    return dr['type'] == 's' and 400 <= len(items) <= 550 and 18 <= r.width <= 24 and 14 <= r.height <= 19

def page_text_with_salutation(page):
    """Reconstruit le texte brut de la page (identique à get_text()) en
    réinjectant le symbole ﷺ à la position du mot qui le précède.

    Balayage direct dans l'ordre de lecture (déjà garanti fidèle à
    get_text(), vérifié mot pour mot sur les 502 pages du livre) : pour
    chaque icône, on garde le DERNIER mot qui la précède, en testant soit un
    vrai chevauchement vertical (même ligne, mot situé avant elle en x) soit
    une ligne strictement antérieure. Ne PAS regrouper les mots par ligne au
    préalable : deux occurrences proches sur une même ligne visuelle peuvent
    provenir de blocs PDF différents (ex : citation imbriquée), et un
    regroupement par bloc/ligne les confond alors à tort sur un seul mot."""
    words = sorted(page.get_text('words'), key=lambda w: (w[5], w[6], w[7]))
    icons = [dr['rect'] for dr in page.get_drawings() if is_salutation_icon(dr)]

    after = defaultdict(int)
    prefix = 0
    for ic in icons:
        best_idx = None
        last_earlier_idx = None
        for idx, w in enumerate(words):
            x0, y0, x1, y1 = w[0], w[1], w[2], w[3]
            overlap = min(ic.y1, y1) - max(ic.y0, y0)
            if overlap > 1:
                if x1 <= ic.x0 + 2:
                    best_idx = idx
            elif y1 <= ic.y0 + 2:
                last_earlier_idx = idx
        if best_idx is None:
            best_idx = last_earlier_idx
        if best_idx is not None:
            after[best_idx] += 1
        else:
            prefix += 1

    plain = page.get_text()
    out = [SALUTATION + ' '] * prefix
    idx = 0
    for m in re.finditer(r'\S+|\s+', plain):
        tok = m.group()
        out.append(tok)
        if not tok.isspace():
            if after.get(idx):
                out.append((' ' + SALUTATION) * after[idx])
            idx += 1
    return ''.join(out), prefix

def clean_page(t):
    out = []
    for ln in t.split('\n'):
        s = ln.strip()
        if not s:
            out.append('')
            continue
        if s == 'Riyad as-Salihin': continue
        if s == 'http://riyad.fr.tc': continue
        if s == 'ssirde00@yahoo.fr': continue
        if re.match(r'^-\s*\d+\s*-$', s): continue
        out.append(ln.rstrip())
    return '\n'.join(out)

total_icons_placed = 0
total_unmatched = 0
pages = []
for p in doc:
    raw, unmatched = page_text_with_salutation(p)
    total_unmatched += unmatched
    pages.append(clean_page(raw))
total_icons_placed = sum(pg.count(SALUTATION) for pg in pages)
print('symboles ﷺ replacés:', total_icons_placed, '| reportés en tête de page (héritage de la page précédente):', total_unmatched)

start_page = next(i for i, t in enumerate(pages) if re.search(r'^\s*1\s*\n\s*La sincérité', t, re.M))
full = '\n'.join(pages[start_page:])
print('corps depuis la page', start_page, '| longueur:', len(full))

lines = full.split('\n')
STOP_WORDS = ('Dieu le', 'Les savants', 'Selon', "D'après", 'D’après', '«', 'Quand au', 'Il a été', 'Le Coran')

def looks_like_body(s):
    # Citations coraniques internes à un chapitre : "2 - Chapitre 78 verset 37..."
    # Elles commencent par un numéro elles aussi et se faisaient passer pour
    # de vrais titres de chapitre, avalant tout le contenu jusqu'au prochain
    # numéro "valide" — corruption des tout premiers chapitres du livre.
    if re.match(r"^-?\s*Chapitre\s+\d", s, re.I) or 'verset' in s[:40].lower():
        return True
    # Référence coranique sourate.verset en tête de ligne : "3.200 O vous..."
    # se faisait passer pour une suite de titre (ex : chapitres 3 et 16).
    if re.match(r'^\d{1,3}\.\d{1,3}\s', s):
        return True
    return bool(re.match(r'^(' + '|'.join(re.escape(w) for w in STOP_WORDS) + r')', s)) or \
           bool(re.match(r'^\d+\s*[-.]\s', s))

expected = 1
marks = []  # (li, body_start, n, title)
i = 0
n_lines = len(lines)
while i < n_lines:
    ln = lines[i].strip()
    m = re.match(r'^(\d{1,3})(?:\s+(.*))?$', ln)
    if m and ln:
        n = int(m.group(1))
        rest = (m.group(2) or '').strip()
        rest = re.sub(r'^' + str(n) + r'\s*[-.]\s*', '', rest)
        # certains titres utilisent un tiret comme séparateur ("118 - La
        # préférence...") au lieu d'un simple espace — tiret décoratif à
        # retirer, pas du contenu.
        rest = re.sub(r'^-\s*', '', rest)
        if n == expected or n == expected + 1:
            if n == expected + 1:
                print('  ! chapitre', expected, 'non détecté (introuvable), saut à', n)
            body_start = None
            if rest and not looks_like_body(rest):
                title = rest
                j = i + 1
                while j < n_lines and lines[j].strip() and not looks_like_body(lines[j].strip()) and len(title) < 140:
                    title += ' ' + lines[j].strip()
                    j += 1
                body_start = j
            elif not rest:
                title_lines = []
                j = i + 1
                while j < n_lines and lines[j].strip() and not looks_like_body(lines[j].strip()):
                    title_lines.append(lines[j].strip())
                    j += 1
                    if len(title_lines) >= 3: break
                title = ' '.join(title_lines)
                body_start = j
            else:
                title = None  # "rest" ressemble à du corps de texte -> faux positif, ignorer
            if title:
                title = re.sub(r'\s+', ' ', title).strip()[:180]
                marks.append((i, body_start, n, title))
                expected = n + 1
    i += 1

print('chapitres détectés:', len(marks), '| dernier:', marks[-1][2] if marks else '-')

def polish(chunk):
    chunk = re.sub(r'-\n(?=[a-zà-ü])', '', chunk)
    chunk = re.sub(r'\n(?=\d{1,4}\.\s)', '\n\n', chunk)
    # Chapitre 1 (et potentiellement d'autres) numérote ses hadiths avec un
    # tiret collé au chiffre ("1- Le calife...") plutôt qu'un point — ce
    # format n'a pas d'espace avant le tiret, contrairement aux citations
    # coraniques internes ("1 - Chapitre 98 verset 48"), donc aucun risque
    # de confusion avec elles.
    chunk = re.sub(r'\s*(?=\d{1,4}-\s[A-ZÀ-Ü])', '\n\n', chunk)
    # Citations coraniques d'introduction de chapitre : le PDF les sépare
    # par un saut de paragraphe, restitué ici.
    chunk = re.sub(r'\n(?=\d{1,3}\s*-\s*Chapitre\s+\d)', '\n\n', chunk)
    chunk = re.sub(r'\n(?=\d{1,3}\.\d{1,3}\s)', '\n\n', chunk)
    # BUG historique : cette règle ne protégeait que le PREMIER \n d'une
    # paire \n\n (via son propre lookbehind sur la ponctuation) ; le SECOND
    # \n, précédé du premier \n (pas de la ponctuation), n'était pas exclu
    # et se faisait donc avaler — détruisant silencieusement tout saut de
    # paragraphe fraîchement inséré ci-dessus (citations coraniques, etc.).
    # Masqué jusqu'ici pour les hadiths car le rendu (books.js) recrée ses
    # propres sauts de paragraphe indépendamment des numéros de hadith.
    chunk = re.sub(r'(?<![.:!?»\n])\n(?!\n)', ' ', chunk)
    chunk = re.sub(r'[ \t]{2,}', ' ', chunk)
    chunk = re.sub(r'\n{3,}', '\n\n', chunk)
    return chunk.strip()

chapters = []
for idx, (li, body_start, n, title) in enumerate(marks):
    end = marks[idx + 1][0] if idx + 1 < len(marks) else n_lines
    chunk = '\n'.join(lines[body_start:end])
    chapters.append({'n': n, 'title': title, 'text': polish(chunk)})

data = {
    'title': 'Riyad as-Salihin — Le Jardin des Vertueux',
    'author': 'Imam an-Nawawi · traduction Salaheddine Kechrid',
    'source': 'Édition numérique riyad.fr.tc — texte intégral reproduit tel quel',
    'chapters': chapters,
}
with io.open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)
print('écrit:', OUT, os.path.getsize(OUT) // 1024, 'KB |', len(chapters), 'chapitres')

allt = ' '.join(c['text'] for c in chapters)
bad = re.findall(r'(?:\b\w\s){3,}\w\b', allt)
print('séquences de lettres éclatées restantes:', len(bad))
for b in bad[:10]: print('  ', repr(b))

print('--- chap 1:', chapters[0]['title'])
print('--- chap 3:', next((c['title'] for c in chapters if c['n'] == 3), 'MANQUANT'))
print('--- chap 16:', next((c['title'] for c in chapters if c['n'] == 16), 'MANQUANT'))
print('--- chap 45:', next((c['title'] for c in chapters if c['n'] == 45), 'MANQUANT'))
print('--- chap 100:', next((c['title'] for c in chapters if c['n'] == 100), 'MANQUANT'))
print('--- dernier chapitre:', chapters[-1]['n'], chapters[-1]['title'][:80])
tot_chars = sum(len(c['text']) for c in chapters)
print('caractères de texte:', tot_chars)
print('occurrences ﷺ dans le JSON final:', allt.count(SALUTATION))
