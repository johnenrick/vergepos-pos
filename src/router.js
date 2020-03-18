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
  }, {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./views/dashboard/Dashboard.vue'),
    meta: {
      // auth: false,
      auth_offline: true
    }
  },
  {
    path: '/company-registration',
    name: 'CompanyRegistration',
    component: () => {
      store.commit('setModuleLoading', true)
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
    path: '/user-management',
    name: 'UserManagement',
    component: () => {
      store.commit('setModuleLoading', true)
      return {
        component: import('@/views/user_management/UserManagement.vue')
      }
    },
    meta: {
      auth_offline: false
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
    path: '/x-reading',
    name: 'XReading',
    component: require('@/views/terminal_reports/XReading.vue').default,
    meta: {
      auth_offline: true
    }
  },
  {
    path: '/transaction-history',
    name: 'TransactionHistory',
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
    path: '/dev-config',
    name: 'DevConfig',
    component: require('@/views/dev-config/Config.vue').default,
    meta: {
      no_sidebar: true
    }
  },
  {
    path: '/error/online-only',
    name: 'OnlineOnlyPage',
    component: require('@/views/error/OnlineOnly.vue').default,
    meta: {
    }
  },
  {
    path: '/error/not-found',
    name: 'NotFoundPage',
    component: require('@/views/error/NotFound.vue').default,
    meta: {
    }
  },
  {
    path: '/error/cannot-access',
    name: 'CannotAccess',
    component: require('@/views/error/CannotAccess.vue').default,
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
  if(from.path !== to.path){
    if(typeof to.meta.auth_offline !== 'undefined'){
      store.commit('isReady', () => {
        if(to.meta.auth_offline && store.getters.user){
          next()
          store.commit('setModuleLoading', false)
        }else{
          next({ path: '/error/online-only' })
          store.commit('setModuleLoading', false)
        }
      })
    }else{
      next()
      store.commit('setModuleLoading', false)
    }
  }else{
    next()
    store.commit('setModuleLoading', false)
  }
  if(typeof to.meta.no_sidebar !== 'undefined' && to.meta.no_sidebar){
    navConfig.noSideBar = true
  }else{
    navConfig.noSideBar = false
  }
})

export default router
