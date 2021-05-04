<template>
  <div class="container-fluid">
    <div id="video-grid" class="row"></div>

    <video
      class="personalScreen"
      id="personalVideo"
      autoplay="autoplay"
    ></video>
    <div class="user-controller">
      <div class="contaier-fluid">
        <div class="row mt-3">
          <div class="col-md-12 d-flex justify-content-center">
            <b-button
              class="back-button"
              style="border-radius: 20px"
              variant="primary"
              @click="backToLogin()"
              ><b-icon class="mr-2" icon="arrow-left-circle"></b-icon
              >Çıkış</b-button
            >
            <b-button
              class="mr-3"
              style="border-radius: 20px"
              :variant="audioEnabled ? 'success' : 'danger'"
              @click="muteAndOpenAudio()"
              ><b-icon
                :icon="audioEnabled ? 'volume-up' : 'volume-mute'"
                font-scale="2"
              ></b-icon
            ></b-button>
            <b-button
              style="border-radius: 20px"
              :variant="videoEnabled ? 'success' : 'danger'"
              @click="closeAndOpenVideo()"
              ><b-icon
                :icon="videoEnabled ? 'camera-video' : 'camera-video-off'"
                font-scale="2"
              ></b-icon
            ></b-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      streamConstraints: {
        audio: true,
        video: true,
      },
      videoGrid: "",
      videoClass: "",
      clients: 0,
      otherClients: 0,
      allClassList: [],
      audioEnabled: false,
      videoEnabled: false,
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
          this.addMyVideoStream(myVideo, stream);

          this.$store.state.globalPeer.on("call", (call) => {
            call.answer(stream);
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
video {
  width: 250px;
  height: 250px;
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
    bottom: 10px !important;
    right: 10px !important;
    width: 150px !important;
    height: 200px !important;
    border-radius: 10px !important;
    z-index: 10 !important;
    transition: 0.5s;
  }

  .personalScreen:hover {
    width: 300px !important;
    height: 225px !important;
  }
}

.user-controller {
  position: fixed;
  bottom: 0px;
  left: 0px;
  width: 100%;
  height: 80px;
  background-color: rgb(76, 76, 76);
}
</style>