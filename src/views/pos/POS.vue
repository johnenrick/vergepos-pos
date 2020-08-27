<template>
  <div class="p-2">
    <div v-show="isTerminal" class="row no-gutters">
      <div
        v-show="currentView === 'order_list' || currentView === null"
        class="col-12 col-sm-12 col-md-5 px-1"
      >
        <order-list ref="orderList" @view-product-list="viewProductList"/>
      </div>
      <div
        v-show="currentView === 'product_list' || currentView === null"
        class="col-12 col-sm-12 col-md-7 px-1"
      >
        <button class="btn btn-outline-success w-100 mb-2 d-md-none" @click="viewOrderList">
          <fa icon="list"/>View Orders
        </button>
        <control-box/>
        <product-list ref="productList"/>
      </div>
    </div>
    <div v-show="!isTerminal" class="text-center pt-4">
      <div class="border rounded p-3 border-warning" style="display: inline-block">
        <div class="mb-3">
          <fa class="text-warning" icon="exclamation-triangle"/> This device is not a terminal.
        </div>
        <div class="mb-3">Go back to the Dashboard and click <strong class="text-nowrap"><fa icon="cash-register"/> Set As Terminal</strong> under <em>Quick Actions</em>.</div>
        <router-link to="/" class="btn btn-outline-primary btn-sm font-weight-bold"> Go to Dashboard</router-link>
      </div>
    </div>
  </div>
</template>
<script>
import OrderList from './OrderList.vue'
import ProductList from './ProductList.vue'
import ControlBox from './ControlBox.vue'
import SyncStore from '@/database/sync/sync-store'
// import UserSession from '@/vue-web-core/system/store'

export default {
  components: {
    OrderList,
    ProductList,
    ControlBox
  },
  beforeMount() {
    this.$store.dispatch('SET_LOADING', true)
    this.$store.dispatch('SET_SMS', 'Loading Products...')
  },
  mounted() {
    this.draw()
    this.postSync()
  },
  beforeDestroy() {},
  data() {
    return {
      isTerminal: localStorage.getItem('is_terminal'),
      doneReSynching: false,
      currentView: null
    }
  },
  computed: {
    isSynching() {
      return SyncStore.getters.isSynching
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
    viewOrderList() {
      this.currentView = 'order_list'
      setTimeout(() => {
        this.$refs.orderList._draw()
      }, 400)
    },
    draw() {
      this.$nextTick(() => {
        if (
          typeof this.$refs.productList !== 'undefined' &&
          typeof this.$refs.productList !== 'undefined'
        ) {
          this.$refs.productList._draw()
          this.$refs.orderList._draw()
          if (window.innerWidth < 768) {
            if (this.currentView === null) {
              this.currentView = 'order_list'
            }
          } else {
            this.currentView = null
          }
        } else {
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
        this.$refs.productList._initialize()
        this.$refs.orderList._initialize()
        this.draw()
        window.addEventListener('resize', () => {
          this.draw()
        })
      })
    }
  }
}
</script>
<style>
</style>
