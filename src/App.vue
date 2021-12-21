<template>
  <div class="app-content">
    <header>
      <div class="player">
        <button @click="play = !play">{{ play ? "⏸" : "▶" }}</button>
      </div>
      <h1>CHASEd</h1>
      <p>Compact Half Aleatoric Soundtrack Engine Demonstrator</p>
      <b v-if="allFiles === 0">Keine zu ladenden Dateien gefunden!</b>
      <p v-if="allFiles > 0 && !loaded">Lade Dateien: {{ audio_files.length }}/{{ allFiles }}</p>
    </header>
    <main ref="main" v-if="loaded">
      <div v-for="(c, i) in corner" class="corner">
        <span>{{ keys(c).map(k => "Ecke " + (i + 1) + ": " + k + " = " + c[k]).reduce((p, c) => p + ", " + c) }}</span>
        <span>{{ (i < edges.length ? edges[i] : middle) * 100 }}%</span>
      </div>
      <div :class="'entity listener' + (play ? ' playing' : '')" @mousedown="dragListener" ref="listener"></div>
    </main>
    <aside v-if="loaded">
      <div>
        <table v-if="audio_files.length > 0">
          <thead>
          <tr>
            <th v-for="tag in tags">{{ tag.toLocaleLowerCase() }}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="file in audio_files" @click="(playing = file).play()" :class="playing === file ? 'active' : ''">
            <td v-for="tag in values(file.tags)">{{ tag }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </aside>
  </div>
</template>
<script>
import Vue from "vue";
import AudioFile from "./audio";

export default Vue.extend({
  name: "App",
  data: () => ({
    allFiles: 0,
    audio_files: [],
    corner: [
      {MODE: "Aeolian"},
      {KEY: "Eb"},
      {KEY: "Ab"},
      {KEY: "F"},
      {KEY: "F"}
    ],
    playing: null,
    edges: [0.25, 0.25, 0.25, 0.25]
  }),
  computed: {
    loaded() {
      return this.allFiles > 0 && this.allFiles === this.audio_files.length;
    },
    ranges() {
      let tmp = 0;
      return [...this.edges.map(v => tmp += v), 1];
    },
    tags() {
      return this.audio_files.length > 0 ? Object.keys(this.audio_files[0].tags) : [];
    },
    middle() {
      return Math.round(10 - (this.edges.reduce((a, b) => a + b, 0)) * 10) / 10;
    },
    play: {
      get() {
        return this.playing != null;
      },
      set(value) {
        if (value) this.playNext();
        else this.playing = null;
      }
    }
  },
  mounted: function () {
    let files = require.context('./audio', true, /\.mp3$/).keys(); // Alle mp3-Dateien aus dem "audio" Ordner als relativer Pfad (z.B. ./1.mp3 oder ./2.mp3)
    this.allFiles = files.length;
    Promise.all(files.map(f => AudioFile.fromPath(require("./audio/" + f.substr(2))).then(f => this.audio_files.push(f)))).then(this.calcEdges);
  },
  methods: {
    keys: Object.keys,
    values: Object.values,
    playNext() {
      let next = Math.random(), category = 0;
      this.ranges.forEach((v, i) => category = next > v ? i + 1 : category);
      if (category < this.corner.length) {
        let condition = this.corner[category];
        let selection = this.audio_files.filter(v => Object.keys(condition).map(k => v.tags[k] === condition[k]).reduce((p, c) => p && c));
        (this.playing = selection[Math.floor(Math.random() * selection.length)]).play().then(() => {
          if (this.play) this.playNext();
        });
      } else this.playNext();
    },
    calcEdges() {
      let listener = this.$refs.listener.getBoundingClientRect(),
          main = this.$refs.main.getBoundingClientRect();

      let dX = (listener.x - main.x) / main.width,
          dY = (listener.y - main.y) / main.height;

      let tmpEdges = [[1, 1], [1, 0], [0, 0], [0, 1]].map(v => ((v[0] ? 1 - dX : dX) + (v[1] ? 1 - dY : dY)) / 2);
      tmpEdges.map((v, i) => v - tmpEdges[(i + 2) % 4])
          .forEach((v, i) => Vue.set(this.edges, i, v < 0 ? 0 : Math.round(v * 10) / 10));
    },
    dragListener(e) {
      let main = this.$refs.main.getBoundingClientRect();
      let minX = main.x,
          maxX = main.x + main.width,
          minY = main.y,
          maxY = main.y + main.height;
      e.preventDefault();
      const el = e.target;
      el.x = e.clientX;
      el.y = e.clientY;
      document.onmouseup = () => {
        document.onmouseup = null;
        document.onmousemove = null;
      };
      document.onmousemove = e => {
        e.preventDefault();
        let top = (el.offsetTop - (el.y - e.clientY)), left = (el.offsetLeft - (el.x - e.clientX));
        if (left >= minX && left <= maxX && top >= minY && top <= maxY) {
          el.style.top = top + "px";
          el.style.left = left + "px";
          el.x = e.clientX;
          el.y = e.clientY;
          this.calcEdges();
        }
      };
    }
  }
});
</script>
<style module>

.app-content {
  background-color: #aaa;
  color: #000;
}

header {
  position: fixed;
  width: 100%;
  height: 10%;
  top: 0;
  left: 0;
  right: 0;
}

.player {
  float: right;
  margin-left: 20px;
}

.player span {
  position: relative;
  font: 1.5rem "Courier New", monospace;
  margin-top: 50%;
  transform: translateY(-50%);
}

.active {
  background: rgb(131, 58, 180);
  background: linear-gradient(90deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%);
}

main {
  /*background: rgb(175, 175, 175);
  background: linear-gradient(90deg, rgba(175, 175, 175, 1) 0%, rgba(175, 175, 175, 1) 45%, rgba(200, 200, 200, 1) 100%);*/
  position: fixed;
  right: 30%;
  top: 10%;
  height: 90%;
  width: 70%;
  margin: 0;
  padding: 0;
  background: linear-gradient(217deg, rgba(255, 0, 0, .8), rgba(255, 0, 0, 0) 70.71%),
  linear-gradient(127deg, rgba(0, 255, 0, .8), rgba(0, 255, 0, 0) 70.71%),
  linear-gradient(336deg, rgba(0, 0, 255, .8), rgba(0, 0, 255, 0) 70.71%);
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
}

.corner:nth-of-type(0n+1) {
  top: 0;
  left: 0
}

.corner:nth-of-type(0n+2) {
  bottom: 0;
  left: 0
}

.corner:nth-of-type(0n+3) {
  bottom: 0;
  right: 0
}

.corner:nth-of-type(0n+4) {
  top: 0;
  right: 0
}

.corner:nth-of-type(0n+5) {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%)
}

.corner {
  position: absolute;
  padding: 1rem;
  background-color: #aaaaaa
}

aside {
  position: fixed;
  right: 0;
  bottom: 0;
  height: 90%;
  width: 30%;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
}

tbody > tr {
  cursor: pointer;
}

aside > div {
  padding: 1rem;
}

h1 {
  margin-top: 20px;
  margin-left: 20px;
  font: 2rem "Courier New", monospace;
  color: #000;
}

button {
  float: right;
  padding: 1rem 0.5rem;
  margin: 1rem;
  width: 100%;
  font-size: 1rem;
}

p {
  margin-left: 20px;
  font: 1.5rem "Courier New", monospace;
  color: #000;
}

.listener {
  left: 50%;
  top: 50%;
}

table {
  width: 100%;
  text-align: center;
}

.entity {
  position: fixed;
  transform: translateX(-50%) translateY(-50%);
  width: 4rem;
  height: 4rem;
  cursor: move;
}

.playing:before {
  content: "";
  position: relative;
  display: block;
  width: 300%;
  height: 300%;
  box-sizing: border-box;
  margin-left: -100%;
  margin-top: -100%;
  border-radius: 12rem;
  background-color: rgba(1, 164, 233, 0.5);
  -webkit-animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}

.playing:after {
  -webkit-animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
  animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;
}

.entity:after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  display: block;
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 4rem;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}

th {
  text-transform: capitalize;
}

@-webkit-keyframes pulse-ring {
  0% {
    transform: scale(0.33);
  }
  80%, 100% {
    opacity: 0;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.33);
  }
  80%, 100% {
    opacity: 0;
  }
}

@-webkit-keyframes pulse-dot {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.8);
  }
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.8);
  }
}
</style>