import Vue from 'vue'
import Router from 'vue-router'
import store from '@/vue-web-core/system/store'

Vue.use(Router)
let routes = [
  {
    path: '/',
    name: 'home',
    component: require('./views/Home.vue').default
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
    component: require('@/views/pos/POS.vue').default,
    meta: {
      // auth: true
      auth_offline: true
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
  }
]
let router = new Router({
  routes: routes
})
router.beforeResolve((to, from, next) => {
  // If this isn't an initial page load.
  console.log('after', from.path, to.path)
  if (to.name) {
    store.commit('setModuleLoading', true)
  }
  if(from.path !== to.path){
    if(typeof to.meta.auth_offline !== 'undefined'){
      if(to.meta.auth_offline && store.getters.user){
        next()
      }else{
        setTimeout(() => { // recheck again just incase store is not ready yet
          if(to.meta.auth_offline && store.getters.user){
            next()
          }else{
            next({ path: '/' })
            store.commit('setModuleLoading', false)
          }
        }, 500)
      }
    }else{
      next()
    }
  }else{
    next()
  }
})
router.afterEach((to, from) => {
  console.log('after', from.path, to.path)
  // Complete the animation of the route progress bar.
  store.commit('setModuleLoading', false)
})

export default router
