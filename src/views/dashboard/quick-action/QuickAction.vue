<template>
  <div class="border rounded px-2 pt-2 border-secondary1 bg-whitesmoke mb-3">
    <h6 class="font-weight-bold text-uppercase">Quick Actions</h6>
    <div class="row  mx-0">
      <div v-if="!isTerminal" class="col-sm-12 col-md-6 px-1 mb-2">
        <set-terminal  />
      </div>
      <div v-show="quickActionCardVisibility['manage_master_list']" class="col-sm-12 col-md-6 px-1 mb-2">
        <manage-master-list @toggle="toggleQuickActionCard('manage_master_list', $event)" />
      </div>
      <div v-if="isTerminal" class="col-sm-12 col-md-6 px-1 mb-2">
        <back-up-database/>
      </div>
      <div v-if="isTerminal && canInstall" class="col-sm-12 col-md-6 px-1 mb-2">
        <install />
      </div>
      <div v-if="isTerminal" class="col-sm-12 col-md-6 px-1 mb-2">
        <unset-terminal />
      </div>
    </div>
  </div>
</template>
<script>
import PWAInstall from '@/vue-web-core/helper/pwa-install-store'
import SetTerminal from './SetTerminal'
import UnsetTerminal from './UnsetTerminal'
import Install from './Install'
import BackUpDatabase from './BackUpDatabase.vue'
import ManageMasterList from './ManageMasterList'
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
      quickActionCardVisibility: {
        manage_master_list: false
      }
    }
  },
  methods: {
    init(){
      // TODO refresh the charts
    },
    toggleQuickActionCard(card, show){
      console.log('waya')
      this.quickActionCardVisibility[card] = show
    }
  },
  computed: {
    canInstall(){
      return PWAInstall.state.deferredPrompt
    }
  }
}
</script>
