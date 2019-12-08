import Vue from 'vue'
import Router from 'vue-router'
import store from '@/vue-web-core/system/store'

Vue.use(Router)
let routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue')
    // component: () => import('./views/routine_timer/RoutineTimer.vue')
  }, {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./views/dashboard/Dashboard.vue'),
    meta: {
      auth: true
    }
    // component: () => import('./views/routine_timer/RoutineTimer.vue')
  },
  {
    path: '/company_registration',
    name: 'CompanyRegistration',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/registration/CompanyRegistration.vue')
      }
    },
    meta: {
      auth: false
    }
  },
  {
    path: '/user_management',
    name: 'UserManagement',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/user_management/UserManagement.vue')
      }
    },
    meta: {
      // auth: false
    }
  },
  {
    path: '/pos',
    name: 'POS',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/pos/POS.vue')
      }
    },
    meta: {
      auth: true
    }
  },
  {
    path: '/category',
    name: 'Category',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/product_management/CategoryManagement.vue')
      }
    },
    meta: {
      auth: true
    }
  },
  {
    path: '/product',
    name: 'Product',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/product_management/ProductManagement.vue')
      }
    },
    meta: {
      auth: true
    }
  },
  {
    path: '/discount',
    name: 'Discount',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/product_management/DiscountManagement.vue')
      }
    },
    meta: {
      auth: true
    }
  },
  {
    path: '/z-reading',
    name: 'ZReading',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/terminal_reports/ZReading.vue')
      }
    },
    meta: {
    }
  },
  {
    path: '/x-reading',
    name: 'XReading',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/terminal_reports/XReading.vue')
      }
    },
    meta: {
    }
  },
  {
    path: '/transaction-history',
    name: 'TransactionHistory',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/terminal_reports/TransactionHistory.vue')
      }
    },
    meta: {
    }
  },
  {
    path: '/product-performance',
    name: 'productPerformance',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/terminal_reports/ProductPerformance.vue')
      }
    },
    meta: {
    }
  },
  {
    path: '/product_performance',
    name: 'ProductPerformance',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/reports/ProductPerformance.vue')
      }
    },
    meta: {
    }
  }
]
let router = new Router({
  routes: routes
})
router.beforeResolve((to, from, next) => {
  // If this isn't an initial page load.
  if (to.name) {
    store.commit('setModuleLoading', true)
  }
  next()
})
router.afterEach((to, from) => {
  // Complete the animation of the route progress bar.
  store.commit('setModuleLoading', false)
})

export default router
