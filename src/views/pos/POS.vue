<template>
  <div class="">
    <div v-if="doneSyncing">
      <div class="row no-gutters">
        <div class="col-12 col-sm-12 col-md-5">
          <order-list ref="orderList" />
        </div>
        <div class="col-12 col-sm-12 col-md-7 pl-3">
          <control-box />
          <product-list @add-product="addItem" />
        </div>
      </div>
    </div>
    <div v-else class="bg-primary text-center text-white" style="height:calc(40vh - 90px)" >
      Please wait... We're preparing things for you...
    </div>
  </div>
</template>
<script>
import navConfig from '@/vue-web-core/components/common/navigation/config.js'
import SyncData from './sync-data.js'

import OrderList from './OrderList.vue'
import ProductList from './ProductList.vue'
import ControlBox from './ControlBox.vue'
export default {
  components: {
    OrderList,
    ProductList,
    ControlBox
  },
  mounted () {
    navConfig.noSideBar = true
    this.syncData()
  },
  beforeDestroy () {
    navConfig.noSideBar = false
  },
  data () {
    return {
      doneSyncing: false
    }
  },
  methods: {
    addItem (productID) {
      this.$refs.orderList._addProduct(productID)
    },
    syncData () {
      let syncData = new SyncData()
      syncData.sync().then((isDone) => {
        this.doneSyncing = true
      })
    }
  }
}
</script>
<style>
.page-content-wrapper{
  background-color: whitesmoke
}
</style>
