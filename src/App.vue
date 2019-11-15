<template>
  <div id="app" style="padding-top:56px">
    <modal ref="modal" :closeable="false">
      <template v-slot:body >
        <div class="text-center">
          <h1 class="text-primary"><fa icon="server" /></h1>
          <p>Syncing data from the server. Please wait...</p>
          <span v-if="dataSynced < 1">{{(dataSynced * 100).toFixed(2)}}%</span>
          <span v-else-if="dataSynced === 1" class="text-success">Synchronization Complete!</span>
        </div >
      </template>
    </modal>
    <header-menu :menu="headerMenu"  :default-company-name="'VergePOS'"/>
    <div id="wrapper" v-bind:class="$auth.check() && (navConfig.sidebarToggled && !navConfig.noSideBar) ? 'toggled' : ''">
      <side-bar :menu="sidebarMenu" />
      <div id="page-content-wrapper" style="overflow-wrap: break-word;">
        <div v-if="!isLoadingModule && dataSynced === 1" class="container-fluid-none">
          <router-view/>
        </div>
        <div v-else class="text-center">
          <img src="/img/loading.gif" width="100px">
          <br>Loading components...
        </div>
      </div>
    </div>

  </div>
</template>
<script>
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/assets/style/custom-theme.scss'
import store from '@/vue-web-core/system/store'
import navigationConfig from '@/vue-web-core/components/common/navigation/config.js'
import HeaderMenu from '@/vue-web-core/components/common/navigation/HeaderMenu.vue'
import SideBar from '@/vue-web-core/components/common/navigation/SideBar.vue'
import Modal from '@/vue-web-core/components/bootstrap/Modal.vue'
import SyncAll from '@/database/sync/sync-all'
import Migrate from '@/database/migrate'
window.$ = require('jquery')
window.jQuery = window.$
export default {
  name: 'home',
  components: {
    SideBar,
    HeaderMenu,
    Modal
  },
  mounted(){
    store.commit('setAuthToken', localStorage.getItem('default_auth_token'))
    $('#loadingApplicationMessage').hide()
    $('#app').show()

    if(!this.$auth.token()){
      this.dataSynced = 1
    }
    let migrate = new Migrate()
    migrate.migrate(() => {
      this.migrated = true
      if(this.userID){
        this.sync()
      }
    })
  },
  data () {
    return {
      migrated: false,
      syncAll: new SyncAll(),
      dataSynced: 0,
      navConfig: navigationConfig,
      sidebarMenu: [{
        icon: 'box',
        name: 'Product'
      }, {
        icon: 'boxes',
        name: 'Category'
      }, {
        icon: 'percent',
        name: 'Discount'
      }, {
        icon: 'file-contract',
        name: 'Terminal Reports',
        sub_item: [{
          name: 'Transactions'
        }, {
          name: 'X Reading'
        }, {
          name: 'Z Reading'
        }]
      }, {
        icon: 'file-contract',
        name: 'Reports',
        sub_item: [{
          name: 'Product Performance'
        }, {
          name: 'Overall Z Reading'
        }]
      }, {
        icon: 'tools',
        name: 'Admin',
        sub_item: [{
          icon: 'users',
          name: 'Users',
          route: '/user_management'
        }, {
          icon: 'store',
          name: 'Stores'
        }]
      }],
      headerMenu: [{
        name: 'Manage',
        link: 'dashboard',
        icon: 'list'
      }, {
        icon: 'cash-register',
        name: 'POS',
        no_sidebar: true
      }]
    }
  },
  methods: {
    sync(){
      this.$refs.modal._open()
      this.syncAll.downSync((progress) => {
        this.dataSynced = progress
        if(progress === 1){
          setTimeout(() => {
            this.$refs.modal._close()
          }, 500)
        }
      })
    }
  },
  watch: {
    userID(newData){
      if(this.migrated){
        this.sync()
      }
      if(!newData){
        this.dataSynced = 1
      }
    }
  },
  computed: {
    userID(){
      return store.state.userInformation.id
    },
    isLoadingModule () {
      return store.state.isModuleLoading
    }
  }
}
</script>
<style lang="scss" scoped>
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
