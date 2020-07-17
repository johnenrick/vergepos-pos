<template>
  <div
    id="app"
    style="padding-top:67px"
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
        <div v-if="!isLoadingModule" class="container-fluid-none">
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
<style scoped>
.mt-5 {
  margin-top: 30% !important;
}
</style>

<script>
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
    window.addEventListener('beforeinstallprompt', e => {
      console.log('PWA Install Enabled')
      e.preventDefault()
      PWAInstall.commit('deferredPrompt', e)
    })
    window.addEventListener('beforeunload', event => {
      if (!this.isMouseOnPage) {
        if (
          localStorage.getItem('is_terminal') &&
          localStorage.getItem('user_id')
        ) {
          event.returnValue = 'Are you sure you want to close Verge POS?'
        }
      }
    })
  },
  mounted() {
    document.getElementById('loadingVueAppIndicator').style.display = 'none' // hide the loading indicator before the vue is loaded
    store.commit('setAuthToken', localStorage.getItem('default_auth_token'))
    $('#loadingApplicationMessage').hide()
    $('#app').show()
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
          })
          .catch(status => {
            // Offline
            store.dispatch('setUserInformationOffline')
          })
      }
    })
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
      isMouseOnPage: false
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
    doneSynching() {
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
