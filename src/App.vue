<template>
  <div id="app" style="padding-top:56px" @mouseover="isMouseOnPage = true" @mouseleave="isMouseOnPage = false">
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
    <div id="wrapper" v-bind:class="(noSidebar) ? 'toggled' : ''">
      <side-bar :menu="sidebarMenu" />
      <div id="page-content-wrapper" style="overflow-wrap: break-word;">
        <div v-if="!isLoadingModule" class="container-fluid-none">
          <router-view/>
        </div>
        <div v-else class="text-center">
          <img src="/img/loading.gif" width="100px">
          <br>Loading components...
          {{isLoadingModule + ''}} {{dataSynced + ''}}
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
import SyncStore from '@/database/sync/sync-store'
import Migrate from '@/database/migrate'
import UpSync from '@/system/upSync'
import Menu from '@/system/menus'
window.$ = require('jquery')
window.jQuery = window.$
export default {
  name: 'home',
  components: {
    SideBar,
    HeaderMenu,
    Modal
  },
  beforeCreate() {
    window.addEventListener('beforeunload', event => {
      console.log(localStorage.getItem('is_terminal'))
      if(!this.isMouseOnPage){
        if(localStorage.getItem('is_terminal') && localStorage.getItem('user_id')){
          event.returnValue = 'Are you sure you want to close Verge POS?'
        }
      }
    })
  },
  mounted(){
    store.commit('setAuthToken', localStorage.getItem('default_auth_token'))
    $('#loadingApplicationMessage').hide()
    $('#app').show()
    this.migrateDB().finally(() => {
      this.checkConnectivity().then((ping) => { // Online
        if(this.$auth.check()){ // Online and logged in
          // TODO Diri ang problema kay dili siya ready
          console.log('online login ready')
          store.dispatch('setUserInformation')
          this.sync()
        }else{ // Online but not logged in
          console.log('online - log out 2')
          store.dispatch('setUserInformation')
          this.sync()
        }
      }).catch((status) => { // Offline
        console.log('offline', status)
        store.dispatch('setUserInformationOffline')
        this.sync()
      }).finally(() => {
      })
    })
  },
  data () {
    return {
      migrated: false,
      isOffline: false,
      syncAll: new SyncAll(),
      dataSynced: 0,
      navConfig: navigationConfig,
      sidebarMenu: Menu.side_menus,
      headerMenu: Menu.header_menus,
      isMouseOnPage: false
    }
  },
  methods: {
    migrateDB(){
      return new Promise((resolve, reject) => {
        if(this.migrated){
          resolve(true)
        }else{
          let migrate = new Migrate()
          migrate.migrate(() => {
            this.migrated = true
            resolve(true)
          })
        }
      })
    },
    sync(){
      setTimeout(() => {
        if(this.dataSynced !== 1){
          this.$refs.modal._open()
        }
      }, 300)
      return new Promise((resolve, reject) => {
        (async () => {
          if(!this.migrated){
            await this.migrateDB()
          }
          store.commit('isReady', () => {
            if(this.userID && localStorage.getItem('is_terminal')){
              this.checkConnectivity().then((ping) => {
                this.syncAll.downSync((progress) => {
                  this.dataSynced = progress
                  if(progress === 1){
                    setTimeout(() => {
                      this.doneSynching()
                      resolve(true)
                    }, 500)
                  }
                })
              }).catch(() => {
                SyncStore.commit('isNotSynching')
                this.doneSynching()
                resolve(true)
              })
            }else{
              SyncStore.commit('isNotSynching')
              this.doneSynching()
              resolve(true)
            }
          })
        })()
      })
    },
    doneSynching(){
      this.dataSynced = 1
      setTimeout(() => {
        this.$refs.modal._close()
      }, 400)
      if(this.userID && localStorage.getItem('is_terminal')){
        setTimeout(() => {
          UpSync.silentSync()
        }, 100)
      }
    }
  },
  watch: {
    userID(newData){
      this.sync()
    }
  },
  computed: {
    userID(){
      return store.state.userInformation ? store.state.userInformation.id : null
    },
    noSidebar(){
      return !navigationConfig.noSideBar && navigationConfig.sidebarToggled
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
