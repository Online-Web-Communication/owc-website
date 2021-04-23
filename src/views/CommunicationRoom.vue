<template>
  <div class="container-fluid">
    <b-button
      class="back-button"
      size="sm"
      variant="primary"
      @click="backToLogin()"
      ><b-icon class="mr-2" icon="arrow-left-circle"></b-icon>Çıkış</b-button
    >
    <div class="row justify-content-start align-items-center">
      <div class="col-md-4" v-for="data in 8" :key="data">
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
export default {
  data() {
    return {
      link: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/3/h264.mov",
    };
  },
  methods: {
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

.col-md-4 {
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

video {
  width: 100% !important;
  height: 99vh !important;
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