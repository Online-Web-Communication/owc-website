<template>
  <div class="container-fluid" style="height: 100vh; overflow-y: hidden">
    <!-- Üst Bar -->
    <div class="row">
      <div class="col d-flex">
        <div class="voice-button text-center">
          <i class="fas fa-volume-up"></i>
        </div>
        <div class="voice-button-title">{{ $route.params.room }}</div>
      </div>
    </div>
    <!-- Üst Bar -->

    <div id="video-grid" class="row"></div>

    <video
      class="personalScreen"
      id="personalVideo"
      autoplay="autoplay"
    ></video>
    <!-- Alt Bar -->
    <div class="container-fluid alt-bar">
      <div class="row">
        <div class="col d-flex justify-content-center">
          <div class="text-center butons mr-3" @click="shareScreen()">
            <i
              class="fab fa-slideshare"
              style="font-size: 20px; color: white"
            ></i>
          </div>
          <div class="text-center butons mr-3" @click="closeAndOpenVideo()">
            <i
              :class="videoEnabled ? 'fas fa-video-slash' : 'fas fa-video'"
              style="font-size: 20px"
              :style="videoEnabled ? 'color:black;' : 'color:white;'"
            ></i>
          </div>
          <div class="text-center butons mr-3" @click="muteAndOpenAudio()">
            <i
              :class="
                audioEnabled ? 'fas fa-microphone-slash' : 'fas fa-microphone'
              "
              style="font-size: 20px"
              :style="audioEnabled ? 'color:black;' : 'color:white;'"
            ></i>
          </div>
          <div
            class="text-center butons"
            style="background-color: red"
            @click="backToLogin()"
          >
            <i
              class="fas fa-phone-slash"
              style="font-size: 20px; color: white"
            ></i>
          </div>
        </div>
      </div>
    </div>
    <!-- Alt Bar -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      streamConstraints: {
        audio: false,
        video: true,
      },
      videoGrid: "",
      videoClass: "",
      clients: 0,
      otherClients: 0,
      allClassList: [],
      audioEnabled: false,
      videoEnabled: false,
      videoWidthData: window.innerWidth,
      videoHeightData: window.innerHeight,
      calls: "",
    };
  },
  computed: {
    ...mapGetters({ getNewPerson: "getNewPerson" }),
  },
  watch: {
    getNewPerson: function (val) {
      this.connectToNewUser(val);
    },
    clients: function (val) {
      if (val === 1 || val === 2) {
        var elements = document.getElementsByClassName("video-design-options");
        for (var i = 0, len = elements.length; i < len; i++) {
          elements[i].style.width = "100%";
          elements[i].style.height = "98vh";
        }
        console.log(this.videoGrid.classList + " - giriş");
        for (let i = 0; i < this.videoGrid.classList.length; i++) {
          this.videoGrid.classList.remove(
            this.videoGrid.classList[i].toString()
          );
        }
        this.videoGrid.classList.remove("row-cols-1");
        this.videoGrid.classList.remove("row-cols-2");
        this.videoGrid.classList.remove("row-cols-3");
        console.log(this.videoGrid.classList + " - çıkış");
        this.videoGrid.classList.add("row");
        if (val === 1) {
          this.videoGrid.classList.add("row-cols-1");
        } else {
          this.videoGrid.classList.add("row-cols-2");
        }
      } else if (val >= 3) {
        var elements = document.getElementsByClassName("video-design-options");
        for (var i = 0, len = elements.length; i < len; i++) {
          elements[i].style.width = "100%";
          elements[i].style.height = "47vh";
        }
        this.videoGrid.classList.add("row");
        let screenCount = Math.round(this.clients / 2);
        this.videoGrid.classList.add(`row-cols-${screenCount}`);
      }
    },
  },
  methods: {
    shareScreen() {
      navigator.mediaDevices
        .getDisplayMedia({
          video: {
            cursor: "always",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        })
        .then((stream) => {
          const videoTrack = stream.getTracks()[0];
          this.calls.getSenders()[0].replaceTrack(videoTrack);

          /*videoTrack.onended = () => {
            this.createVideo();
          };*/
          const myVideo = document.getElementById("personalVideo");
          myVideo.muted = true;
          this.addMyVideoStream(myVideo, stream);
        });
    },
    backToLogin() {
      window.location.href = "/";
    },
    muteAndOpenAudio() {
      this.$store.state.webStream.getAudioTracks()[0].enabled = !this.$store.state.webStream.getAudioTracks()[0]
        .enabled;
      this.audioEnabled = !this.audioEnabled;
    },
    closeAndOpenVideo() {
      this.$store.state.webStream.getVideoTracks()[0].enabled = !this.$store.state.webStream.getVideoTracks()[0]
        .enabled;
      this.videoEnabled = !this.videoEnabled;
    },
    connectToNewUser(userId) {
      const call = this.$store.state.globalPeer.call(
        userId,
        this.$store.state.webStream
      );
      this.calls = call.peerConnection
      this.clients++;
      const div = document.createElement("div");
      const video = document.createElement("video");
      video.classList.add("video-design-options");
      div.classList.add("col");
      this.screenDesigner(video);
      call.on("stream", (userVideoStream) => {
        this.addVideoStream(video, userVideoStream, div);
      });
      call.on("close", () => {
        this.clients--;
        div.remove();
      });

      this.$store.commit("setPeersUser", { call: call, userId: userId });
    },
    addVideoStream(video, stream, div) {
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
      this.videoGrid.append(div);
      div.append(video);
    },
    addMyVideoStream(video, stream) {
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    },
    createVideo() {
      const myVideo = document.getElementById("personalVideo");
      myVideo.muted = true;
      navigator.mediaDevices
        .getUserMedia(this.streamConstraints)
        .then((stream) => {
          this.$store.commit("setWebStream", stream);

          this.addMyVideoStream(myVideo, this.$store.state.webStream);

          this.$store.state.globalPeer.on("call", (call) => {
            call.answer(this.$store.state.webStream);
            this.calls = call.peerConnection;
            const video = document.createElement("video");
            const div = document.createElement("div");
            this.otherClients++;
            video.classList.add("video-design-options");
            div.classList.add("col");
            if (this.otherClients === 1) {
              for (let i = 0; i < this.videoGrid.classList.length; i++) {
                this.videoGrid.classList.remove(
                  this.videoGrid.classList[i].toString()
                );
              }
              video.style.width = "100%";
              video.style.height = "98vh";
            } else if (this.otherClients === 2) {
              for (let i = 0; i < this.videoGrid.classList.length; i++) {
                this.videoGrid.classList.remove(
                  this.videoGrid.classList[i].toString()
                );
              }
              video.style.width = "100%";
              video.style.height = "98vh";
            } else {
              for (let i = 0; i < this.videoGrid.classList.length; i++) {
                this.videoGrid.classList.remove(
                  this.videoGrid.classList[i].toString()
                );
              }
              video.style.width = "100%";
              video.style.height = "47vh";
              var elements = document.getElementsByClassName(
                "video-design-options"
              );
              for (var i = 0, len = elements.length; i < len; i++) {
                elements[i].style.width = "100%";
                elements[i].style.height = "47vh";
              }
            }

            call.on("stream", (userVideoStream) => {
              this.addVideoStream(video, userVideoStream, div);
            });
          });
        });
    },
    screenDesigner(video) {
      if (this.clients === 1) {
        for (let i = 0; i < this.videoGrid.classList.length; i++) {
          this.videoGrid.classList.remove(
            this.videoGrid.classList[i].toString()
          );
        }
        video.style.width = "100%";
        video.style.height = "98vh";
      } else if (this.clients === 2) {
        for (let i = 0; i < this.videoGrid.classList.length; i++) {
          this.videoGrid.classList.remove(
            this.videoGrid.classList[i].toString()
          );
        }
        video.style.width = "100%";
        video.style.height = "98vh";
      } else {
        for (let i = 0; i < this.videoGrid.classList.length; i++) {
          this.videoGrid.classList.remove(
            this.videoGrid.classList[i].toString()
          );
        }
        video.style.width = "100%";
        video.style.height = "47vh";
        var elements = document.getElementsByClassName("video-design-options");
        for (var i = 0, len = elements.length; i < len; i++) {
          elements[i].style.width = "100%";
          elements[i].style.height = "47vh";
        }
      }
    },
  },
  mounted() {
    this.videoGrid = document.getElementById("video-grid");

    this.createVideo();
  },
  created() {
    if (this.$store.state.whereRouter != "LOGIN") {
      window.location.href = "/";
    }
  },
};
</script>

<style scoped>
.video-border {
  border: 2px solid red;
  border-radius: 20px;
}

video {
  width: 100%;
  object-fit: cover;
}

.col {
  padding: 0 0 !important;
}

.back-button {
  position: fixed !important;
  left: 10px !important;
  opacity: 0.5 !important;
  z-index: 1000 !important;
}

.back-button:hover {
  opacity: 1 !important;
}

.personalScreen {
  position: fixed !important;
  bottom: 10px !important;
  right: 10px !important;
  width: 280px !important;
  height: 215px !important;
  border-radius: 10px !important;
  z-index: 10 !important;
  transition: 0.5s;
}

.personalScreen:hover {
  width: 400px !important;
  height: 325px !important;
}

@media only screen and (max-width: 728px) {
  .personalScreen {
    position: fixed !important;
    top: 10px !important;
    right: 10px !important;
    width: 130px !important;
    height: 175px !important;
    border-radius: 10px !important;
    z-index: 10 !important;
    transition: 0.5s;
  }

  .personalScreen:hover {
    width: 300px !important;
    height: 225px !important;
  }

  #video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 150px);
    grid-auto-rows: 150px;
  }
}

.alt-bar {
  /*background: gray;*/
  bottom: 30px;
  left: 0;
  position: fixed;
}

.butons {
  border-radius: 65px;
  width: 65px;
  line-height: 65px;
  margin-top: -50px;
  background-color: rgb(121, 121, 121);
  transition: 0.2s;
  cursor: pointer;
}

.butons:hover {
  -webkit-box-shadow: 0px 0px 5px 5px rgb(147, 147, 147); /* Safari 3-4, iOS 4.0.2 - 4.2, Android 2.3+ */
  -moz-box-shadow: 0px 0px 5px 5px rgb(147, 147, 147); /* Firefox 3.5 - 3.6 */
  box-shadow: 0px 0px 5px 5px rgb(147, 147, 147);
}

.voice-button {
  border-radius: 40px;
  width: 40px;
  line-height: 40px;
  background-color: rgb(191, 191, 191);
  transition: 0.2s;
  margin-top: 15px;
  margin-left: 30px;
}

.voice-button-title {
  margin-top: 23px;
  margin-left: 15px;
  color: black;
}
</style>