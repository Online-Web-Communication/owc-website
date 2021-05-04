import Vue from 'vue'
import Vuex from 'vuex'
import io from 'socket.io-client';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    socket: '',
    userId: '',
    globalPeer: '',
    whereRouter: '',
    peers: {},
    webStream: '',
    newPerson: '',
    roomList: []
  },
  mutations: {
    setPeer(state, peer) {
      state.globalPeer = peer
    },
    setWhereRouter(state, route) {
      state.whereRouter = route
    },
    setPeersUser(state, data) {
      state.peers[data.userId] = data.call;
    },
    setClosePeerUser(state, userId) {
      state.peers[userId].close();
    },
    setWebStream(state, stream) {
      state.webStream = stream
    },
    setUserId(state, userId) {
      state.userId = userId
    },
    setNewPerson(state, userId) {
      state.newPerson = userId
    },
    setRoomList(state, data) {
      state.roomList = data
    }
  },
  getters: {
    getNewPerson(state) {
      return state.newPerson
    },
    getRoomList(state) {
      return state.roomList
    }
  },
  actions: {

    connectServer(context) {

      context.state.socket = io("localhost:3000");

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

      context.state.socket.on("user-connected", (userId) => {
        context.commit('setNewPerson', userId)
        console.log(userId);
      });

      context.state.socket.on("user-disconnected", (userId) => {
        if (context.state.peers[userId]) context.commit('setClosePeerUser', userId)
      });

      context.state.socket.on("rooms", (rooms) => {
        context.commit('setRoomList', rooms)
      });

    },

    joinRoom(context, data) {
      setTimeout(() => {

        context.state.socket.emit("join-room", { roomId: data.roomId, userId: context.state.userId });
      }, 2000)
    },

    openPeer(context) {
      context.state.globalPeer.on("open", (userId) => {
        context.commit('setUserId', userId)
      });
    }
  },
  modules: {
  }
})
