<template>
  <div class="app-content">
    <header>
      <div class="player">
        <span v-if="play">Spielt gerade: </span>
        <span v-if="play">{{ playing.tags.title }}</span>
        <button @click="play = !play">{{ play ? "Pause" : "Abspielen" }}</button>
      </div>
      <h1>CHASEd</h1>
      <p>Compact Half Aleatoric Soundtrack Engine Demonstrator</p>
    </header>
    <main ref="main">
      <div :class="'entity listener' + (play ? ' playing' : '')" @mousedown="dragListener" ref="listener"></div>
    </main>
    <aside>
      <h2>Debug-Infos:</h2>
      <ul>
        <li v-for="i in [0, 1, 2, 3]">Ecke {{ i + 1 }}: {{ edges[i] }}%</li>
        <li>Summe: {{ sum }}%</li>
      </ul>
    </aside>
  </div>
</template>
<script>
import Vue from "vue";
import AudioFile from "./audio";

export default Vue.extend({
  name: "App",
  data: () => ({
    audio_files: [],
    playing: null,
    edges: [0.25, 0.25, 0.25, 0.25]
  }),
  computed: {
    sum() {
      return this.edges.reduce((a, b) => a + b, 0);
    },
    play: {
      get() {
        return this.playing != null;
      },
      set(value) {
        this.playing = value ? {tags: {"title": "asdf"}} : null;
      }
    }
  },
  beforeCreate: function () {
    Promise.all(require.context('./audio', true, /\.mp3$/).keys() // Alle mp3-Dateien aus dem "audio" Ordner als relativer Pfad (z.B. ./1.mp3 oder ./2.mp3)
        .map(file => AudioFile.fromPath(require("./audio/" + file.substr(2))))) // Audiodatei aus Pfad erstellen (substring löscht ./)
        .then(audio_files => this.audio_files = audio_files);
  },
  methods: {
    calcEdges() {
      let listener = this.$refs.listener.getBoundingClientRect(),
          main = this.$refs.main.getBoundingClientRect();

      let dSeite = [
        listener.x,
        main.y - listener.y,
        main.x + main.width - listener.x,
        main.y + main.height - listener.y
      ].map(Math.abs);
      let diagonale = Math.sqrt(main.height ** 2 + main.width ** 2);
      this.edges = [0, 1, 2, 3].map(i => diagonale - Math.sqrt(dSeite[i] ** 2 + dSeite[(i + 1) % 4] ** 2));
      let sum = this.edges.reduce((a, b) => a + b, 0);
      this.edges = this.edges.map(v => v / sum);
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
        if (e.clientX >= minX && e.clientX <= maxX && e.clientY >= minY && e.clientY <= maxY) {
          el.style.top = (el.offsetTop - (el.y - e.clientY)) + "px";
          el.style.left = (el.offsetLeft - (el.x - e.clientX)) + "px";
          el.x = e.clientX;
          el.y = e.clientY;
          this.calcEdges(e.clientX, e.clientY);
        }
      };
    }
  }
});
</script>
<style module>
body {
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

aside {
  position: fixed;
  right: 0;
  bottom: 0;
  height: 90%;
  width: 30%;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
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
  width: 10rem;
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