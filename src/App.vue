<template>
  <div class="app-content">
    <main ref="main" v-if="loaded">
      <div v-for="(c, i) in corners" class="corner">
        <span>{{ c.name }} {{ i < edges.length ? edges[i] : middle }}%</span>
      </div>
      <div :class="'entity listener' + (play ? ' playing' : '')" @mousedown="dragListener" ref="listener"></div>
    </main>
    <aside>
      <header>
        <h1>CHASEd</h1>
        <p>Compact Half Aleatoric Soundtrack Engine Demonstrator</p>
        <button @click="play = !play" v-if="loaded">{{ play ? "Stopp" : "Start" }}</button>
        <b v-if="allFiles === 0">Keine zu ladenden Dateien gefunden!</b>
        <p v-if="allFiles > 0 && !loaded">Lade Dateien: {{ audio_files.length }}/{{ allFiles }}</p>
        <h2>Einstellungen</h2>
        <span>Zusätzliche Verzögerung: <input type="range" min="-3" max="5" step="0.1"
                                              v-model="this.offset"> {{ this.displayOffset }}s</span>
        <div v-if="loaded && play">
          <h5>Aktuell wird gespielt:</h5>
          <ul>
            <li v-for="(value, key) in playing.tags"><b>{{ key.toLocaleLowerCase() }}</b>: {{ value }}</li>
          </ul>
        </div>
      </header>
      <footer>
        Von <a href="https://accesshologram.bandcamp.com/" target="_blank">Robin Hintzen</a> &amp; <a target="_blank"
                                                                                                  href="https://about.pmaus.de/">Philip
        Maus</a>
      </footer>
    </aside>
  </div>
</template>
<script>
import AudioFile from "./audio";
import config from "./config.json";

export default {
  name: "App",
  data: () => ({
    allFiles: 0,
    audio_files: [],
    corners: config["corners"],
    playing: null,
    edges: [0.25, 0.25, 0.25, 0.25],
    offset: 1.5
  }),
  computed: {
    displayOffset() {
      return parseFloat(this.offset).toLocaleString("de", {useGrouping: false, minimumFractionDigits: 1})
    },
    loaded() {
      return this.allFiles > 0 && this.allFiles === this.audio_files.length;
    },
    ranges() {
      let tmp = 0;
      return [...this.edges.map(v => tmp += v / 100), 1];
    },
    tags() {
      return this.audio_files.length > 0 ? Object.keys(this.audio_files[0].tags) : [];
    },
    middle() {
      return (100 - this.edges.reduce((a, b) => a + b, 0)) | 0;
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
    files.map(f => this.audio_files.push(await AudioFile.fromPath(require("./audio/" + f.substring(2)))));
    this.calcEdges();
  },
  methods: {
    keys: Object.keys,
    values: Object.values,
    playNext() {
      let next = Math.random(), category = 0;
      this.ranges.forEach((v, i) => category = next > v ? i + 1 : category);
      if (category < this.corners.length) {
        let condition = this.corners[category].filter;
        let selection = this.audio_files.filter(v => Object.keys(condition).map(k => v.tags[k] === condition[k]).reduce((p, c) => p && c));
        (this.playing = selection[Math.floor(Math.random() * selection.length)]).play(this.offset).then(() => {
          if (this.play) this.playNext();
        });
      } else this.playNext();
    },
    smallerSquare(n) {
      [0, 1, 2, 3].forEach(v => this.edges[v] = v === n ? 100 : 0);
    },
    setEdges(d, n1, n2) {
      [0, 1, 2, 3].forEach(v => this.edges[v] = v === n1 ? 100 - d : (v === n2 ? d : 0));
    },
    innerSquare(listener, inner) {
      let dX = (listener.x - inner.x) / inner.width,
          dY = (listener.y - inner.y) / inner.height;

      let tmpEdges = [[1, 1], [1, 0], [0, 0], [0, 1]].map(v => ((v[0] ? 1 - dX : dX) + (v[1] ? 1 - dY : dY)) / 2);
      tmpEdges.map((v, i) => v - tmpEdges[(i + 2) % 4])
          .forEach((v, i) => this.edges[i] = v < 0 ? 0 : Math.floor(v * 100) | 0);
    },
    calcEdges() {
      let listener = this.$refs.listener.getBoundingClientRect(),
          outer = this.$refs.main.getBoundingClientRect();
      listener = new DOMRect(listener.x + listener.width / 2, listener.y + listener.height / 2, listener.width, listener.height);

      let inner = new DOMRect((outer.width - (Math.sqrt(2) / 2 * outer.width)) / 2, (outer.height - (Math.sqrt(2) / 2 * outer.height)) / 2,
          Math.sqrt(2) / 2 * outer.width, Math.sqrt(2) / 2 * outer.height)

      let inLeftX = listener.x >= inner.x,
          inRightX = listener.x < (outer.width - inner.x),
          inUpperY = listener.y >= inner.y,
          inLowerY = listener.y < (outer.height - inner.y);
      let inX = inLeftX && inRightX,
          inY = inUpperY && inLowerY;

      if (inX) {
        if (inY) this.innerSquare(listener, inner);
        else this.setEdges(Math.round(100 * (listener.x - inner.x) / inner.width) | 0, inUpperY ? 1 : 0, inUpperY ? 2 : 3);
      } else {
        if (inY) this.setEdges(Math.round(100 * (listener.y - inner.y) / inner.height) | 0, inRightX ? 0 : 3, inRightX ? 1 : 2);
        else this.smallerSquare(!inLeftX && inRightX ? (inUpperY && !inLowerY ? 1 : 0) : (inUpperY && !inLowerY ? 2 : 3));
      }
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
};
</script>
<style module>

b {
  text-transform: capitalize;
}

.app-content {
  color: #000;
  font: 1.5rem "Courier New", monospace;
  display: flex;
}

* {
  box-sizing: border-box;
}

footer {
  color: #333;
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}

.active {
  background: linear-gradient(90deg, rgba(131, 58, 180, 1) 0%, rgba(253, 29, 29, 1) 50%, rgba(252, 176, 69, 1) 100%);
}

aside {
  flex-shrink: 1;
  flex-grow: 1;
  transition: width ease-in-out 0.5s;
}

main {
  flex-shrink: 0;
  flex-grow: 0;
  display: inline-block;
  position: relative;
  width: 100vmin;
  height: 100vmin;
  padding: 0;
  margin: 0 0;
  box-shadow: 10px 10px 44px -10px rgba(0, 0, 0, 0.7);
  -webkit-box-shadow: 10px 10px 44px -10px rgba(0, 0, 0, 0.7);
  background: url("CHASEd.jpg") no-repeat;
  background-size: cover;
  border-top-right-radius: 1em;
  border-bottom-right-radius: 1em;
}

.corner:nth-of-type(0n+1) {
  top: 0;
  left: 0;
  border-bottom-right-radius: 1em;
}

.corner:nth-of-type(0n+2) {
  bottom: 0;
  left: 0;
  border-top-right-radius: 1em;
}

.corner:nth-of-type(0n+3) {
  bottom: 0;
  right: 0;
  border-bottom-right-radius: 1em;
  border-top-left-radius: 1em;
}

.corner:nth-of-type(0n+4) {
  top: 0;
  right: 0;
  border-bottom-left-radius: 1em;
  border-top-right-radius: 1em
}

.corner:nth-of-type(0n+5) {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 1em;
}

.corner {
  position: absolute;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.7);
}

body {
  margin: auto;
  overflow: hidden;
}

h1 {
  font-size: 2rem;
}

h2 {
  font-size: 1.75rem;
}

button {
  width: 100%;
  padding: 1rem;
  font-size: 1em;
}

aside {
  padding-left: 1rem;
  padding-right: 1rem;
}

.listener {
  left: 50%;
  top: 50%;
  z-index: 1000;
}

a {
  color: #000 !important;
}

.entity {
  position: absolute;
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
