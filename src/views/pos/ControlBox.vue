<template>
  <div>
    <div class="row no-gutters mb-2">
      <div class="col-12 col-md-9">
        <button @click="toggleFullscreen" class="btn btn-outline-dark mr-1" :title="isFullscreen ? 'Minimize Screen' : 'Full Screen'"><fa :icon="!isFullscreen2 ? 'window-maximize' : 'window-minimize'" /></button>
        <button @click="refreshApp" class="btn btn-outline-dark mr-1" title="Refresh the app"><fa :icon="'redo'" /></button>
        <button @click="clearCart" class="btn btn-outline-dark mr-1" title="Clear Cart"><fa :icon="'trash'" /></button>
        <button @click="viewTransaction" class="btn btn-outline-dark mr-1" title="Open Transaction"><fa :icon="'receipt'" /></button>
        <button @click="benchmark" class="btn btn-outline-dark" title="Create Test Transactions"><fa :icon="'vial'" class="text-info" /></button>
      </div>
      <div class="col-md-3 pt-2 text-right d-none d-sm-block pb-2">
        {{liveTime}} <big v-bind:class="connectionSpeed ? 'text-success' : 'text-secondary'" class="ml-2 "><span v-bind:title="isSynching ? 'Synching Data' : 'Internet Availability'" v-bind:class="isSynching ? 'blink' : ''"><fa icon="wifi" /></span></big>
      </div>
    </div>
    <transaction-viewer ref="TransactionViewer" />
    <benchmark ref="benchmark" />
    <modal ref="modal" size="sm">
      <template v-slot:body>
        <div class="text-center">
          <p class="">Are you sure you want to clear your cart?</p>
          <div class="">
            <button class="btn btn-primary mr-3" @click="proceed"><fa icon="trash" /> Clear Cart</button>
            <button class="btn btn-outline-secondary" @click="decline">No</button>
          </div>
        </div>
      </template>
    </modal>
  </div>
</template>
<script>
import TransactionViewer from './control_box_components/TransactionViewer'
import Benchmark from './control_box_components/Benchmark'
import ToggleFullscreen from '@/helpers/toggle-fullscreen'
import Cart from './cart-store'
import Modal from '@/vue-web-core/components/bootstrap/Modal.vue'
import SyncStore from '@/database/sync/sync-store'
export default {
  components: {
    TransactionViewer,
    Benchmark,
    Modal
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
      isFullscreen: false
    }
  },
  methods: {
    proceed(){
      Cart.commit('reset')
      this.$refs.modal._close()
    },
    decline(){
      this.$refs.modal._close()
    },
    toggleFullscreen(){
      this.isFullscreen = ToggleFullscreen.toggle()
    },
    clearCart(){
      this.$refs.modal._open()
    },
    refreshApp(){
      location.reload()
    },
    viewTransaction(){
      this.$refs.TransactionViewer._open(Cart.state.latestTransactionNumber ? Cart.state.latestTransactionNumber : null)
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
  computed: {
    isFullscreen2(){
      return ToggleFullscreen.store.getters.isFullscreen
    },
    isSynching(){
      return SyncStore.getters.isSynching
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
