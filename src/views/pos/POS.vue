<template>
  <div class="">
    <div class="row no-gutters">
      <div class="col-12 col-sm-12 col-md-5">
        <order-list ref="orderList" />
      </div>
      <div class="col-12 col-sm-12 col-md-7 pl-3">
        <control-box :is-synching="isSyncing" />
        <product-list ref="productList" @add-product="addItem" />
      </div>
    </div>
  </div>
</template>
<script>
import navConfig from '@/vue-web-core/components/common/navigation/config.js'
import OrderList from './OrderList.vue'
import ProductList from './ProductList.vue'
import ControlBox from './ControlBox.vue'
import SyncStore from '@/database/sync/sync-store'
export default {
  components: {
    OrderList,
    ProductList,
    ControlBox
  },
  mounted () {
    navConfig.noSideBar = true
    this.postSync()
  },
  beforeDestroy () {
    navConfig.noSideBar = false
  },
  data () {
    return {
      doneSyncing: false
    }
  },
  computed: {
    isSyncing(){
      console.log('syncha', SyncStore.state.isSyncing)
      return SyncStore.state.isSyncing
    }
  },
  watch: {
    isSyncing(newData){
      console.log('watching', newData)
      this.postSync()
    }
  },
  methods: {
    postSync(){
      if(SyncStore.state.isSyncing){
        return false
      }
      this.doneSyncing = true
      if(typeof this.$refs.productList === 'undefined'){
        this.$nextTick(() => {
          this.$refs.productList._initialize()
        })
      }else{
        this.$refs.productList._initialize()
      }
    },
    addItem (productID) {
      this.$refs.orderList._addProduct(productID)
    }
  }
}
</script>
<style>
.page-content-wrapper{
  background-color: whitesmoke
}
</style>
