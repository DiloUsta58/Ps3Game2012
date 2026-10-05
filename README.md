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

## Daten prüfen

Mit installiertem Node.js: `node verify.mjs`.

## Dateien und Quellen

- `index.html`: Oberfläche und Quellenhinweise
- `data.js`: Strecken und geografische Zuordnung
- `images.js` und `assets/`: Bilder mit Herkunftsnachweisen
- `app.js`: Suche, Filter, Detaildialog
- `styles.css`: Darstellung für Desktop und Mobilgeräte
- `.nojekyll`: direkte Auslieferung durch GitHub Pages
- `verify.mjs`: optionale lokale Prüfung; für die Website nicht erforderlich

Die Zählung fasst Eventarten derselben Strecke zusammen; Tutorials sind ausgeschlossen. Die Bilder zeigen Regionen und nicht jeden einzelnen Drop. Datenquellen und Bildnachweise sind in der App verlinkt. Spiel- und Bildrechte verbleiben bei den jeweiligen Rechteinhabern. Keine offizielle EA-App.
