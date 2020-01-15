<template>
  <div id="app" style="padding-top:56px">
    <modal ref="modal" :closeable="false">
      <template v-slot:body >
        <div class="text-center">
          <h1 class="text-primary"><fa icon="server" /></h1>
          <p>Synching data from the server. Please wait...</p>
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
          name: 'Transactions',
          route: 'transaction-history'
        }, {
          name: 'Product Performance',
          route: 'product-performance'
        }, {
          name: 'X Reading'
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
        name: 'Business',
        sub_item: [{
          icon: 'users',
          name: 'Users',
          route: '/user_management'
        }, {
          icon: 'store',
          name: 'Business Detail'
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
      let migrate = new Migrate()
      migrate.migrate(() => {
        this.migrated = true
        if(this.userID){
          this.syncAll.downSync((progress) => {
            this.dataSynced = progress
            if(progress === 1){
              setTimeout(() => {
                this.doneSynching()
              }, 500)
            }
          })
        }else{
          this.doneSynching()
        }
      })
    },
    doneSynching(){
      this.dataSynced = 1
      this.$refs.modal._close()
    }
  },
  watch: {
    userID(newData){
      this.sync()
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
  font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
  // text-align: center;
  color: #505050!important;;
  font-size: 14px;
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
