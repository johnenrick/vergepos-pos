<template>
  <div class="">
    <div v-show="isTerminal" class="row no-gutters">
      <div class="col-12 col-sm-12 col-md-5">
        <order-list ref="orderList" />
      </div>
      <div class="col-12 col-sm-12 col-md-7 pl-3">
        <control-box :is-synching="isSynching" />
        <product-list ref="productList"/>
      </div>
    </div>
    <div v-show="!isTerminal" class="text-center pt-4">
      <big class="border rounded p-3 border-warning">
        <fa class="text-warning" icon="exclamation-triangle" /> This device is not a terminal. Just go back to the <router-link to="/" class="font-weight-bold" >Dashboard</router-link> and click <strong class="badge badge-secondary badge-lg p-2"><big > <fa icon="cash-register" /> Set As Terminal</big></strong> button
      </big>
    </div>
  </div>
</template>
<script>
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
    if(this.isSynching === false){
      this.postSync()
    }
  },
  beforeDestroy () {
  },
  data () {
    return {
      isTerminal: localStorage.getItem('is_terminal'),
      doneSynching: false
    }
  },
  computed: {
    isSynching(){
      return SyncStore.state.isSynching
    }
  },
  watch: {
    isSynching(newData){
      console.log('watching', newData)
      if(newData === false){
        this.postSync()
      }
    }
  },
  methods: {
    postSync(){
      if(SyncStore.state.isSynching){
        return false
      }
      this.doneSynching = true
      if(typeof this.$refs.productList === 'undefined'){
        this.$nextTick(() => {
          this.$refs.productList._initialize()
        })
      }else{
        this.$refs.productList._initialize()
        this.$refs.orderList._initialize()
      }
    }
  }
}
</script>
<style>
.page-content-wrapper{
  background-color: whitesmoke
}
</style>
