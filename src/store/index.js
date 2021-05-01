import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: '',
    userId: '',
    globalPeer: '',
    whereRouter: ''
  },
  mutations: {
    setPeer(state, peer) {
      state.globalPeer = peer
    },
    setWhereRouter(state, route){
      state.whereRouter = route
    }
  },
  actions: {

    connectServer(context, data) {

      context.state.socket = io("https://e-garsonum.com");

      if (context.state.socket.connected) return

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

      context.dispatch('joinRoom', data)
    },

    joinRoom(context, data) {
      context.state.socket.emit("join-room", { roomId: data.roomId, userId: data.userId });
    },

    openPeer(context){
      context.state.globalPeer.on("open", (userId) => {
        context.state.userId = userId;
      });
    }
  },
  modules: {
  }
})
