#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""OCR des editions scannees de Hisn al-Muslim.

Deux des six editions fournies sont des images et non du texte :
en_Hisn_El_Muslim.pdf et sw_Kinga_Ya_Muislamu.pdf. extract_hisn.py ne peut
rien en tirer. On les passe donc par Tesseract, page par page.

Le rendu se fait a 300 DPI : en dessous, l'OCR confond les caracteres
proches sur ces scans ; au-dessus, le gain est nul et le temps double.
Seule la langue locale est reconnue — l'arabe de ces pages sert d'ancre
dans extract_hisn.py, pas de texte a lire, et le pack `ara` n'est pas
installe.

    python scripts/ocr_hisn.py en        # ecrit scripts/hisn_ocr_en.txt
    python scripts/ocr_hisn.py --list    # etat des editions et des packs
"""
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:
    sys.exit("PyMuPDF requis :  pip install pymupdf")

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
PDFS = ROOT / "inspirations" / "docs trad"

# Tesseract n'est pas dans le PATH sur cette machine : on le cherche la ou
# l'installeur UB-Mannheim le depose.
CANDIDATES = [
    Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe"),
    Path(r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"),
    Path.home() / "AppData/Local/Programs/Tesseract-OCR/tesseract.exe",
]

# Editions scannees : le PDF, et la langue Tesseract a employer.
# Les langues absentes d'ici ont du texte extractible — extract_hisn.py
# les lit directement, l'OCR n'a rien a leur apporter.
BOOKS = {
    "en": ("en_Hisn_El_Muslim.pdf", "eng"),
    "sw": ("sw_Kinga_Ya_Muislamu.pdf", "swa"),
    "ur": ("ur_Hisnul_Muslim.pdf", "urd"),
    "hi": ("risala_hi_hisnul-muslim_4.0.pdf", "hin"),
    "bn": ("risala_bn_hisn_almuslim.pdf", "ben"),
    "zh": ("risala_zh_hisn_new.pdf", "chi_sim"),
    "ru": ("ru_Dua_iz_korana_i_sunny.pdf", "rus"),
    "es": ("es_Muslim_bastion.pdf", "spa"),
    "tr": ("tr_Hisnul_Muslim.pdf", "tur"),
    "fa": ("fa_hisn_muslim.pdf", "fas"),
    "id": ("id_hisn_almuslim.pdf", "ind"),
    "ms": ("ms_hisn_muslim.pdf", "msa"),
}
DPI = 300

# Installer les packs dans Program Files demande les droits administrateur.
# On pointe donc Tesseract vers le depot tessdata tel qu'il a ete telecharge :
# --tessdata-dir accepte n'importe quel dossier, et celui-la porte les 129
# langues d'un coup.
TESSDATA = (Path(__file__).resolve().parent.parent
            / "inspirations/asset/tessdata-main/tessdata-main")


def tesseract():
    for p in CANDIDATES:
        if p.exists():
            return p
    from shutil import which
    w = which("tesseract")
    if w:
        return Path(w)
    sys.exit("tesseract introuvable — winget install UB-Mannheim.TesseractOCR")


def tessdata_args():
    return ["--tessdata-dir", str(TESSDATA)] if TESSDATA.is_dir() else []


def langs(exe):
    out = subprocess.run([str(exe), "--list-langs"] + tessdata_args(),
                         capture_output=True, text=True).stdout
    return {l.strip() for l in out.splitlines()[1:] if l.strip()}


def ocr_pdf(exe, pdf, lang, out_path):
    doc = fitz.open(pdf)
    n = doc.page_count
    zoom = DPI / 72
    mat = fitz.Matrix(zoom, zoom)
    chunks = []
    with tempfile.TemporaryDirectory() as tmp:
        img = Path(tmp) / "page.png"
        base = Path(tmp) / "page"
        for i in range(n):
            doc[i].get_pixmap(matrix=mat).save(img)
            subprocess.run([str(exe), str(img), str(base), "-l", lang,
                            "--psm", "6"] + tessdata_args(),
                           capture_output=True, check=False)
            txt = base.with_suffix(".txt")
            page = txt.read_text(encoding="utf-8", errors="replace") if txt.exists() else ""
            chunks.append(f"\n<<<PAGE {i}>>>\n{page}")
            if (i + 1) % 10 == 0 or i == n - 1:
                print(f"  {i+1}/{n} pages", flush=True)
    doc.close()
    out_path.write_text("".join(chunks), encoding="utf-8")
    return n


def main():
    exe = tesseract()
    have = langs(exe)
    if "--list" in sys.argv:
        print(f"tesseract : {exe}")
        print(f"packs     : {' '.join(sorted(have))}")
        for code, (name, lg) in BOOKS.items():
            p = PDFS / name
            print(f"  {code}: {name} — "
                  f"{'present' if p.exists() else 'ABSENT'}, "
                  f"pack {lg} {'ok' if lg in have else 'MANQUANT'}")
        return 0

    codes = [a for a in sys.argv[1:] if not a.startswith("-")] or list(BOOKS)
    for code in codes:
        name, lg = BOOKS[code]
        pdf = PDFS / name
        if not pdf.exists():
            print(f"{code}: {name} absent — ignore")
            continue
        if lg not in have:
            print(f"{code}: pack de langue « {lg} » non installe — ignore")
            continue
        out = ROOT / "scripts" / f"hisn_ocr_{code}.txt"
        print(f"{code}: OCR de {name} ({lg}) …")
        n = ocr_pdf(exe, pdf, lg, out)
        chars = len(out.read_text(encoding='utf-8'))
        print(f"{code}: {n} pages, {chars} caracteres -> {out.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
