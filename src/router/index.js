import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login2.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/room/:room',
    name: 'Room',
    component: () => import('../views/ShowTime.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
