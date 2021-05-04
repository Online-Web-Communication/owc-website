<template>
  <div class="container-fluid">
    <div class="row justify-content-center align-items-start">
      <div class="col-lg-3 col-md-4 mt-4 order-2 order-md-1">
        <div class="card">
          <div class="card-header">Odalar</div>
          <ul v-if="rooms.length > 0" class="list-group list-group-flush">
            <li
              @click="joinRoom(item)"
              class="rooms-name"
              v-for="(item, index) in rooms"
              :key="index"
            >
              <div class="row justify-content-around align-items-center">
                <div class="col-7">
                  <b-icon
                    icon="door-open"
                    class="mr-2"
                    font-scale="1.5"
                  ></b-icon>
                  <span>{{ item.room_name }} </span>
                </div>
                <div class="col-5 text-right">
                  <span>({{ item.length + " Kişi" }})</span>
                </div>
              </div>
            </li>
          </ul>
          <span v-else class="p-4">Şuanda Aktif Oda Bulunmamaktadır.</span>
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
                >Katılmak İstediğiniz veya Oluşturmak İstediğiniz Odanın Adını Yazınız</label
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
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      roomName: "",
      rooms: [],
    };
  },
  computed: {
    ...mapGetters({ roomList: "getRoomList" }),
  },
  watch: {
    roomList: function (val) {
      this.rooms = val.map((room) => {
        return { room_name: room.room_name, length: room.person_number.length };
      });
    },
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
    joinRoom(item) {
      this.$store.commit("setWhereRouter", "LOGIN");
      this.$store.dispatch("joinRoom", { roomId: item.room_name });
      this.$router.push({
        name: "Room",
        params: { room: item.room_name },
      });
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
  padding: 8px;
  margin-left: 15px;
  font-size: 14px !important;
  cursor: pointer;
  transition: 0.3s;
}

.rooms-name:hover {
  background-color: rgb(224, 224, 224);
}
</style>