# Récitations des 99 Noms d'Allah

Déposez ici un fichier audio par nom, nommé avec le **numéro du nom sur 3 chiffres** :

```
001.mp3   → Ar-Rahmân   (nom n°1)
002.mp3   → Ar-Rahîm    (nom n°2)
003.mp3   → Al-Malik    (nom n°3)
...
099.mp3   → As-Sabûr    (nom n°99)
```

- Format conseillé : **MP3** (ou `.m4a`/`.ogg` en adaptant l'extension dans `asmaAudioSrc()` de `js/features/books.js`).
- La numérotation suit l'ordre de `books/asma.json` (champ `n`).
- Aucun changement de code nécessaire : dès qu'un fichier est présent, cliquer
  le nom correspondant dans l'app le joue. Les noms sans fichier affichent
  simplement « Récitation bientôt disponible ».

L'ordre des noms peut être ajusté dans `books/asma.json` si vous souhaitez
suivre l'ordre d'un anachid précis (fournir la liste ordonnée).
