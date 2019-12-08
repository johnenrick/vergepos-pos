<template>
  <div
    ref="modal"
    class="modal show"
    tabindex="-1"
    role="dialog"
  >
    <div
      class="modal-dialog"
      role="document"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <fa :icon="'receipt'" /> Transaction
          </h5>
          <a
            href="#"
            data-dismiss="modal"
            class="pt-1"
          >
            <fa :icon="'times'" />
          </a>
        </div>
        <div class="modal-body">
          <div class="input-group mb-2">
            <input v-model="transactionNumber" @keypress.enter="initReceipt" type="text" class="form-control" placeholder="Transaction Number" aria-label="Recipient's username" aria-describedby="basic-addon2">
            <div class="input-group-append">
              <button @click="initReceipt" v-bind:disabled="transactionLoading" class="btn btn-outline-secondary" type="button"><fa :icon="'search'" /></button>
            </div>
          </div>
          <div class="w-100 mb-2" >
            <button v-if="this.transactionNumber" @click="transactionNumber--; initReceipt()" class="btn btn-outline-secondary" v-bind:disabled="transactionLoading"  title="View Previous Transaction"><fa :icon="'chevron-left'" /> Previous</button>
            <button @click="transactionNumber++; initReceipt()" class="btn btn-outline-secondary float-right" v-bind:disabled="transactionLoading"  title="View Next Transaction">Next <fa :icon="'chevron-right'" /></button>
            <div style="clear:both"></div>
          </div>
          <div>
            <receipt ref="Receipt" :transaction-number="openedTransactionNumber" @loading="transactionLoading=$event"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Receipt from '@/components/Receipt'

export default {
  components: {
    Receipt
  },
  data(){
    return {
      transactionNumber: null,
      openedTransactionNumber: null,
      transactionLoading: false
    }
  },
  methods: {
    _open(defaultTransactionNumber){
      if(defaultTransactionNumber && typeof (defaultTransactionNumber * 1) === 'number'){
        this.transactionNumber = defaultTransactionNumber * 1
        this.initReceipt()
      }else{
        this.transactionNumber = null
      }
      $(this.$refs.modal).modal('show')
    },
    initReceipt(){
      this.openedTransactionNumber = this.transactionNumber * 1
      if(this.transactionNumber <= 0){
        this.transactionNumber = null
        return false
      }
      this.$refs.Receipt._view(this.transactionNumber * 1)
    }
  }
}
</script>
