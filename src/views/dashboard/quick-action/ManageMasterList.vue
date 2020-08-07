<template>
  <div class="border bg-white rounded p-2 px-3" style="height: 100%">
    <span v-if="messageType === 1">Manage your Product Categories and Products first before you can make any transaction.</span>
    <span v-else-if="messageType === 2">Manage your products first before you can make any transactions</span>
    <span v-else-if="messageType === 3">You have not managed your products and categories yet. You need to be online and log in without using the Offline Mode to manage it.</span>
    <span v-else-if="messageType === 4">Looks like everything is set up! Start selling now at your Terminal.</span>
    <div class="text-center mt-1">
      <template v-if="messageType <= 2">
        <router-link to="/category" class="btn btn-outline-success btn-sm mx-1"><fa icon="boxes" /> Manage Product Category</router-link>
        <router-link to="/product" v-show="messageType !== 1" class="btn btn-outline-success btn-sm"><fa icon="box" /> Manage Product</router-link>
      </template>
      <router-link v-else-if="messageType === 4" to="/pos" @click="logout" class="btn btn-outline-primary btn-sm mx-1"><fa icon="cash-register" /> Go to POS</router-link>
      <button v-else @click="logout" class="btn btn-outline-dark btn-sm mx-1">Logout</button>
    </div>
  </div>
</template>
<script>
import UserStore from '@/vue-web-core/system/store'
import ProductDB from '@/database/controller/product'
export default {
  mounted(){
    if(this.mode === 'offline'){
      this.checkMasterListOffline()
    }else{
      this.checkMasterListOnline()
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
    checkMasterListOnline(){
      this.apiRequest('category/retrieve', { limit: 1, select: ['id'] }, (response) => {
        if(response['data'].length){
          this.apiRequest('product/retrieve', { limit: 1, select: ['id'] }, (productResponse) => {
            if(productResponse['data'].length){
              this.messageType = 4
              this.$emit('toggle', true)
            }else{
              this.messageType = 2
              this.$emit('toggle', true)
            }
          })
        }else{
          this.messageType = 1
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
