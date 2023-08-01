import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: "/users",
      name: "users",
      component: () => import("../views/UserView.vue"),
    },
    {
      path: "/game",
      name: "game",
      component: () => import("../views/AboutView.vue"),
    }
  ]
})

export default router
