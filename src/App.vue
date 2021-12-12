<template>
  <div>
    <h1>CHASEd</h1>
    <p>Compact Half Aleatoric Soundtrack Engine Demonstrator</p>
    <hr>
    <h2>Random Query:</h2>
    <select v-model="key">
      <option v-for="key in keys" :name="key">{{ key }}</option>
    </select>
    <select name="Modes" v-model="mode">
      <option v-for="mode in modes" :name="mode">{{ mode }}</option>
    </select>
    <button @click="create_and_play">Abspielen</button>
    <div>
      <ul>
        <li v-for="file in queue">{{file.path}}</li>
      </ul>
    </div>
    <hr>
    <h2>Alle Audiodateien:</h2>
    <table>
      <thead>
      <tr>
        <th>URL</th>
        <th>Mode</th>
        <th>Key</th>
        <th>Next Song After</th>
        <th>Action</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="file in audio_files">
        <td>{{ file.path }}</td>
        <td>{{ file.tags["MODE"] }}</td>
        <td>{{ file.tags["KEY"] }}</td>
        <td>{{ file.tags["NEXT"] }}</td>
        <td>
          <button @click="file.audio.play()">Abspielen</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import Vue from "vue";
import AudioFile from "./audio";

export default Vue.extend({
  name: "App",
  data: () => ({
    audio_files: [],
    queue: [],
    mode: null,
    key: null
  }),
  computed: {
    modes: function () {
      return [...new Set(this.audio_files.map(v => v.tags["MODE"]))];
    },
    keys: function () {
      return [...new Set(this.audio_files.map(v => v.tags["KEY"]))];
    }
  },
  beforeCreate: function () {
    Promise.all(require.context('./audio', true, /\.mp3$/).keys() // Alle mp3-Dateien aus dem "audio" Ordner als relativer Pfad (z.B. ./1.mp3 oder ./2.mp3)
        .map(file => AudioFile.fromPath(require("./audio/" + file.substr(2))))) // Audiodatei aus Pfad erstellen (substring löscht ./)
        .then(audio_files => this.audio_files = audio_files);
  },
  methods: {
    create_and_play() {
      this.queue = this.audio_files.filter(a => a.tags["MODE"] === this.mode && a.tags["KEY"] === this.key);
      this.shuffle_queue();
      this.play_next();
    },
    play_next() {
      this.queue[0].audio.play();
      setTimeout(() => {
        this.queue.shift();
        if (this.queue.length > 0) this.play_next();
      }, this.queue[0].tags["NEXT"] * (Math.random() * 2000 + 1000));
    },
    shuffle_queue() {
      for (let i = this.queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
      }
    }
  }
});
</script>
<style module>
body {
  background: rgb(175, 175, 175);
  background: linear-gradient(90deg, rgba(175, 175, 175, 1) 0%, rgba(175, 175, 175, 1) 45%, rgba(200, 200, 200, 1) 100%);
}

h1 {
  margin-top: 20px;
  margin-left: 20px;
  font: 40px "Courier New", monospace;
  color: #000;
}

p {
  margin-left: 20px;
  font: 20px "Courier New", monospace;
  color: #000;
}
</style>