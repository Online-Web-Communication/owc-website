import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: '',
  },
  mutations: {
  },
  actions: {

    baglan(context) {
      console.log('burada')
      context.state.socket = io("http://localhost:3000");

      context.state.socket.on("connect", function () {
        console.log("bağlandı");
      });
      context.state.socket.on('event', function (data) {
        console.log(data)
      });
      context.state.socket.on('disconnect', function () {
        console.log('bağlantı disconnect')
      });
      context.state.socket.on('error', function (err) {
        console.log(err)
      });
    }
  },
  modules: {
  }
})
