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
    <video class="personalScreen" id="localVideoa" autoplay="autoplay">
      <source
        src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/h264.mov"
        type="video/mp4"
      />
    </video>
  </div>
</template>

<script>
const io = require("socket.io-client");
const socket = io();

export default {
  data() {
    return {
      customClass: "",
      screens: 0,
      link: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/h264.mov",
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
  mounted() {
    this.localVideo = document.getElementById("localVideo");
    this.screens = 3;
    //this.remoteVideo = document.getElementById('remoteVideo')
    socket.on("created", (room) => {
      console.log(room);
      navigator.mediaDevices
        .getUserMedia(this.streamConstraints)
        .then((stream) => {
          this.localStream = stream;
          this.localVideo.srcObject = stream;
          this.isCaller = true;
        })
        .catch((err) => {
          console.log("goromm error", err);
        });
    });

    socket.on("candidate", (event) => {
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate,
      });
      console.log("received candidate", candidate);
      this.rtcPeerConnection.addIceCandidate(candidate);
    });

    socket.on("joined", (room) => {
      console.log(room);
      navigator.mediaDevices
        .getUserMedia(this.streamConstraints)
        .then((stream) => {
          this.localStream = stream;
          this.localVideo.srcObject = stream;
          socket.emit("ready", this.roomNumber);
        })
        .catch((err) => {
          console.log("goromm error", err);
        });
    });

    socket.on("ready", () => {
      if (this.isCaller) {
        this.rtcPeerConnection = new RTCPeerConnection(this.iceServers);
        this.rtcPeerConnection.onicecandidate = this.onIceCandidate;
        this.rtcPeerConnection.ontrack = this.onAddStream;
        this.rtcPeerConnection.addTrack(
          this.localStream.getTracks()[0],
          this.localStream
        );
        this.rtcPeerConnection.addTrack(
          this.localStream.getTracks()[1],
          this.localStream
        );
        this.rtcPeerConnection
          .createOffer()
          .then((sessionDescription) => {
            this.rtcPeerConnection.setLocalDescription(sessionDescription);
            socket.emit("offer", {
              type: "offer",
              sdp: sessionDescription,
              room: this.roomNumber,
            });
          })
          .catch((err) => {
            console.log("web hata", err);
          });
      }
    });

    socket.on("offer", (event) => {
      if (!this.isCaller) {
        this.rtcPeerConnection = new RTCPeerConnection(this.iceServers);
        this.rtcPeerConnection.onicecandidate = this.onIceCandidate;
        this.rtcPeerConnection.ontrack = this.onAddStream;
        this.rtcPeerConnection.addTrack(
          this.localStream.getTracks()[0],
          this.localStream
        );
        this.rtcPeerConnection.addTrack(
          this.localStream.getTracks()[1],
          this.localStream
        );
        this.rtcPeerConnection.setRemoteDescription(
          new RTCSessionDescription(event)
        );
        this.rtcPeerConnection
          .createAnswer()
          .then((sessionDescription) => {
            this.rtcPeerConnection.setLocalDescription(sessionDescription);
            socket.emit("answer", {
              type: "answer",
              sdp: sessionDescription,
              room: this.roomNumber,
            });
          })
          .catch((err) => {
            console.log("web hata", err);
          });
      }
    });

    socket.on("answer", (event) => {
      this.rtcPeerConnection.setRemoteDescription(
        new RTCSessionDescription(event)
      );
    });
  },
  methods: {
    goRoom1() {
      if (this.roomNumber == "") {
        alert("doldurrr");
      } else {
        socket.emit("create or join", this.roomNumber);
        this.videolar = true;
      }
    },
    onAddStream(event) {
      //document.getElementById(`remoteVideo${this.number}`).srcObject = event.streams[0]

      if (this.number % 2 == 0) {
        console.log(this.number);
        let video = document.createElement("video");
        video.srcObject = event.streams[0];
        video.id = `remoteVideo${this.number}`;
        video.autoplay = "autoplay";
        document.getElementById("consultingRoom").appendChild(video);
        this.number++;
        return;
      }
      let a = this.number - 1;
      document.getElementById(`remoteVideo${a}`).srcObject = event.streams[0];
      this.number++;
      /* çalışan
             document.getElementById('remoteVideo').srcObject = event.streams[0]
             remoteStream = event.streams[0]*/
    },
    onIceCandidate(event) {
      if (event.candidate) {
        console.log("sending ice candidate", event.candidate);
        socket.emit("candidate", {
          type: "candidate",
          label: event.candidate.sdpMLineIndex,
          id: event.candidate.sdpMid,
          candidate: event.candidate.candidate,
          room: this.roomNumber,
        });
      }
    },
    backToLogin() {
      this.$router.push("/");
    },
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