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
        <li>Ecke 1: {{ p1 * 100}}%</li>
        <li>Ecke 2: {{ p2 * 100}}%</li>
        <li>Ecke 3: {{ p3 * 100}}%</li>
        <li>Ecke 4: {{ p4 * 100}}%</li>
        <li>Summer: {{ p1 + p2 + p3 + p4 }}%</li>
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
    queue: [],
    max: 0,
    mode: null,
    key: null,
    x: 0,
    y: 0,
    playing: null,
    isMounted: false
  }),
  computed: {
    play: {
      get() {
        return this.playing != null;
      },
      set(value) {
        this.playing = value ? {tags: {"title": "asdf"}} : null;
      }
    },
    mainWidth() {
      return this.isMounted ? this.$refs.main.clientWidth : 0;
    },
    mainHeight() {
      return this.isMounted ? this.$refs.main.clientHeight : 0;
    },
    aL() {
      return this.isMounted ? this.$refs.listener.clientLeft : 0;
    },
    aR() {
      return this.isMounted ? this.mainWidth - this.$refs.listener.clientLeft : 0;
    },
    aT() {
      return this.isMounted ? this.$refs.listener.clientTop - this.$refs.main.clientTop : 0;
    },
    aB() {
      return this.isMounted ? (this.mainHeight + this.$refs.main.clientTop) - this.$refs.listener.clientTop : 0;
    },
    p1() {
      return this.isMounted ? (this.aL / this.mainWidth + this.aT / this.mainHeight) / 2 : 0;
    },
    p2() {
      return this.isMounted ? (1 - (this.aL / this.mainWidth) + this.aT / this.mainHeight) / 2 : 0;
    },
    p3() {
      return this.isMounted ? (this.aL / this.mainWidth + 1 - (this.aT / this.mainHeight)) / 2 : 0;
    },
    p4() {
      return this.isMounted ? (1 - (this.aL / this.mainWidth) + 1 - (this.aT / this.mainHeight)) / 2 : 0;
    }
  },
  beforeCreate: function () {
    Promise.all(require.context('./audio', true, /\.mp3$/).keys() // Alle mp3-Dateien aus dem "audio" Ordner als relativer Pfad (z.B. ./1.mp3 oder ./2.mp3)
        .map(file => AudioFile.fromPath(require("./audio/" + file.substr(2))))) // Audiodatei aus Pfad erstellen (substring löscht ./)
        .then(audio_files => this.audio_files = audio_files);
  },
  mounted() {
    this.isMounted = true;
  },
  methods: {
    dragListener(e) {
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
        el.style.top = (el.offsetTop - (el.y - e.clientY)) + "px";
        el.style.left = (el.offsetLeft - (el.x - e.clientX)) + "px";
        el.x = e.clientX;
        el.y = e.clientY;
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