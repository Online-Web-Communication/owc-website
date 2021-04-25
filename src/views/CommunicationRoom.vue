<template>
  <div class="container-fluid">
    <b-button
      class="back-button"
      size="sm"
      variant="primary"
      @click="backToLogin()"
      ><b-icon class="mr-2" icon="arrow-left-circle"></b-icon>Çıkış</b-button
    >
    <div
      id="videos"
      class="row justify-content-start align-items-center"
      :class="customClass"
    >
      <div class="col">
        <div id="video-grid"></div>
      </div>
    </div>
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
      customClass: "row-cols-1",
      screens: 1,
      //link: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/h264.mov",
      iceServers: {
        //'iceServer': [{ 'urls': 'stun:stun.services.mozilla.com' }, { 'urls': 'stun:stun.l.google.com:19302' }]
        iceServers: [
          {
            urls: "stun:18.195.35.248:3478",
            username: "1619152553",
            credentials: "Eq1fpwbkUTDNSJUW4w+Rh+n9Ulc=",
          },
        ],
      },
      streamConstraints: {
        audio: true,
        video: true,
      },
      roomNumber: "room",
      videolar: false,
      localStream: "",
      isCaller: "",
      rtcPeerConnection: "",
      remoteStream: "",
      localVideo: "",
      remoteVideo: "",
      number: 0,
      //
      myPeer: "",
      videoGrid: "",
      peers: {},
      col: "",
    };
  },
  watch: {
    screens: function (val) {
      if (val === 1) {
        const videos = document.getElementById("videos");
        videos.classList.remove("row-cols-2");
        this.customClass = "row-cols-1";
      } else if (val === 2) {
        const videos = document.getElementById("videos");
        videos.classList.remove("row-cols-3");
        this.customClass = "row-cols-2";
      }
    },
  },
  methods: {
    connectToNewUser(userId, stream) {
      const call = this.$peer.call(userId, stream);
      const video = document.createElement("video");
      this.screens++;
      console.log(this.screens);
      call.on("stream", (userVideoStream) => {
        const videos = document.getElementById("videos");
        const column = document.createElement("div");
        column.classList.add("col");
        this.videoGrid.append(video);
        column.append(this.videoGrid);
        videos.append(column);
        if (this.screens === 2) {
          this.customClass = "row-cols-1";
          video.style.height = 99 + "vh";
          video.style.width = 100 + "%";
        } else if (this.screens === 3) {
          video.classList.remove("row-cols-1");
          this.customClass = "";
          this.customClass = "row-cols-2";
          video.style.height = 99 + "vh";
          video.style.width = 100 + "%";
        } else {
          let screenValue = Math.ceil(this.screens / 2);
          video.classList.remove("row-cols-2");
          this.customClass = "";
          this.customClass = "row-cols-" + screenValue;
          video.style.height = 49 + "vh";
        }
        this.addVideoStream(video, userVideoStream);
      });
      call.on("close", () => {
        video.remove();
      });

      this.peers[userId] = call;
    },
    addVideoStream(video, stream) {
      video.srcObject = stream;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    },
    createVideo() {
      const myVideo = document.getElementById("personalVideo");
      myVideo.muted = true;

      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          this.addVideoStream(myVideo, stream);

          //diğer kişilerin ekranı
          this.$peer.on("call", (call) => {
            this.screens++;
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
              const videos = document.getElementById("videos");
              const column = document.createElement("div");
              column.classList.add("col");
              this.videoGrid.append(video);
              column.append(this.videoGrid);
              videos.append(column);
              if (this.screens === 2) {
                this.customClass = "row-cols-1";
                video.style.height = 99 + "vh";
                video.style.width = 100 + "%";
              } else if (this.screens === 3) {
                video.classList.remove("row-cols-1");
                this.customClass = "";
                this.customClass = "row-cols-2";
                video.style.height = 99 + "vh";
                video.style.width = 100 + "%";
              } else {
                let screenValue = Math.ceil(this.screens / 2);
                video.classList.remove("row-cols-2");
                this.customClass = "";
                this.customClass = "row-cols-" + screenValue;
                video.style.height = 100 + "px";
              }
              this.addVideoStream(video, userVideoStream);
            });
          });

          this.$store.state.socket.on("user-connected", (userId) => {
            this.connectToNewUser(userId, stream);
          });
        });
    },
  },
  mounted() {
    this.videoGrid = document.getElementById("video-grid");

    this.createVideo();

    this.$store.state.socket.on("user-disconnected", (userId) => {
      if (this.peers[userId]) this.peers[userId].close();
    });

    this.$peer.on("open", (id) => {
      this.$store.state.socket.emit("join-room", "b", id);
    });
  },
  created() {
    this.$store.dispatch("baglan");
  },
};
</script>

<style scoped>
#video-grid {
  width: 100% !important;
  height: 350px !important;
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