<template>
  <div class="container-fluid" style="height: 100vh; overflow-y: hidden">
    <!-- Üst Bar -->
    <div class="row">
      <div class="col d-flex">
        <div class="voice-button text-center">
          <i class="fas fa-volume-up"></i>
        </div>
        <div class="voice-button-title">
          {{ $route.params.room }} {{ instantMeter }}
        </div>
      </div>
    </div>
    <!-- Üst Bar -->

    <div
      id="video-grid"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fill, 400px);
        grid-auto-rows: 400px;
      "
    ></div>

    <video
      class="personalScreen"
      id="personalVideo"
      autoplay="autoplay"
      muted
    ></video>
    <!-- Alt Bar -->
    <div class="container-fluid alt-bar">
      <div class="row">
        <div class="col d-flex justify-content-center">
          <div
            :style="
              isShareDesktop
                ? 'background-color: rgb(64, 208, 35)'
                : 'background-color: rgb(121, 121, 121);'
            "
            class="text-center butons mr-3"
            @click="isShareDesktop ? turnWebCam() : shareDesktopScreen()"
          >
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
import SoundMeter from "../SoundController/sound";
import BandwidthHandler from "../BandwidthHandler/BandwidthHandler";

export default {
  data() {
    return {
      iceServers: {
        iceServers: [
          {
            urls: "stun:3.68.95.209:3478",
            username: "1636050382",
            credentials: "oYCtcdG17kZEpukgi3Z2WEmezPQ=",
          },
        ],
      },
      shareDesktop: {
        video: {
          cursor: "always",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      },
      audioEnabled: false,
      videoEnabled: false,
      videoWidthData: window.innerWidth,
      videoHeightData: window.innerHeight,
      isShareDesktop: false,
      streamConstraints: {
        audio: true,
        video: true,
      },
      localStream: "",
      rtcPeerConnection: [],
      localVideo: "",
      number: 0,
      bandwidth: {
        screen: 300, // 300kbits minimum
        audio: 50, // 50kbits  minimum
        video: 256, // 256kbits (both min-max)
      },
      videoAddedCounter: [],
      soundMeter: 0,
      instantMeter: 0,
      audioContext: "",
      meterRefresh: "",
    };
  },
  watch: {
    instantMeter: function (val) {
      /*if (parseFloat(val) < 0.1) {
        this.localStream.getAudioTracks()[0].enabled = false;
      } else {
        this.localStream.getAudioTracks()[0].enabled = true;
      }*/
    },
  },
  methods: {
    backToLogin() {
      window.location.href = "/";
    },
    stopStreamVideo() {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
    },
    muteAndOpenAudio() {
      this.localStream.getAudioTracks()[0].enabled = !this.localStream.getAudioTracks()[0]
        .enabled;
      this.audioEnabled = !this.audioEnabled;
    },
    closeAndOpenVideo() {
      this.localStream.getVideoTracks()[0].enabled = !this.localStream.getVideoTracks()[0]
        .enabled;
      this.videoEnabled = !this.videoEnabled;
    },
    shareWebCam() {
      return navigator.mediaDevices.getUserMedia(this.streamConstraints);
    },
    desktopScreen() {
      if (this.rtcPeerConnection.length == 0) {
        this.$bvToast.toast(
          "Öncelikle Bir Kullanıcının Bağlanmasını Bekleyiniz.",
          {
            title: "Uyarı",
            variant: "warning",
            solid: true,
          }
        );
        return Promise.reject();
      }
      return navigator.mediaDevices.getDisplayMedia(this.shareDesktop);
    },
    changeStreamTracks() {
      const tracks = this.localStream.getTracks();

      const videoTrack = tracks.find((item) => item.kind == "video");
      const audioTrack = tracks.find((item) => item.kind == "audio");

      this.rtcPeerConnection.forEach((item) => {
        const videoTrackIndex = item
          .getSenders()
          .findIndex((item) => item.track.kind == "video");

        const audioTrackIndex = item
          .getSenders()
          .findIndex((item) => item.track.kind == "audio");

        if (videoTrackIndex != -1 && videoTrack) {
          // console.log(videoTrackIndex, "video");
          item.getSenders()[videoTrackIndex].replaceTrack(videoTrack);
        }

        if (audioTrackIndex != -1 && audioTrack) {
          // console.log(audioTrackIndex, "audio");
          item.getSenders()[audioTrackIndex].replaceTrack(audioTrack);
        }
      });
    },
    turnWebCam() {
      return this.shareWebCam()
        .then((stream) => {
          this.stopStreamVideo();

          this.localStream = stream;
          this.localVideo.srcObject = stream;

          this.changeStreamTracks();
          //this.checkSound();

          this.isShareDesktop = false;
        })
        .catch((err) => {
          console.log("goromm error", err);
        });
    },
    shareDesktopScreen() {
      return this.desktopScreen()
        .then((stream) => {
          this.stopStreamVideo();

          this.localStream = stream;
          this.localVideo.srcObject = stream;

          this.changeStreamTracks();
          //this.checkSound();

          this.isShareDesktop = true;
        })
        .catch((err) => {
          console.log("goromm error", err);
        });
    },
    createMyVideo() {
      return this.shareWebCam()
        .then((stream) => {
          this.localStream = stream;
          this.localVideo.srcObject = stream;

          //this.checkSound();
        })
        .catch((err) => {
          console.log("goromm error", err);
        });
    },
    checkSound() {
      this.soundMeter = new SoundMeter(this.audioContext);
      let _this = this;
      this.soundMeter.connectToSource(this.localStream, function (e) {
        if (e) {
          alert(e);
          return;
        }
        _this.meterRefresh = setInterval(() => {
          _this.instantMeter = _this.soundMeter.instant.toFixed(2);
          _this.localStream.getAudioTracks()[0].enabled = true;
        }, 1000);
      });
    },
    createOfferPeers(socketInfo, index) {
      this.rtcPeerConnection.push(new RTCPeerConnection(this.iceServers));
      this.rtcPeerConnection[index].socket_id = socketInfo.your;
      this.rtcPeerConnection[index].onicecandidate = (event) => {
        if (event.candidate) {
          //console.log('sending ice candidate', event.candidate)
          this.$store.state.socket.emit("candidate", {
            type: "candidate",
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            socket_id: socketInfo.your,
            your: socketInfo.my,
          });
        }
      };
      this.rtcPeerConnection[index].ontrack = (event) => {
        const isUuid = this.videoAddedCounter.findIndex(
          (item) => item == socketInfo.uuid
        );
        if (isUuid == -1) {
          this.videoAddedCounter.push(socketInfo.uuid);

          let video = document.createElement("video");
          video.srcObject = event.streams[0];
          video.id = `${socketInfo.uuid}`;
          video.style = "width: 100%; height: 100%; object-fit: fill;";
          video.addEventListener("loadedmetadata", () => {
            video.play();
            document.getElementById("video-grid").appendChild(video);
            const count = this.videoAddedCounter.findIndex(
              (item) => item == socketInfo.uuid
            );
            this.videoAddedCounter.splice(count, 1);
          });
        }
      };

      this.localStream.getTracks().forEach((track) => {
        this.rtcPeerConnection[index].addTrack(track, this.localStream);
      });

      this.rtcPeerConnection[index]
        .createOffer()
        .then((sessionDescription) => {
          sessionDescription.sdp = BandwidthHandler.setApplicationSpecificBandwidth(
            sessionDescription.sdp,
            this.bandwidth,
            false
          );
          sessionDescription.sdp = BandwidthHandler.setVideoBitrates(
            sessionDescription.sdp,
            {
              min: this.bandwidth.video,
              max: this.bandwidth.video,
            }
          );
          sessionDescription.sdp = BandwidthHandler.setOpusAttributes(
            sessionDescription.sdp
          );
          this.rtcPeerConnection[index].setLocalDescription(sessionDescription);

          this.$store.state.socket.emit("ready", {
            my: this.$store.state.mySocketInformation.socket_id,
            your: socketInfo.your,
            sdp: sessionDescription,
            uuid: this.$store.state.mySocketInformation.uuid,
          });
        })
        .catch((err) => {
          console.log("web hata", err);
        });
    },
    createAnswer(socketInfo) {
      //console.log(socketInfo);
      this.rtcPeerConnection.push(new RTCPeerConnection(this.iceServers));
      this.rtcPeerConnection[this.rtcPeerConnection.length - 1].socket_id =
        socketInfo.my;
      this.rtcPeerConnection[
        this.rtcPeerConnection.length - 1
      ].onicecandidate = (event) => {
        if (event.candidate) {
          //console.log('sending ice candidate', event.candidate)
          this.$store.state.socket.emit("candidate", {
            type: "candidate",
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            socket_id: socketInfo.my,
            your: socketInfo.your,
          });
        }
      };
      this.rtcPeerConnection[this.rtcPeerConnection.length - 1].ontrack = (
        event
      ) => {
        const isUuid = this.videoAddedCounter.findIndex(
          (item) => item == socketInfo.uuid
        );
        if (isUuid == -1) {
          this.videoAddedCounter.push(socketInfo.uuid);

          let video = document.createElement("video");
          video.srcObject = event.streams[0];
          video.id = `${socketInfo.uuid}`;
          video.style = "width: 100%; height: 100%; object-fit: fill;";
          video.addEventListener("loadedmetadata", () => {
            video.play();
            document.getElementById("video-grid").appendChild(video);
            const count = this.videoAddedCounter.findIndex(
              (item) => item == socketInfo.uuid
            );
            this.videoAddedCounter.splice(count, 1);
          });
        }
      };

      this.localStream.getTracks().forEach((track) => {
        this.rtcPeerConnection[this.rtcPeerConnection.length - 1].addTrack(
          track,
          this.localStream
        );
      });

      this.rtcPeerConnection[
        this.rtcPeerConnection.length - 1
      ].setRemoteDescription(new RTCSessionDescription(socketInfo.sdp));
      this.rtcPeerConnection[this.rtcPeerConnection.length - 1]
        .createAnswer()
        .then((sessionDescription) => {
          sessionDescription.sdp = BandwidthHandler.setApplicationSpecificBandwidth(
            sessionDescription.sdp,
            this.bandwidth,
            false
          );
          sessionDescription.sdp = BandwidthHandler.setVideoBitrates(
            sessionDescription.sdp,
            {
              min: this.bandwidth.video,
              max: this.bandwidth.video,
            }
          );
          sessionDescription.sdp = BandwidthHandler.setOpusAttributes(
            sessionDescription.sdp
          );
          this.rtcPeerConnection[
            this.rtcPeerConnection.length - 1
          ].setLocalDescription(sessionDescription);

          this.$store.state.socket.emit("sendAnswer", {
            sdp: sessionDescription,
            socket_id: socketInfo.my,
            your: socketInfo.your,
          });
        })
        .catch((err) => {
          console.log("web hata", err);
        });
    },
    giveAnswer(event, index) {
      console.log("answer");
      this.rtcPeerConnection[index].setRemoteDescription(
        new RTCSessionDescription(event.sdp)
      );
    },
    setCandidate(event, index) {
      //console.log('received ice candidate', event)
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate,
      });
      this.rtcPeerConnection[index].addIceCandidate(candidate);
    },
    deleteUserVideo(data) {
      let videoElement = document.getElementById(data.uuid);
      videoElement.remove();
      const userIndex = this.rtcPeerConnection.findIndex(
        (item) => item.socket_id == data.socket_id
      );
      if (userIndex != -1) {
        this.rtcPeerConnection.splice(userIndex, 1);
      }
    },
  },
  mounted() {
    this.audioContext = new AudioContext();
    this.localVideo = document.getElementById("personalVideo");

    this.createMyVideo().then(() => {
      this.$store.state.mySocketInformation.clients.forEach((item, index) => {
        if (item.socket_id != this.$store.state.mySocketInformation.socket_id) {
          let info = {
            my: this.$store.state.mySocketInformation.socket_id,
            your: item.socket_id,
            uuid: item.uuid,
          };

          this.createOfferPeers(info, index);
        }
      });
    });

    this.$store.state.socket.on("response", (event) => {
      let index = this.$store.state.mySocketInformation.clients.findIndex(
        (x) => x.socket_id == event.your
      );
      this.giveAnswer(event, index);
    });

    this.$store.state.socket.on("candidate", (event) => {
      const index = this.rtcPeerConnection.findIndex(
        (item) => item.socket_id == event.your
      );
      //console.log(index)
      this.setCandidate(event, index);
    });

    this.$store.state.socket.on("joined", (socketInfo) => {
      this.createAnswer(socketInfo);
    });

    this.$store.state.socket.on("user-disconnected", (uuid) => {
      this.deleteUserVideo(uuid);
    });
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

  .mobile-off {
    display: none;
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
