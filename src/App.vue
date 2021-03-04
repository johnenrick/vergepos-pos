<template>
  <div
    id="app"
    class="header-padding"
    @mouseover="isMouseOnPage = true"
    @mouseleave="isMouseOnPage = false"
  >
    <modal ref="modal" :closeable="false">
      <template v-slot:body>
        <div class="text-center">
          <h1 class="text-primary">
            <fa icon="server"/>
          </h1>
          <p>Synching data from the server. Please wait...</p>
          <span v-if="dataSynced < 1">{{(dataSynced * 100).toFixed(2)}}%</span>
          <span v-else-if="dataSynced === 1" class="text-success">Synchronization Complete!</span>
        </div>
      </template>
    </modal>

    <header-menu :menu="headerMenu" :default-company-name="'VergePOS Terminal'"/>
    <div id="wrapper" v-bind:class="(noSidebar) ? 'toggled' : ''">
      <side-bar ref="sideBar" :menu="sidebarMenu"/>
      <div id="page-content-wrapper" style="overflow-wrap: break-word;">
        <NoInternetError v-if="noInternetConnectionMessage" />
        <div ref="loadingComponentMessage" v-show="isLoadingModule" class="text-center" style="padding-top: 10vh">
          <h1 class="mb-1 display-3"><fa icon="circle-notch" spin /></h1>
          Loading components...
        </div>
        <div v-if="!isLoadingModule" class="container-fluid-none">
          <router-view/>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.mt-5 {
  margin-top: 30% !important;
}
</style>

<script>
import Vue from 'vue'
import 'bootstrap'

// import 'bootstrap/dist/css/bootstrap.min.css'
import '@/assets/style/custom-theme.scss'
import '@/vue-web-core/assets/style/util.scss'
import store from '@/vue-web-core/system/store'
import navigationConfig from '@/vue-web-core/components/common/navigation/config.js'
import HeaderMenu from '@/vue-web-core/components/common/navigation/HeaderMenu.vue'
import SideBar from '@/vue-web-core/components/common/navigation/SideBar.vue'
import Modal from '@/vue-web-core/components/bootstrap/Modal.vue'
import SyncAll from '@/database/sync/sync-all'
import SyncStore from '@/database/sync/sync-store'
import Migrate from '@/database/migrate'
import UpSync from '@/database/up-sync/up-sync'
import Menu from '@/system/menus'
import PWAInstall from '@/vue-web-core/helper/pwa-install-store'
import NoInternetError from '@/components/NoInternetError'
import Loading from '@/components/Loading'
window.$ = require('jquery')
window.jQuery = window.$
Vue.component('Loading', Loading)
export default {
  name: 'home',
  components: {
    SideBar,
    HeaderMenu,
    Modal,
    NoInternetError
  },
  beforeCreate() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      PWAInstall.commit('deferredPrompt', e)
    })

    // window.addEventListener('beforeunload', event => {
    //   if (localStorage.getItem('is_terminal') && localStorage.getItem('user_id')){
    //     return 'Are you sure you want to close Verge POS?'
    //   }
    // })
  },
  mounted() {
    document.getElementById('loadingVueAppIndicator').style.display = 'none' // hide the loading indicator before the vue is loaded
    store.commit('setAuthToken', localStorage.getItem('default_auth_token'))
    $('#loadingApplicationMessage').hide()
    $('#app').show()
    setTimeout(() => {
      this.migrateDB().finally(() => {
        if(this.mode === 'offline'){
          store.dispatch('setUserInformationOffline')
        } else {
          this.checkConnectivity()
            .then(ping => {
              // Online
              if (this.$auth.check()) {
                // Online and logged in
                // TODO Diri ang problema kay dili siya ready
                store.dispatch('setUserInformation')
              } else {
                // Online but not logged in
                store.dispatch('setUserInformation')
              }
              this.noInternetConnectionMessage = false
            })
            .catch(status => {
              // Offline
              if(localStorage.getItem('default_auth_token')){
                console.error('no internet')
                this.noInternetConnectionMessage = true
                this.$refs.loadingComponentMessage.style.display = 'none'
              }
              store.dispatch('setUserInformationOffline')
            })
        }
      })
    }, 200)
  },
  data() {
    return {
      migrated: false,
      isOffline: false,
      syncAll: SyncAll,
      dataSynced: 0,
      navConfig: navigationConfig,
      sidebarMenu: Menu.side_menus,
      headerMenu: Menu.header_menus,
      isMouseOnPage: false,
      noInternetConnectionMessage: false
    }
  },
  methods: {
    migrateDB() {
      return new Promise((resolve, reject) => {
        if (this.migrated) {
          resolve(true)
        } else {
          let migrate = new Migrate()
          migrate.migrate(() => {
            this.migrated = true
            resolve(true)
          })
        }
      })
    },
    sync() {
      setTimeout(() => {
        if (this.dataSynced !== 1) {
          this.$refs.modal._open()
        }
      }, 300)
      return new Promise((resolve, reject) => {
        (async () => {
          if (!this.migrated) {
            await this.migrateDB()
          }
          store.commit('isReady', () => {
            if(this.userID && localStorage.getItem('is_terminal')){
              this.checkConnectivity().then((ping) => {
                this.retrieveStoreTerminalDetail().finally(() => {
                  this.syncAll.downSync((progress) => {
                    this.dataSynced = progress
                    if(progress === 1){
                      setTimeout(() => {
                        this.doneSynching()
                        resolve(true)
                      }, 500)
                    }
                  })
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
    retrieveStoreTerminalDetail(){
      return new Promise(resolve => {
        let storeTerminalId = localStorage.getItem('is_terminal')
        const terminalDetails = localStorage.getItem('terminal_details')
        if((!storeTerminalId || typeof terminalDetails['store_id'] !== 'undefined') || this.mode === 'offline'){
          resolve(true)
        }else{
          const param = {
            id: storeTerminalId,
            select: ['description', 'serial_number', 'store_id']
          }
          console.log('getting store terminal details', terminalDetails, this.mode)
          this.apiRequest('store-terminal/retrieve', param, response => {
            if(response['data']){
              localStorage.setItem('terminal_details', JSON.stringify(response['data']))
            }
            resolve(true)
          })
        }
      })
    },
    doneSynching(){
      this.dataSynced = 1
      setTimeout(() => {
        this.$refs.modal._close()
      }, 400)
      if (this.userID && localStorage.getItem('is_terminal')) {
        setTimeout(() => {
          UpSync.silentSync()
        }, 100)
      }
      this.$refs.sideBar._initialize()
    }
  },
  watch: {
    userID(newData) {
      if (newData) {
        this.sync()
      }
    },
    isLoadingModule(newData){
      if(newData){
        this.$refs.loadingComponentMessage.style.display = null
      }else{
        this.$refs.loadingComponentMessage.style.display = 'none'
      }
    }
  },
  computed: {
    userID() {
      return store.state.userInformation
        ? store.state.userInformation.id
        : null
    },
    mode() {
      return store.getters.mode
    },
    noSidebar() {
      return !navigationConfig.noSideBar && navigationConfig.sidebarToggled
    },
    isLoadingModule () {
      return store.state.isModuleLoading
    }
  }
}
</script>
<style lang="scss" scoped>
// #nav {
//   padding: 30px;
//   a {
//     font-weight: bold;
//     color: #2c3e50;
//     &.router-link-exact-active {
//       color: #42b983;
//     }
//   }
// }
</style>
