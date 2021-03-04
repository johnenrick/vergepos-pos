<template>
  <div class="p-1">
    <div v-show="isTerminal" >
      <WorkShift v-show="sessionStatus !== 2" ref="workShift" @status-change="sessionStatusChange" />
      <div v-show="sessionStatus === 2" class="row no-gutters">
        <div v-show="currentView === 'order_list' || currentView === null" class="col-12 col-sm-12 col-md-5 pr-md-1 bg-white p-2 shadow-sm" >
          <order-list ref="orderList" @view-product-list="viewProductList"/>
        </div>
        <div
          v-show="currentView === 'product_list' || currentView === null"
          class="col-12 col-sm-12 col-md-7 pl-md-1"
        >
          <div class="bg-white p-2 shadow-sm">
            <button class="btn btn-outline-success w-100 mb-2 d-md-none bg-white" @click="viewOrderList">
              <fa icon="shopping-cart"/> View Cart (<em class="font-weight-bold"> {{totalAmount | numberToMoney}} </em>)
            </button>
            <control-box />
            <product-list ref="productList" />

          </div>
        </div>
      </div>
    </div>
    <div v-show="!isTerminal" class="text-center pt-4">
      <div class="p-3 bg-white boreder shadow-sm" style="display: inline-block">
        <div class="border rounded p-3 border-warning " >
          <div class="mb-3">
            <fa class="text-warning" icon="exclamation-triangle"/> This device is not a terminal.
          </div>
          <div class="mb-3">Go back to the Dashboard and click <strong class="text-nowrap"><fa icon="cash-register"/> Set As Terminal</strong> under <em>Quick Actions</em>.</div>
          <router-link to="/" class="btn btn-outline-primary btn-sm font-weight-bold"> Go to Dashboard</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import OrderList from './OrderList.vue'
import ProductList from './ProductList.vue'
import ControlBox from './ControlBox.vue'
import SyncStore from '@/database/sync/sync-store'
import CartStore from './cart-store'
import WorkShift from './pos-components/WorkShift'
// import UserSession from '@/vue-web-core/system/store'

export default {
  components: {
    OrderList,
    ProductList,
    ControlBox,
    WorkShift
  },
  beforeMount() {
  },
  mounted() {
    this.draw()
    this.postSync()
    window.addEventListener('keypress', this.readBarcodeScanner)
  },
  beforeDestroy(){
    window.removeEventListener('keypress', this.readBarcodeScanner)
  },
  data() {
    return {
      isTerminal: localStorage.getItem('is_terminal'),
      doneReSynching: false,
      currentView: null,
      barcodeScannerValue: null,
      scannerTimer: new Date(),
      sessionStatus: 0 // refer to WorkShift for the meaning of each value
    }
  },
  watch: {
    isSynching(newData) {
      this.postSync()
    }
  },
  methods: {
    viewProductList() {
      this.currentView = 'product_list'
      setTimeout(() => {
        this.$refs.productList._draw()
      }, 1000)
    },
    readBarcodeScanner(e){
      if(e.code.indexOf('Digit') > -1){ // character pressed from scanner is Digit, if pressed from keyboard it is Key
        const currentTime = new Date()
        if((currentTime - this.scannerTimer) > 100){ // making sure that it belongs to one barcode
          this.barcodeScannerValue = ''
        }
        this.scannerTimer = currentTime
        this.barcodeScannerValue += e.key
      }else if(e.key === 'Enter'){
        this.$refs.productList._barcodeScanned(this.barcodeScannerValue)
      }
    },
    viewOrderList() {
      this.currentView = 'order_list'
      setTimeout(() => {
        this.$refs.orderList._draw()
      }, 400)
    },
    sessionStatusChange(status){
      this.sessionStatus = status
    },
    draw() {
      this.$nextTick(() => {
        if(typeof this.$refs.productList !== 'undefined' && typeof this.$refs.productList !== 'undefined') {
          this.$refs.productList._draw()
          this.$refs.orderList._draw()
          if (window.innerWidth < 768) {
            if (this.currentView === null) {
              this.currentView = 'order_list'
            }
          } else {
            this.currentView = null
          }
        }else{
          setTimeout(() => {
            this.draw()
          }, 400)
        }
      })
    },
    postSync() {
      if (SyncStore.state.isSynching) {
        return false
      }
      this.$nextTick(() => {
        this.$refs.workShift._checkSession()
        this.$refs.productList._initialize()
        this.$refs.orderList._initialize()
        this.draw()
        window.addEventListener('resize', () => {
          this.draw()
        })
      })
    }
  },
  computed: {
    totalAmount(){
      return CartStore.getters.totalAmount
    },
    isSynching() {
      return SyncStore.getters.isSynching
    }
  }
}
</script>
<style>
</style>
