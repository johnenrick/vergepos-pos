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
          <div class="input-group mb-3">
            <input v-model="transactionNumber" type="text" class="form-control" placeholder="Transaction Number" aria-label="Recipient's username" aria-describedby="basic-addon2">
            <div class="input-group-append">
              <button @click="initReceipt" v-bind:disabled="transactionLoading" class="btn btn-outline-secondary" type="button"><fa :icon="'search'" /></button>
            </div>
          </div>
          <div class="w-100">
            <button class="btn btn-outline-secondary" v-bind:disabled="transactionLoading"  title="View Previous Transaction"><fa :icon="'chevron-left'" /> Previous</button>
            <button class="btn btn-outline-secondary float-right" v-bind:disabled="transactionLoading"  title="View Next Transaction">Next <fa :icon="'chevron-right'" /></button>
          </div>
          <div class="pt-2">
            <receipt ref="Receipt" :transaction-number="openedTransactionNumber" @loading="transactionLoading=$event"/>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Receipt from '@/components/Receipt'
import Cart from '../cart-store'
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
    _open(){
      if(Cart.state.latestTransactionNumber) this.transactionNumber = Cart.state.latestTransactionNumber
      $(this.$refs.modal).modal('show')
    },
    initReceipt(){
      this.openedTransactionNumber = this.transactionNumber * 1
      this.$refs.Receipt._view(this.transactionNumber * 1)
    }
  }
}
</script>
