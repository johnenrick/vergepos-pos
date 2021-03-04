<template>
  <div>
    <div class="row no-gutters bg-white">
      <div class="col-9 ">
        <button @click="toggleFullscreen" class="btn btn-outline-dark mr-1" :title="isFullscreen ? 'Minimize Screen' : 'Full Screen'"><fa :icon="!isFullscreen2 ? 'window-maximize' : 'window-minimize'" /></button>
        <button @click="refreshApp" class="btn btn-outline-dark mr-1" title="Refresh the app"><fa :icon="'redo'" /></button>
        <button @click="clearCart" class="btn btn-outline-dark mr-1" title="Clear Cart"><fa :icon="'trash'" /></button>
        <button @click="viewTransaction" class="btn btn-outline-dark mr-1" title="Open Transaction"><fa :icon="'receipt'" /></button>
        <button @click="openFAQ" class="btn btn-outline-dark mr-1" title="Open FAQ"><fa :icon="'question'" /></button>
        <button v-if="workShiftDetailId" @click="openCloseWorkShift" class="btn btn-primary mr-1" title="End Shift"><fa :icon="'user-clock'" /> Shift</button>
        <!-- <button v-if="inDevMode" @click="benchmark" class="btn btn-outline-dark mr-1" title="Create Test Transactions"><fa :icon="'vial'" class="text-info" /></button> -->
        <!-- <Sync  /> -->
      </div>
      <div class="col-3 pt-2 text-right d-none d-sm-block pb-2">
        {{liveTime}} <big v-bind:class="connectionSpeed ? 'text-success' : 'text-secondary'" class="ml-2 "><span v-bind:title="isSynching ? 'Synching Data' : 'Internet Availability'" v-bind:class="isSynching ? 'blink' : ''"><fa icon="wifi" /></span></big>
      </div>
    </div>
    <transaction-viewer ref="TransactionViewer" />
    <Benchmark ref="benchmark" />
    <DialogBox ref="dialogBox" />
    <FAQ ref="faq" />
    <CloseWorkShift ref="closeWorkShift" />
  </div>
</template>
<script>
import TransactionViewer from './control_box_components/TransactionViewer'
import Benchmark from './control_box_components/Benchmark'
import ToggleFullscreen from '@/helpers/toggle-fullscreen'
import SyncStore from '@/database/sync/sync-store'
import DialogBox from '@/vue-web-core/components/DialogBox'
import FAQ from './control_box_components/FAQ'
import CloseWorkShift from './control_box_components/CloseWorkShift'
// import Sync from './control_box_components/Sync.vue'
import CartStore from './cart-store'
export default {
  components: {
    TransactionViewer,
    Benchmark,
    DialogBox,
    FAQ,
    // Sync,
    CloseWorkShift
  },
  mounted(){
    this.runLiveTime()
  },
  props: {
  },
  data(){
    return {
      liveTime: null,
      connectionSpeed: 0,
      isFullscreen: false,
      inDevMode: process.env.NODE_ENV === 'development' || localStorage.getItem('in_development_mode')
    }
  },
  methods: {
    openFAQ(){
      this.$refs.faq._open()
    },
    openCloseWorkShift(){
      this.$refs.closeWorkShift._open()
    },
    toggleFullscreen(){
      this.isFullscreen = ToggleFullscreen.toggle()
    },
    clearCart(){
      this.$refs.dialogBox._open('Do you want to clear the orders?', {
        yes_icon: 'trash',
        yes_label: 'Clear Orders',
      }).then((answer) => {
        if(answer === 'yes'){
          CartStore.commit('reset')
        }
      })
    },
    refreshApp(){
      this.$refs.dialogBox._open('Are you sure you want to clear your cart?', {
        yes_icon: 'redo',
        yes_label: 'Refresh',
      }).then((answer) => {
        if(answer === 'yes'){
          location.reload()
        }
      })
    },
    viewTransaction(){
      this.$refs.TransactionViewer._open(CartStore.state.latestTransactionNumber ? CartStore.state.latestTransactionNumber : null)
    },
    benchmark(){
      this.$refs.benchmark._open()
    },
    runLiveTime(){
      let currentDate = new Date()
      this.liveTime = this.time12HourFormat(currentDate.getHours(), currentDate.getMinutes())
      setTimeout(() => {
        this.runLiveTime()
      }, 60 - currentDate.getSeconds())
    },
  },
  watch: {
  },
  computed: {
    isFullscreen2(){
      return ToggleFullscreen.store.getters.isFullscreen
    },
    isSynching(){
      return SyncStore.getters.isSynching
    },
    workShiftDetailId(){
      return typeof CartStore.getters.workShiftDetail['id'] !== 'undefined' ? CartStore.getters.workShiftDetail['id'] : null
    }
  }
}
</script>
<style>
/* @group Blink */
.blink {
  -webkit-animation: blink .75s linear infinite;
  -moz-animation: blink .75s linear infinite;
  -ms-animation: blink .75s linear infinite;
  -o-animation: blink .75s linear infinite;
   animation: blink .75s linear infinite;
}
@-webkit-keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 1; }
  50.01% { opacity: 0; }
  100% { opacity: 0; }
}
@-moz-keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 1; }
  50.01% { opacity: 0; }
  100% { opacity: 0; }
}
@-ms-keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 1; }
  50.01% { opacity: 0; }
  100% { opacity: 0; }
}
@-o-keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 1; }
  50.01% { opacity: 0; }
  100% { opacity: 0; }
}
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 1; }
  50.01% { opacity: 0; }
  100% { opacity: 0; }
}
/* @end */

</style>
