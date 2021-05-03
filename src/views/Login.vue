<template>
  <div class="container-fluid">
    <div class="row justify-content-center align-items-start">
      <div class="col-lg-3 col-md-4 mt-4 order-2 order-md-1">
        <div class="card">
          <div class="card-header">Odalar</div>
          <ul class="list-group list-group-flush">
            <li class="rooms-name">
              <b-icon icon="door-open" class="mr-2" font-scale="1.5"></b-icon>
              <router-link to="/">An item</router-link>
            </li>
            <li class="rooms-name">
              <b-icon icon="door-open" class="mr-2" font-scale="1.5"></b-icon>
              <router-link to="/">An item</router-link>
            </li>
            <li class="rooms-name">
              <b-icon icon="door-open" class="mr-2" font-scale="1.5"></b-icon>
              <router-link to="/">An item</router-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="col-lg-6 col-md-4 order-1 order-md-2">
        <div
          class="row justify-content-center align-items-center text-center mt-5"
        >
          <div class="col">
            <h2>Online Web Communication</h2>
          </div>
        </div>
        <div class="row justify-content-center align-items-center mt-5">
          <div class="col">
            <div class="card-border p-4">
              <label for="input1" class="form-label"
                >Katılmak İstediğiniz Odanın Adını Yazınız</label
              >
              <div class="row">
                <div class="col-lg-5 col-md-10">
                  <input
                    v-model="roomName"
                    type="text"
                    class="form-control"
                    id="input1"
                    @keypress.enter="login()"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-8">
                  <b-button class="mt-3" variant="success" @click="login()"
                    ><b-icon class="mr-2" icon="box-arrow-in-right"></b-icon
                    >Giriş
                  </b-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-3 col-md-4 order-3 order-md-3"></div>
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
        this.$store.commit("setWhereRouter", "LOGIN");
        this.$store.dispatch("joinRoom", { roomId: this.roomName });
        this.$router.push({
          name: "Room",
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
  mounted() {
    this.$store.dispatch("openPeer");
  },
  created() {
    this.$store.commit("setPeer", this.$peer);
    this.$store.dispatch("connectServer");
  },
};
</script>

<style scoped>
.form-label {
  font-size: 14px !important;
}

.card-border {
  width: 100%;
  border: 1px solid rgb(174, 174, 174);
}

.rooms-name {
  list-style-type: none;
  padding: 3px;
  margin-left: 15px;
  font-size: 14px !important;
}
</style>