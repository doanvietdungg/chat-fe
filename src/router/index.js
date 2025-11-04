import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/chat'
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('../views/ChatView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/chat/:chatId',
    name: 'ChatWithId',
    component: () => import('../views/ChatView.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/AuthView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/demo/notifications',
    name: 'NotificationDemo',
    component: () => import('../components/NotificationDemo.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/demo/telegram-sidebar',
    name: 'TelegramSidebarDemo',
    component: () => import('../components/TelegramSidebarDemo.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/demo',
    name: 'DemoView',
    component: () => import('../views/DemoView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/demo/file-upload',
    name: 'FileUploadDemo',
    component: () => import('../components/FileUploadDemo.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/demo/context-menu',
    name: 'MessageContextMenuDemo',
    component: () => import('../components/MessageContextMenuDemo.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/test/context-menu',
    name: 'ContextMenuTest',
    component: () => import('../components/ContextMenuTest.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/demo/sidebar',
    name: 'MainSidebarDemo',
    component: () => import('../components/MainSidebarDemo.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/demo/new-features',
    name: 'NewFeaturesDemo',
    component: () => import('../views/NewFeaturesDemo.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/demo/simple',
    name: 'SimpleDemo',
    component: () => import('../views/SimpleDemo.vue'),
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  try {
    const authStore = useAuthStore()
    
    console.log('Router guard - navigating to:', to.path)
    console.log('Router guard - isAuthenticated:', authStore.isAuthenticated)
    console.log('Router guard - user:', authStore.user)
    console.log('Router guard - token exists:', !!localStorage.getItem('auth_token'))
    
    // If we have a token but auth store hasn't loaded yet, wait a bit
    const hasToken = !!localStorage.getItem('auth_token')
    if (hasToken && !authStore.isAuthenticated && !authStore.user) {
      console.log('Has token but not authenticated yet, waiting...')
      // Wait for auth store to process the token
      let attempts = 0
      while (attempts < 10 && hasToken && !authStore.isAuthenticated) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      console.log('After waiting - isAuthenticated:', authStore.isAuthenticated)
    }
    
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      console.log('🚫 Redirecting to login - auth required but not authenticated')
      console.log('🚫 Route meta:', to.meta)
      console.log('🚫 Auth state:', { isAuthenticated: authStore.isAuthenticated, hasUser: !!authStore.user })
      next('/login')
    } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
      console.log('🔄 Redirecting to chat - guest route but authenticated')
      next('/chat')
    } else {
      console.log('✅ Allowing navigation to:', to.path)
      next()
    }
  } catch (error) {
    console.error('Router guard error:', error)
    // Fallback: allow navigation
    next()
  }
})

export default router