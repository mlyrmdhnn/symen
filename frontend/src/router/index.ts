import DashboardPage from '@/views/DashboardPage.vue'
import { createRouter, createWebHistory } from 'vue-router'
import ServicePage from '@/views/ServicePage.vue'
import LogsPage from '@/views/LogsPage.vue'
import SettingsPage from '@/views/SettingsPage.vue'
import LoadingPage from '@/views/LoadingPage.vue'
import SetupPage from '@/views/SetupPage.vue'
import DownloadPage from '@/views/DownloadPage.vue'
import VersionPage from '@/views/VersionPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DashboardPage,
      meta: { title: 'Dashboard' },
    },
    {
      path: '/services',
      component: ServicePage,
      meta: { title: 'Services' },
    },
    {
      path: '/logs',
      component: LogsPage,
      meta: { title: 'Logs' },
    },
    {
      path: '/version',
      component: VersionPage,
      meta: { title: 'Version' },
    },
    {
      path: '/settings',
      component: SettingsPage,
      meta: { title: 'Settings' },
    },
    {
      path: '/setup',
      component: SetupPage,
      meta: { title: 'Setup' },
    },
    {
      path: '/download',
      component: DownloadPage,
      meta: { title: 'Download' },
    },
  ],
})

export default router
