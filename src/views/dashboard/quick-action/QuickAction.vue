<template>
  <div class="mb-3">
    <h6 class="font-weight-bold text-uppercase">Quick Actions</h6>
    <div v-show="isReady" class="row border px-1 pt-2 rounded mx-0 bg-primary">
      <div v-show="quickActionCardVisibility['manage_master_list']" class="col-sm-12 col-md-6 px-1 mb-2">
        <manage-master-list @toggle="toggleQuickActionCard('manage_master_list', $event)" />
      </div>
      <div v-if="quickActionCardVisibility['set_terminal']" class="col-sm-12 col-md-6 px-1 mb-2">
        <set-terminal  />
      </div>
      <div v-if="quickActionCardVisibility['install']" class="col-sm-12 col-md-6 px-1 mb-2">
        <install />
      </div>
      <div v-if="quickActionCardVisibility['back_up_database']" class="col-sm-12 col-md-6 px-1 mb-2">
        <back-up-database/>
      </div>
      <div v-if="quickActionCardVisibility['unset_terminal']" class="col-sm-12 col-md-6 px-1 mb-2">
        <unset-terminal />
      </div>

    </div>
    <div v-show="!isReady" class="row border px-1 pt-2 rounded mx-0 bg-primary justify-content-center">
      <div class="col-sm-11 col-md-6 bg-white mb-2 rounded py-2 text-center border">
        <fa icon="circle-notch" spin /> Please wait...
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import PWAInstall from '@/vue-web-core/helper/pwa-install-store'
import SetTerminal from './SetTerminal'
import UnsetTerminal from './UnsetTerminal'
import Install from './Install'
import BackUpDatabase from './BackUpDatabase.vue'
import ManageMasterList from './ManageMasterList'
import UserStore from '@/vue-web-core/system/store'
export default {
  components: {
    SetTerminal,
    UnsetTerminal,
    BackUpDatabase,
    Install,
    ManageMasterList
  },
  mounted(){
    this.init()
  },
  data(){
    return {
      isTerminal: localStorage.getItem('is_terminal'),
      isReady: false,
      quickActionCardVisibility: {
        set_terminal: false,
        manage_master_list: false,
        back_up_database: false,
        install: false,
        unset_terminal: false,
      }
    }
  },
  methods: {
    init(){
      this.initCardVisibility()
    },
    initCardVisibility(){
      let previousManageMasterListState = this.quickActionCardVisibility['manage_master_list']
      Vue.set(this.quickActionCardVisibility, 'set_terminal', false)
      Vue.set(this.quickActionCardVisibility, 'manage_master_list', false)
      Vue.set(this.quickActionCardVisibility, 'back_up_database', false)
      Vue.set(this.quickActionCardVisibility, 'install', this.canInstall)
      Vue.set(this.quickActionCardVisibility, 'unset_terminal', false)
      if(this.isTerminal){
        Vue.set(this.quickActionCardVisibility, 'back_up_database', true)
        if(this.isAdmin || this.isManager){
          Vue.set(this.quickActionCardVisibility, 'install', this.canInstall)
          Vue.set(this.quickActionCardVisibility, 'manage_master_list', previousManageMasterListState)
          Vue.set(this.quickActionCardVisibility, 'unset_terminal', true)
        }
      }else{
        if(this.isAdmin || this.isManager){
          Vue.set(this.quickActionCardVisibility, 'set_terminal', true)
        }
      }
    },
    toggleQuickActionCard(card, show){
      if(show){
        switch(card){
          case 'manage_master_list':
            setTimeout(() => {
              this.isReady = true
            }, 500)
            if(this.isAdmin || this.isManager){
              this.quickActionCardVisibility[card] = true
            }else{
              this.quickActionCardVisibility[card] = false
            }
            break
          default:
            this.quickActionCardVisibility[card] = true
        }
      }else{
        this.quickActionCardVisibility[card] = false
      }
    }
  },
  watch: {
    canInstall(newData){
      this.toggleQuickActionCard('install', newData)
    }
  },
  computed: {
    canInstall(){
      return PWAInstall.state.deferredPrompt
    },
    isAdmin(){
      return typeof UserStore.getters.userRoles['100'] !== 'undefined'
    },
    isCashier(){
      return typeof UserStore.getters.userRoles['101'] !== 'undefined'
    },
    isManager(){
      return typeof UserStore.getters.userRoles['102'] !== 'undefined'
    }
  }
}
</script>
