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
    roomList: [],
    calls: '',
    mySocketInformation: ''
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
    },
    setMySocketInformation(state, mySocketInformation) {
      state.mySocketInformation = mySocketInformation
    }
  },
  getters: {
    getNewPerson(state) {
      return state.newPerson
    },
    getRoomList(state) {
      return state.roomList
    },
    getMySocketInformation(state) {
      return state.mySocketInformation
    }
  },
  actions: {

    connectServer(context) {

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

      context.state.socket.on("rooms", (rooms) => {
        context.commit('setRoomList', rooms)
      });

      context.state.socket.on("mySocket", (socketData) => {
        context.commit('setMySocketInformation', socketData)
      });
    },
  },
  modules: {
  }
})
