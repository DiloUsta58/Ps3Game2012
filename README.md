# SSX Level-Atlas

Statische WebApp für SSX (2012) mit 70 Leveln, Kontinent-/Regions-/Bergfiltern, Suche und elf regionalen Spielszenen mit Quellenangaben.

Dieses Verzeichnis ist für **GitHub Pages** vorbereitet. Die Startseite `index.html` liegt direkt im Hauptordner. Kein Build, keine Datenbank, keine Installation und keine ChatGPT-Sites-Anbindung sind erforderlich.

## Auf GitHub hochladen

1. Den **Inhalt dieses Verzeichnisses** ins Hauptverzeichnis deines Repositorys hochladen. Nicht den übergeordneten Ordner `github-export` hochladen: `index.html` und `assets/` sollen direkt im Repository liegen.
2. Falls noch nicht eingerichtet: unter **Settings → Pages** die Quelle **Deploy from a branch**, deinen Branch (zum Beispiel `main`) und **/ (root)** wählen und speichern.
3. Zum Teilen den Website-Link aus **Settings → Pages** verwenden. Die normale `github.com`-Repository-Adresse zeigt die Dateien; die Website läuft üblicherweise unter `https://BENUTZERNAME.github.io/REPOSITORY/`.

Die Datei `.nojekyll` ist absichtlich leer und soll mit hochgeladen werden. Alle lokalen Verweise sind relativ und funktionieren auch unter einem Repository-Unterpfad. Die veröffentlichte Website ist für Besucher öffentlich erreichbar. Die Veröffentlichung übernimmt der Besitzer selbst.

## App öffnen

`index.html` direkt im Browser öffnen. Mit laufendem XAMPP ist diese Kopie unter **http://localhost/SSX/github-export/** erreichbar. Google Fonts ist optional; Systemschriften dienen als Fallback. Alle elf Bilder liegen lokal im Ordner `assets/`.

## Favoriten

Mit dem Stern oben rechts auf einer Regionskarte lässt sich die gesamte Region merken. Neben jeder Bergüberschrift gibt es einen eigenen Stern. Im Detaildialog können beide ebenfalls umgeschaltet werden. **Nur Favoriten** zeigt alle Level gespeicherter Regionen sowie zusätzlich gespeicherter Berge; Suche und weitere Filter gelten weiterhin. **Zurücksetzen** löscht nur die Filter, nicht die Favoriten.

Die Auswahl wird ohne Anmeldung lokal im jeweiligen Browser gespeichert (`localStorage`, Schlüssel `ssx-atlas.favorites.v1`). Sie bleibt nach dem Neuladen erhalten, wird aber nicht zwischen Geräten, Browsern oder unterschiedlichen Website-Adressen synchronisiert. Das Löschen der Websitedaten entfernt auch die Favoriten. Ist der Browserspeicher blockiert oder voll, zeigt die App einen Hinweis und behält die Auswahl nur für die aktuelle Sitzung.

## Eigene Screenshots

Für die derzeit vorhandenen Level-Screenshots gibt es beim Öffnen eines Levels eine Galerie: mehrere Bilder wechseln automatisch alle drei Sekunden; Pfeile und Punkte erlauben die manuelle Auswahl. Einzelbilder bleiben stehen. Die Animation pausiert bei reduzierter Bewegungseinstellung des Geräts. Die Galerie verwendet zuerst Bilder der Strecke, danach ein vorhandenes Bergbild und sonst weiterhin das Regionsbild.

Die eingebundenen Dateien liegen in `assets/drops/` und `assets/mountains/`; Zuordnung und Reihenfolge stehen in `drop-images.js`. Weitere Screenshots können im gleichen Format ergänzt werden. Für eine Strecke verwende ihren vorhandenen Schlüssel aus `drop-images.js` und nummeriere die JPG-Dateien in gewünschter Reihenfolge (`01.jpg`, `02.jpg` usw.); trage ihre relativen Pfade in das passende Array ein. Bergbilder werden unter `assets/mountains/` abgelegt und dem Schlüssel `region-id:Bergname` zugeordnet. Die Quelldateien dieses Imports waren in den Ordnern `screenshots/<Region>/`; diese lokalen Quellordner gehören nicht zum GitHub-Webverzeichnis.

## Persönliche Rekorde und Backup

Im Detail eines Levels lassen sich Rennen, Tricky und – nur bei als Deadly Descent verfügbaren Strecken – Überleben speichern. Die Zeiten und Punktzahlen werden lokal im Browser auf diesem Gerät abgelegt; sie synchronisieren sich nicht automatisch zwischen Geräten. Rennen verwendet das Format Minuten:Sekunden,Hundertstel; die Eingabe akzeptiert kompakte Ziffern wie `0053,25` und ergänzt den Doppelpunkt. Überleben wird in Metern mit zwei Nachkommastellen, Tricky als Punktzahl erfasst.

Über **Backup herunterladen (.json)** sicherst du Favoriten und Rekorde in einer JSON-Datei. **Backup importieren** stellt sie wieder her und ergänzt bestehende Werte: die schnellere Rennzeit sowie die höhere Überlebensdistanz und Punktzahl bleiben erhalten.

## Daten prüfen

Mit installiertem Node.js: `node verify.mjs`.

## Dateien und Quellen

- `index.html`: Oberfläche und Quellenhinweise
- `data.js`: Strecken und geografische Zuordnung
- `images.js`, `drop-images.js` und `assets/`: Regionsbilder, Levelgalerien und Bergansichten
- `app.js`: Suche, Filter, Detaildialog und persönliche Bestzeiten
- `styles.css`: Darstellung für Desktop und Mobilgeräte
- `.nojekyll`: direkte Auslieferung durch GitHub Pages
- `verify.mjs`: optionale lokale Prüfung; für die Website nicht erforderlich

Die Zählung fasst Eventarten derselben Strecke zusammen; Tutorials sind ausgeschlossen. Die Bilder zeigen Regionen und nicht jeden einzelnen Drop. Datenquellen und Bildnachweise sind in der App verlinkt. Spiel- und Bildrechte verbleiben bei den jeweiligen Rechteinhabern. Keine offizielle EA-App.
