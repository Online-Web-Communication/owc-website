import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    //component: Login
    component: () => import('../views/CommunicationRoom.vue')
  },
  {
    path: '/communication-room/:room',
    name: 'CommunicationRoom',
    component: () => import('../views/CommunicationRoom.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
