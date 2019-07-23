<template>
  <div id="app">
    <header-menu :no-sidebar="true" />
    <div id="wrapper">
    <!-- <div id="nav">
       |
      <router-link to="/about">About</router-link>
    </div> -->
      <side-bar :menu="sidebarMenu" />
      <div id="page-content-wrapper" style="overflow-wrap: break-word;">
        <div v-if="!isLoadingModule" class="container-fluid-none">
          <router-view/>
        </div>
        <div v-else class="text-center">
          <img src="/loading-circle.gif">
          <br>Loading components...
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/vue-web-core/assets/style/custom-theme.scss'
import store from '@/vue-web-core/system/store'

import HeaderMenu from '@/vue-web-core/components/common/navigation/HeaderMenu.vue'
import SideBar from '@/vue-web-core/components/common/navigation/SideBar.vue'
window.$ = require('jquery')
window.jQuery = window.$

export default {
  name: 'home',
  components: {
    SideBar,
    HeaderMenu
  },
  mounted(){
    store.commit('setAuthToken', localStorage.getItem('default_auth_token'))
    $('#loadingApplicationMessage').hide()
    $('#app').show()
  },
  data () {
    return {
      sidebarMenu: [{
        name: 'Product'
      }, {
        name: 'Category'
      }, {
        name: 'Discount'
      }]
    }
  },
  computed: {
    isLoadingModule () {
      return store.state.isModuleLoading
    }
  }
}
</script>
<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
