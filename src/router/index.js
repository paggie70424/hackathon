import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/connected-services'
    },
    {
      path: '/connected-services',
      name: 'connected-services',
      component: () => import('../views/ConnectedServices.vue')
    },
    {
      path: '/data-permissions',
      name: 'data-permissions',
      component: () => import('../views/DataPermissions.vue')
    },
    {
      path: '/data-insights',
      name: 'data-insights',
      component: () => import('../views/DataInsights.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutUs.vue')
    },
    {
      path: '/data-retention',
      name: 'data-retention',
      component: () => import('../views/DataRetention.vue')
    }
  ]
})

export default router
