# Zenflix Folder Structure Guide

Zenflix supports two types of media organization:
- TV Shows
- Movies

---

## TV Shows

Each TV show must be placed in its own folder.  
The folder name should match the show name.

There are two supported structures.

---

### Season-based structure (recommended)

Use this when a show has multiple seasons.

```
TV SHOWS (seasoned)
├── The Expanse
│   ├── Season 1
│   │   ├── Episode 1
│   │   ├── Episode 2
│   ├── Season 2
│   │   ├── Episode 1
│   │   ├── Episode 2
```

---

### Single-season / flat structure

Use this when the show has only one season or you do not want season folders.

```
Breaking Bad
├── Episode 1
├── Episode 2
├── Episode 3
```

---

## Movies

Movies can be organized either as collections or as individual entries.

---

### Collections

Use folders to group related movies.

```
MOVIES
├── Sci-Fi Collection
│   ├── Interstellar
│   ├── 2001: A Space Odyssey
│   ├── Blade Runner 2049
```

---

### Individual movies

Store standalone movies directly in the Movies folder.

```
MOVIES
├── Inception
├── The Matrix
├── The Matrix Reloaded
├── The Matrix Revolutions
```

---

## Notes

- Folder names should closely match official titles.
- Episode naming should be consistent (Episode 1, S01E01, etc., depending on your system).
- Do not mix TV shows and movies in the same directory structure.
