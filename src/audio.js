const jsmediatags = require('./jsmediatags.min.js'); // Bibliothek zum Laden ID3-Tags

class AudioFile {

    constructor(path, tags) {
        this.path = path; // Dateipfad
        this.tags = tags; // MP3-Tags
        this.audio = document.createElement("audio"); // Audio-HTML-Element
        this.audio.src = path; // Dateipfad für das HTML-Element
        document.body.append(this.audio); // Zum Body hinzufügen, damit die Datei abgespielt werden kann.
    }

    //Audiofile.fromPath(<Dateipfad>)
    static fromPath(path) {
        return new Promise((resolve, reject) => jsmediatags.read(path, {
            onSuccess: tags => // Tags aus Datei geladen
                resolve(new AudioFile(path, // Dateipfad
                    Object.fromEntries(
                        tags.tags["TXXX"] // Benutzerdefinierte Werte
                        .map(e => [e.data["user_description"], // Bezeichnung des Werts -> Schlüssel des Objekts mit Object.fromEntities()
                            e.data["data"]]) // Inhalt des Wertes -> Inhalt des Schlüssels mit Object.fromEntities()
                    )
                )),
            onError: error => reject(error) // Fehler beim Laden
        }));
    }
}

export default AudioFile;