<template>
  <div>
    <h5 class="font-weight-bold">Set up your POS</h5>
    <div class="pl-2">
      <div :class="hasProductCategories ? 'text-secondary' : ''" class="mb-1">
        <fa v-if="hasProductCategories" icon="check" class="text-success" />
        <span v-else class="font-weight-bold">1.</span>
        Encode product or item categories
        <fa v-if="checkingProductCategories" title="checking..." icon="circle-notch" spin />
      </div>
      <div :class="hasProducts ? 'text-secondary' : ''" class="mb-1">
        <fa v-if="hasProducts" icon="check" class="text-success" />
        <span v-else class="font-weight-bold">2.</span>
        Encode products or items to sell
        <!-- <span @click="playTutorial('https://www.youtube.com/watch?v=mV8N-V8F9j8')" class="badge badge-danger c-pointer"><fa icon="play" /> Play Tutorial</span> -->
        <fa v-if="checkingProducts" title="checking..." icon="circle-notch" spin />
      </div>
      <div :class="hasTerminals ? 'text-secondary' : ''" class="mb-1">
        <fa v-if="hasTerminals" icon="check" class="text-success" />
        <span v-else class="font-weight-bold">3.</span>
        Create POS Terminal (for testing)
        <fa v-if="checkingTerminals" title="checking..." icon="circle-notch" spin />
      </div>
      <div :class="hasTransactions ? 'text-secondary' : ''" class="mb-1">
        <fa v-if="hasTransactions" icon="check" class="text-success" />
        <span v-else class="font-weight-bold">4.</span>
        Make a sample transaction
        <fa v-if="checkingTransactions" title="checking..." icon="circle-notch" spin />
      </div>
    </div>
    <modal ref="modal" @close="youtubeVideoLink = null" size="lg">
      <div slot="body">
        <youtube v-if="youtubeVideoLink" :video-id="youtubeVideoLink" player-width="100%" class="mb-1" />
        <div class="text-right">
          <button @click="closeModal" class="btn btn-success">Okay!</button>
        </div>
      </div>
    </modal>
  </div>
</template>
<script>
import Modal from '@/vue-web-core/components/bootstrap/Modal'
import { getIdFromURL } from 'vue-youtube-embed'
import UserStore from '@/vue-web-core/system/store'
export default {
  components: {
    Modal
  },
  mounted(){
    if(localStorage.getItem('done_happy_path') * 1 === 0){
      this.init()
    }else{
      this.$emit('done')
    }
  },
  data(){
    return {
      checkingProductCategories: false,
      checkingProducts: false,
      checkingTerminals: false,
      checkingTransactions: false,
      hasProductCategories: false,
      hasProducts: false,
      hasTerminals: false,
      hasTransactions: false,
      youtubeVideoLink: null
    }
  },
  methods: {
    init(){
      const hasProductCategories = localStorage.getItem('has_product_categories') * 1
      const hasProducts = localStorage.getItem('has_products') * 1
      const hasTransactions = localStorage.getItem('has_transactions') * 1
      if(!hasProductCategories){
        this.checkIfHasCategoryOnline()
      }else{
        this.hasProductCategories = hasProductCategories
      }
      if(!hasProducts){
        this.checkIfHasProductOnline()
      }else{
        this.hasProducts = hasProducts
      }
      if(localStorage.getItem('is_terminal')){
        this.hasTerminals = true
      }else{
        this.checkIfHasTerminalOnline()
      }
      if(!hasTransactions){
        this.checkIfHasTransactionOnline()
      }else{
        this.$emit('done')
        this.hasTransactions = true
      }
    },
    playTutorial(link){
      this.youtubeVideoLink = getIdFromURL(link)
      this.$refs.modal._open()
    },
    closeModal(){
      this.youtubeVideoLink = null
      this.$refs.modal._close()
    },
    checkIfHasCategoryOnline(){
      this.checkingProductCategories = true
      this.apiRequest('category/retrieve', { limit: 1, select: ['id'] }, (response) => {
        if(response['data'].length){
          localStorage.setItem('has_product_categories', 1)
          this.hasProductCategories = true
        }else{
          localStorage.setItem('has_product_categories', 0)
          this.hasProductCategories = false
        }
        this.checkingProductCategories = false
      })
    },
    checkIfHasProductOnline(){
      this.checkingProducts = true
      this.apiRequest('product/retrieve', { limit: 1, select: ['id'] }, (productResponse) => {
        if(productResponse['data'].length){
          localStorage.setItem('has_product_categories', 1)
          this.hasProducts = true
        }else{
          localStorage.setItem('has_product_categories', 0)
          this.hasProducts = false
        }
        this.checkingProducts = false
      })
    },
    checkIfHasTerminalOnline(){
      this.checkingTerminals = true
      let param = {
        id: UserStore.getters.companyInformation.id,
        select: {
          0: 'id',
          1: 'name',
          2: 'code',
          company_detail: {
            select: ['address', 'contact_number']
          },
          stores: {
            select: {
              0: 'id',
              store_terminals: {
                select: ['id', 'description', 'serial_number']
              }
            }
          }
        }
      }
      this.apiRequest('company/retrieve', param, (response) => {
        if(response['data'] && typeof response['data']['stores'] === 'object' && response['data']['stores'].length && response['data']['stores'][0]['store_terminals'].length){
          this.hasTerminals = true
        }else{
          this.hasTerminals = false
        }
        this.checkingTerminals = false
      })
    },
    checkIfHasTransactionOnline(){
      this.checkingTransactions = true
      const param = {
        select: ['id', 'number'],
        limit: 11
      }
      this.apiRequest('transaction-number/retrieve', param, (response) => {
        if(response['data'].length){
          if(response['data'].length > 10){
            localStorage.setItem('done_happy_path', 1)
            this.$emit('done')
          }
          this.hasTransactions = true
        }else{
          this.hasTransactions = false
        }
        this.checkingTransactions = false
      })
    }
  }
}
</script>
