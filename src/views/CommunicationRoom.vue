<template>
  <div class="container-fluid">
    <b-button
      class="back-button"
      size="sm"
      variant="primary"
      @click="backToLogin()"
      ><b-icon class="mr-2" icon="arrow-left-circle"></b-icon>Çıkış</b-button
    >
    <div id="video-grid"></div>
    <div
      v-if="screens === 1"
      class="row row-cols-1 justify-content-center align-items-center"
    >
      <div class="col" v-for="data in screens" :key="data">
        <video
          style="width: 100% !important; height: 99vh !important"
          id="localVideo"
          autoplay="autoplay"
          controls
        >
          <source :src="link" type="video/mp4" />
        </video>
      </div>
    </div>
    <div
      v-else-if="screens === 2"
      class="row row-cols-2 justify-content-center align-items-center"
    >
      <div class="col" v-for="data in screens" :key="data">
        <video
          style="width: 100% !important; height: 99vh !important"
          id="localVideo"
          autoplay="autoplay"
          controls
        >
          <source :src="link" type="video/mp4" />
        </video>
      </div>
    </div>
    <div
      v-else
      class="row justify-content-start align-items-center"
      :class="customClass"
    >
      <div class="col" v-for="data in screens" :key="data">
        <video id="localVideo" autoplay="autoplay" controls>
          <source :src="link" type="video/mp4" />
        </video>
      </div>
    </div>
    <div id="biz" class="personelScreen"></div>
    <!--<video class="personalScreen" id="localVideoa" autoplay="autoplay">
      <source
        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/h264.mov"
        type="video/mp4"
      />
    </video>-->
  </div>
</template>

<script>
export default {
  data() {
    return {
      customClass: "",
      screens: 0,
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
    };
  },
  watch: {
    screens: function (val) {
      if (val > 2) {
        let screenValue = Math.ceil(val / 2);
        this.customClass = "row-cols-" + screenValue;
      }
    },
  },
  methods: {
    connectToNewUser(userId, stream) {
      const call = this.$peer.call(userId, stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
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
      this.videoGrid.append(video);
    },
    createVideo() {
      const myVideo = document.createElement("video");
      myVideo.muted = true;

      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true,
        })
        .then((stream) => {
          this.addVideoStream(myVideo, stream);

          this.$peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
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
#localVideo {
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

#localVideo {
  width: 100% !important;
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