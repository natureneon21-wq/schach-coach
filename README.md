# Schach-Coach

> **⚠️ KI-generierter Code:** Dieses gesamte Projekt wurde per "Vibe Coding" mit Hilfe von KI (Claude von Anthropic) erstellt. Der Code wurde nicht manuell geschrieben und ist ein privates Lern- und Hobbyprojekt.

Eine private Schach-Lern-App (PWA) für Smartphones. Ziel: Schach von etwa 200-300 Elo an lernen, nach Art der Russischen Schule: jede Stellung durchdenken, nichts auswendig lernen.

**App öffnen:** https://natureneon21-wq.github.io/schach-coach/ (im Browser öffnen und "Zum Startbildschirm hinzufügen")

## Funktionen

- Partie gegen einen Bot (Stärke 200-3000 Elo in 50er-Schritten)
- Animierter Coach mit Auswahl an Charakteren, bewertet jeden Zug
- Tipp-Funktion und Denk-Routine (Was droht? Was hängt?)
- Aufgaben und Analyse nach der Partie
- Optional: Erklärungen per Gemini (eigener API-Key, wird nur lokal gespeichert)
- Anpassbares Aussehen: Figurensätze, Brettfarben, Bild-im-Bild-Layout für Video nebenher

## Technik

- Reines HTML/CSS/JavaScript (ES-Module), kein Build-Schritt
- Engine: Stockfish 17.1 (lite, WASM) im Web Worker; wird beim Deployen per GitHub Actions aus npm geladen
- Hosting: GitHub Pages
- Quellcode liegt in `schach-coach-slim/`

## Hinweise

- Alle Dateien tragen einen Kopfkommentar, dass sie KI-generiert sind.
- Stockfish steht unter der GPL-3.0 und gehört nicht zu diesem Code.
- Private Nutzung, kein Anspruch auf Fehlerfreiheit.
