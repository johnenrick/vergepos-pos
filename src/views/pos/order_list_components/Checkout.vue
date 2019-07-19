<template>
  <div
    ref="modal"
    class="modal"
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
            <fa :icon="'tag'" /> Check Out
          </h5>
        </div>
        <div class="modal-body">
          {{ discountedItemList }}
          <div class="form-group row">
            <label class="col-sm-6 col-form-label text-right font-weight-bold">Sub Total: </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right"
                :value="totalAmount | numberToMoney"
              >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-6 col-form-label text-right font-weight-bold">Total Discount: </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right"
                :value="totalDiscount | numberToMoney"
              >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-6 col-form-label text-right font-weight-bold">Total VAT Exempt: </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right"
                :value="totalVatExempt | numberToMoney"
              >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-6 col-form-label text-right font-weight-bold">Cash Payment: </label>
            <div class="col-sm-4">
              <input
                type="text"
                class="form-control text-right"
                @change="cashPayment = $event.target.value"
                :value="cashPayment | numberToMoney"
              >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-6 col-form-label text-right font-weight-bold">Change: </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right"
                :value="(cashPayment - amountDue) * 1 | numberToMoney"
              >
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-dismiss="modal"
          >
            Close
          </button>
          <button
            @click="checkout"
            type="button"
            class="btn btn-primary"
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
export default {
  props: {
    totalAmount: Number,
    totalDiscount: Number,
    totalVatExempt: Number,
    appliedDiscountID: [Number],
    discountedItemList: Object,
    orderList: Array
  },
  data () {
    return {
      cashPayment: 0
    }
  },
  methods: {
    checkout () {

    },
    _open () { // open the modal
      $(this.$refs.modal).modal('show')
    }
  },
  computed: {
    amountDue () {
      return this.totalAmount - this.totalDiscount - this.totalVatExempt
    }
  }
}
</script>
