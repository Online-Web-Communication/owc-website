<template>
  <div class="container-fluid">
    <div style="display: grid">
      <div
        class="row justify-content-center align-items-center text-center mt-5"
      >
        <div class="col">
          <h2>Online Web Communication</h2>
        </div>
      </div>
      <div class="row justify-content-center align-items-center mt-5">
        <div class="col">
          <b-card>
            <label for="input1" class="form-label"
              >Katılmak İstediğiniz Odanın Adını Yazınız</label
            >
            <input
              v-model="roomName"
              type="text"
              class="form-control"
              id="input1"
            />
            <b-button class="mt-3" variant="success" @click="login()"
              ><b-icon class="mr-2" icon="box-arrow-in-right"></b-icon
              >Giriş</b-button
            >
          </b-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roomName: "",
    };
  },
  methods: {
    login() {
      if (this.roomName !== "") {
        this.$router.push({
          name: "CommunicationRoom",
          params: { room: this.roomName },
        });
      } else {
        this.$bvToast.toast("Oda İsmi Yazınız !", {
          title: "Giriş Yapılamadı !",
          variant: "danger",
          solid: true,
        });
      }
    },
  },
};
</script>

<style scoped>
.container-fluid {
  width: 100% !important;
  height: 70vh !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

.form-label {
  font-size: 14px !important;
}

.form-control {
  width: 260px !important;
}
</style>