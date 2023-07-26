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
      path: "/user/all",
      name: "user",
      component: () => import("../components/UserList.vue"),
    },
    {
      path: "/user/:id",
      name: "user-details",
      component: () => import("../components/UserList.vue"),
    },
    {
      path: "/add",
      name: "add",
      component: () => import("../components/AddUser.vue"),
    },
    {
      path: "/game",
      name: "game",
      component: () => import("../views/GameView.vue"),
    }
  ]
})

export default router
