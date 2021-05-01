<template>
  <div class="container-fluid">
    <b-button
      class="back-button"
      size="sm"
      variant="primary"
      @click="backToLogin()"
      ><b-icon class="mr-2" icon="arrow-left-circle"></b-icon>Çıkış</b-button
    >

    <div id="video-grid" class="row"></div>

    <video
      class="personalScreen"
      id="personalVideo"
      autoplay="autoplay"
    ></video>
  </div>
</template>

<script>
export default {
  data() {
    return {
      streamConstraints: {
        audio: true,
        video: true,
      },
      videoGrid: "",
      peers: {},
    };
  },
  watch: {},
  methods: {
    backToLogin() {
      window.location.href = "/";
      /*this.webCam.getTracks().forEach(function (track) {
        track.stop();
        window.location.href = "/";
      });*/
    },
    connectToNewUser(userId, stream) {
      const call = this.$store.state.globalPeer.call(userId, stream);
      const div = document.createElement("div");
      div.className = "col-md-3";
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        this.addVideoStream(video, userVideoStream, div);
      });
      call.on("close", () => {
        div.remove();
      });

      this.peers[userId] = call;
    },
    addVideoStream(video, stream, div) {
      video.srcObject = stream;
      video.style = "height: 300px;";
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
      div.append(video);
      this.videoGrid.append(div);
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
          this.webStream = stream;
          this.addMyVideoStream(myVideo, stream);

          this.$store.state.globalPeer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            const div = document.createElement("div");
            div.className = "col-md-3";

            call.on("stream", (userVideoStream) => {
              this.addVideoStream(video, userVideoStream, div);
            });
          });
        });
    },
  },
  mounted() {
    this.videoGrid = document.getElementById("video-grid");

    this.createVideo();
    setTimeout(() => {
      this.$store.dispatch("connectServer", {
        roomId: this.$route.params.room,
        userId: this.$store.state.userId,
      });
    }, 1500);
    setTimeout(() => {
      this.$store.state.socket.on("user-connected", (userId) => {
        this.connectToNewUser(userId, this.webStream);
        console.log(userId);
      });

      this.$store.state.socket.on("user-disconnected", (userId) => {
        if (this.peers[userId]) this.peers[userId].close();
      });
    }, 3000);
  },
  created() {
    if (this.$store.state.whereRouter != "LOGIN") {
      window.location.href = "/";
    }
  },
};
</script>

<style scoped>
/*#video-grid {
  width: 100% !important;
  height: 350px !important;
}*/

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
  top: 10px !important;
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
  width: 225px !important;
  height: 150px !important;
  border-radius: 10px !important;
  z-index: 10 !important;
}
</style>