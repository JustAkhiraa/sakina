#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ourdou : pourquoi il n'y a rien ici, et ce qu'il faudrait pour qu'il y ait.

Ce fichier n'ecrit aucune cle. Il existe pour qu'on ne refasse pas trois fois
le meme travail : les invocations ourdoues de Hisn al-Muslim n'ont pas ete
relevees parce qu'aucune edition disponible n'est lisible, et c'est mesure, pas
suppose.

Trois editions examinees, toutes des scans :

  · islamhouse, ur_Hisnul_Muslim.pdf — 128 pages, 0 caractere par page. C'est
    exactement le fichier deja present dans inspirations/docs trad/, octet pour
    octet (36 122 558). Inutile de le retelecharger.
        https://d1.islamhouse.com/data/ur/ih_books/single2/ur_Hisnul_Muslim.pdf
  · ur_Hisnul_Muslim_1436.pdf — 172 pages, 2 caracteres par page.
  · archive.org/details/hisnul-muslim-urdu — scan aussi, mais accompagne d'un
    chocr Tesseract 4.1.1 (lang=urd) au caractere pres, donc la meilleure
    chance qu'on ait eue.

Ce que dit la mesure sur ce chocr (scripts/sonder_hocr.py --langue ur) :
6 % de mots-outils bien formes, contre 17 % pour la prose ourdoue du depot
lui-meme. « نہیں » apparait trois fois dans un livre entier ; 39 % des jetons
font une ou deux lettres. Le nastaliq n'est pas lu : l'OCR pulverise les mots.

    ▸ PULVERISE — ne rien en tirer.

Une remarque qui vaut pour la suite : l'arabe vocalise du meme fichier, lui,
sort presque juste — l'ecriture naskh passe la ou le nastaliq echoue. Mais
l'arabe, l'application l'affiche deja ; ce n'est pas ce qui manque.

Ce qu'il faudrait : une edition ourdoue *nee numerique*, avec une vraie couche
texte — pas un scan. Le geste a faire avant toute chose, sur n'importe quel
fichier candidat :

    python scripts/sonder_pdf.py "le-fichier.pdf"

LISIBLE, DESORDONNE ou ENCODE : exploitable, on continue. SCAN : inutile
d'insister, l'OCR du nastaliq ne rendra rien.

Tant que ce fichier existe, ur.js porte neuf invocations — celles qui viennent
du corpus coranique, traduites dans l'edition ourdoue du Coran deja embarquee.
Les vingt-huit autres sont d'origine prophetique et resteront absentes. Une
invocation absente vaut mieux qu'une invocation fausse.
"""
import sys

sys.stdout.reconfigure(encoding="utf-8")


def main():
    print(__doc__.strip())


if __name__ == "__main__":
    main()
