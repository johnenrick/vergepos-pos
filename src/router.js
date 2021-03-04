import Vue from 'vue'
import Router from 'vue-router'
import store from '@/vue-web-core/system/store'
import navConfig from '@/vue-web-core/components/common/navigation/config.js'

Vue.use(Router)
let routes = [
  {
    path: '/',
    name: 'home',
    component: require('./views/Home.vue').default,
    meta: {
      no_sidebar: true,
      // auth_offline: false,
      // auth: false
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: require('./views/dashboard/Dashboard.vue').default,
    meta: {
      // auth: false,
      auth_offline: true
    }
  },
  {
    path: '/company-registration',
    name: 'CompanyRegistration',
    component: () => {
      return {
        component: import('@/views/registration/CompanyRegistration.vue')
      }
    },
    meta: {
      auth: false,
      no_sidebar: true
    }
  },
  {
    path: '/password-reset',
    name: 'PasswordReset',
    component: () => {
      return {
        component: import('@/views/PasswordReset.vue')
      }
    },
    meta: {
      no_sidebar: true
    }
  },
  {
    path: '/user-management',
    name: 'UserManagement',
    component: () => import('@/views/user_management/UserManagement.vue'),
    meta: {
      auth_offline: true
    }
  },
  {
    path: '/pos',
    name: 'POS',
    component: require('@/views/pos/POS.vue').default,
    meta: {
      auth_offline: true,
      no_sidebar: true
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
    component: require('@/views/product_management/ProductManagement.vue').default,
    meta: {
      auth_offline: true
    }
  }, {
    path: '/inventory',
    name: 'Inventory',
    component: require('@/views/inventory/Inventory.vue').default,
    meta: {
      auth_offline: true
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
    path: '/customer',
    name: 'CustomerManagement',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/customer/Customer.vue')
      }
    },
    meta: {
      auth_offline: true,
      // auth: true
    }
  },
  {
    path: '/x-reading',
    name: 'XReading',
    component: require('@/views/terminal_reports/XReading.vue').default,
    meta: {
      auth_offline: true
    }
  },
  {
    path: '/transaction-history',
    name: 'TransactionHistoryTerminalReport',
    component: require('@/views/terminal_reports/TransactionHistory.vue').default,
    meta: {
      auth_offline: true
    }
  },
  {
    path: '/product-performance',
    name: 'productPerformance',
    component: require('@/views/terminal_reports/ProductPerformance.vue').default,
    meta: {
      auth_offline: true
    }
  },
  {
    path: '/work-shift',
    name: 'WorkShift',
    component: require('@/views/terminal_reports/WorkShift.vue').default,
    meta: {
      auth_offline: true
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
    meta: {}
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
      auth_offline: true
    }
  },
  {
    path: '/report/transaction-history',
    name: 'TransactionHistoryReport',
    component: require('@/views/reports/TransactionHistory.vue').default,
    meta: {
      auth: true
    }
  },
  {
    path: '/business-detail',
    name: 'BusinessDetail',
    component: require('@/views/business-detail/BusinessDetail.vue').default,
    meta: {
      auth_offline: true
    }
  },
  {
    path: '/account-setting',
    name: 'AccountSetting',
    component: require('@/views/account/AccountSetting.vue').default,
    meta: {
      auth_offline: true
    }
  },
  {
    path: '/terminal',
    name: 'TerminalManagement',
    component: require('@/views/terminal/Terminal.vue').default,
    meta: {
      auth_offline: true
    }
  },
  {
    path: '/dev-config',
    name: 'DevConfig',
    component: require('@/views/dev-config/Config.vue').default,
    meta: {
      no_sidebar: true
    }
  },
  {
    path: '/test',
    name: 'TestPage',
    component: require('@/views/dev-config/TestPage.vue').default,
    meta: {}
  },
  {
    path: '/terminal-report-not-terminal',
    name: 'TerminalReportNotTerminal',
    component: require('@/views/terminal_reports/NotTerminal.vue').default,
    meta: {
      auth: true
    }
  },
  {
    path: '/error/online-only',
    name: 'OnlineOnlyPage',
    component: require('@/views/error/OnlineOnly.vue').default,
    meta: {}
  },
  {
    path: '/error/not-found',
    name: 'NotFoundPage',
    component: require('@/views/error/NotFound.vue').default,
    meta: {}
  },
  {
    path: '/error/cannot-access',
    name: 'CannotAccess',
    component: require('@/views/error/CannotAccess.vue').default,
    meta: {}
  },
  {
    path: '*',
    redirect: '/error/not-found'
  },
  {
    path: '/contact-us',
    name: 'ContactUs',
    component: require('@/views/ContactUs.vue').default,
    meta: {}
  },
  {
    path: '/test-db',
    name: 'TestingDBPage',
    component: require('@/views/Testing.vue').default,
    meta: {}
  }
]
for (let x = 0; x < routes.length; x++) {
  routes[x]['beforeEnter'] = (to, from, next) => {
    // If this isn't an initial page load.
    if (to.name) {
      store.commit('setModuleLoading', true)
    }
    let toMeta = to.meta
    store.commit('isReady', () => {
      if (to.path === '/' && store.getters.user) {
        if (typeof store.getters.userRoles['100'] !== 'undefined') {
          next({ path: '/dashboard' })
          toMeta = routes[1]['meta']
        } else if (typeof store.getters.userRoles['101'] !== 'undefined') {
          next({ path: '/pos' })
        } else {
          next()
        }
      } else if (from.path !== to.path) {
        if (typeof to.meta.auth_offline !== 'undefined') {
          if (to.meta.auth_offline && store.getters.user) {
            next()
          } else {
            next('/')
            toMeta = routes[0]['meta']
          }
        } else {
          next()
        }
      } else {
        next()
      }
      store.commit('setModuleLoading', false)
      if (typeof toMeta.no_sidebar !== 'undefined' && toMeta.no_sidebar) {
        navConfig.noSideBar = true
      } else {
        navConfig.noSideBar = false
      }
    })
  }
}
let router = new Router({
  // mode: 'history',
  routes: routes
})
// router.beforeResolve()

export default router
