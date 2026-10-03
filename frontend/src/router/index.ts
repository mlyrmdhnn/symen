import Main from '@/views/Main.vue'
import { ImportIcon } from '@lucide/vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      component: Main,
      path: '/',
    },
    {
      component: () => import('@/views/services/ServicesPage.vue'),
      path: '/services',
      name: 'Services Page',
    },
    {
      component: () => import('@/views/logs/LogsPage.vue'),
      path: '/logs',
      name: 'Logs Page',
    },
    {
      component: () => import('@/views/details/ServiceDetailsPage.vue'),
      path: '/details/:pid/service',
      name: 'Details Service Page',
    },
    {
      component: () => import('@/views/guide/GuidePage.vue'),
      path: '/guide',
      name: 'Guide',
    },
    {
      component: () => import('@/views/version/VersionPage.vue'),
      path: '/version',
      name: 'Version Page',
    },
    {
      component: () => import('@/views/settings/SettingsPage.vue'),
      path: '/settings',
      name: 'Settings Page',
    },
    {
      component: () => import('@/views/create/AddService.vue'),
      path: '/add-service',
      name: 'Add Service',
    },
  ],
})

export default router
