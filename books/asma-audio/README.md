# Récitations des Noms d'Allah

Un fichier **MP3** par nom, nommé **`{numéro sur 3 chiffres}_{nom}.mp3`** — ainsi
les fichiers se trient par numéro tout en restant lisibles :

```
000_allah.mp3        → Allah (Nom suprême)
001_ar-rahman.mp3    → Ar-Rahmân   (nom n°1)
002_ar-rahim.mp3     → Ar-Rahîm    (nom n°2)
...
067_al-ahad.mp3      → Al-Ahad     (nom n°67)
099_as-sabur.mp3     → As-Sabûr    (nom n°99)
```

- La correspondance nom → fichier est le champ **`af`** de chaque nom dans
  `books/asma.json` (ex : `"af": "001_ar-rahman"`). Pour changer un fichier,
  il suffit d'aligner le nom du fichier et ce champ.
- Format **MP3** uniquement (universel, iOS inclus).
- L'app lit `books/asma-audio/{af}.mp3` au clic sur un nom ; hors-ligne grâce
  au service worker.

Récitations issues du dépôt MIT [MohammedAbidNafi/99-Names-of-Allah](https://github.com/MohammedAbidNafi/99-Names-of-Allah),
converties en MP3 (voir le bloc `audioSource` de `asma.json`).
