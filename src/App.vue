<template>
  <div>
    <button @click="play = !play">{{ play ? "Pause" : "Abspielen" }}</button>
    <h1>CHASEd</h1>
    <p>Compact Half Aleatoric Soundtrack Engine Demonstrator</p>
    <hr>
    <div :class="'listener' + (play ? ' playing' : '')" @mousedown="dragListener" ref="listener"></div>
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
    play: false
  }),
  beforeCreate: function () {
    Promise.all(require.context('./audio', true, /\.mp3$/).keys() // Alle mp3-Dateien aus dem "audio" Ordner als relativer Pfad (z.B. ./1.mp3 oder ./2.mp3)
        .map(file => AudioFile.fromPath(require("./audio/" + file.substr(2))))) // Audiodatei aus Pfad erstellen (substring löscht ./)
        .then(audio_files => this.audio_files = audio_files);
  },
  methods: {
    create_and_play() {
      this.audio_files.filter(a => a.tags["MODE"] === this.mode && a.tags["KEY"] === this.key);
    },
    play_next() {
      this.queue[0].audio.play();
      setTimeout(() => {
        this.queue.shift();
        if (this.queue.length > 0) this.play_next();
      }, this.queue[0].tags["NEXT"] * 1000 + (Math.random() * this.max));
    },
    dragListener(e) {
      e.preventDefault();
      this.x = e.clientX;
      this.y = e.clientY;
      document.onmouseup = () => {
        document.onmouseup = null;
        document.onmousemove = null;
      };
      document.onmousemove = e => {
        e.preventDefault();
        this.$refs.listener.style.top = (this.$refs.listener.offsetTop - (this.y - e.clientY)) + "px";
        this.$refs.listener.style.left = (this.$refs.listener.offsetLeft - (this.x - e.clientX)) + "px";
        this.x = e.clientX;
        this.y = e.clientY;
      };
    }
  }
});
</script>
<style module>
body {
  /*background: rgb(175, 175, 175);
  background: linear-gradient(90deg, rgba(175, 175, 175, 1) 0%, rgba(175, 175, 175, 1) 45%, rgba(200, 200, 200, 1) 100%);*/
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: linear-gradient(217deg, rgba(255,0,0,.8), rgba(255,0,0,0) 70.71%),
      linear-gradient(127deg, rgba(0,255,0,.8), rgba(0,255,0,0) 70.71%),
      linear-gradient(336deg, rgba(0,0,255,.8), rgba(0,0,255,0) 70.71%);
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-position: center;
}

h1 {
  margin-top: 20px;
  margin-left: 20px;
  font: 40px "Courier New", monospace;
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
  font: 20px "Courier New", monospace;
  color: #000;
}

.listener {
  position: fixed;
  left: 50%;
  top: 50%;
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

.listener:after {
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