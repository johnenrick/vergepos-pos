<template>
  <div class="border bg-white rounded p-2 px-3" style="height: 100%">
    <span v-if="messageType === 1">Manage your Product Categories and Products first before you can make any transaction.</span>
    <span v-else-if="messageType === 2">Manage your products first before you can make any transactions</span>
    <span v-else-if="messageType === 3">It seems like you haven't set up your account yet. Please make sure you have internet connection and login again without using Offline Mode.</span>
    <span v-else-if="messageType === 4">Looks like everything is set up! Start selling now at your Terminal.</span>
    <div class="text-center mt-2">
      <template v-if="messageType <= 2">
        <router-link to="/category" class="btn btn-outline-success btn-sm mx-1 mb-1"><fa icon="boxes" /> Manage Product Category</router-link>
        <router-link to="/product" v-show="messageType !== 1" class="btn btn-outline-success btn-sm mb-1"><fa icon="box" /> Manage Product</router-link>
      </template>
      <router-link v-else-if="messageType === 4" to="/pos" class="btn btn-outline-primary btn-sm mx-1"><fa icon="cash-register" /> Go to POS</router-link>
      <button v-else @click="logout" class="btn btn-outline-dark btn-sm mx-1">Logout</button>
    </div>
  </div>
</template>
<script>
import UserStore from '@/vue-web-core/system/store'
import ProductDB from '@/database/controller/product'
export default {
  mounted(){
    const hasProductCategories = localStorage.getItem('has_product_categories') * 1
    const hasProducts = localStorage.getItem('has_products') * 1
    if(hasProductCategories && hasProducts){
      this.messageType = 4
      this.$emit('toggle', true)
    }else if(this.mode === 'offline'){
      this.checkMasterListOffline()
    }else{
      this.checkMasterListOnline(hasProductCategories)
    }
  },
  data(){
    return {
      messageType: 1, // 1 - no category and product yet, 2 - no product yet, 3 - no product but offline mode, 4 - already have product and category,
    }
  },
  methods: {
    checkMasterListOffline(){
      let productDB = new ProductDB()
      productDB.get().then(result => {
        if(!result.length){
          this.$emit('toggle', true)
          this.messageType = 3
        }else{
          this.messageType = 4
          this.$emit('toggle', true)
        }
      })
    },
    checkMasterListOnline(hasCategory = false){
      if(!hasCategory){
        this.checkIfHasCategoryOnline().then(hasCategoryOnline => {
          if(hasCategoryOnline){
            this.checkIfHasProductOnline()
          } // messageType is already set to 1 if false
        })
      }else{
        this.checkIfHasProductOnline()
      }
    },
    checkIfHasCategoryOnline(){
      return new Promise((resolve) => {
        this.apiRequest('category/retrieve', { limit: 1, select: ['id'] }, (response) => {
          if(response['data'].length){
            localStorage.setItem('has_product_categories', 1)
            resolve(true)
          }else{
            localStorage.setItem('has_product_categories', 0)
            resolve(false)
            this.messageType = 1
            this.$emit('toggle', true)
          }
        })
      })
    },
    checkIfHasProductOnline(){
      this.apiRequest('product/retrieve', { limit: 1, select: ['id'] }, (productResponse) => {
        if(productResponse['data'].length){
          this.messageType = 4
          this.$emit('toggle', true)
          localStorage.setItem('has_products', 1)
        }else{
          this.messageType = 2
          localStorage.setItem('has_products', 0)
          this.$emit('toggle', true)
        }
      })
    },
    logout(){
      UserStore.commit('logout')
      this.$auth.logout()
      window.location.reload()
    }
  },
  computed: {
    mode(){
      return UserStore.getters.mode
    }
  }
}
</script>
