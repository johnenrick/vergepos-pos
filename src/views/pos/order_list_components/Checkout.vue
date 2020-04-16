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
            <fa :icon="'shopping-cart'" /> Check Out
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
          <div class="row">
            <label class="col-sm-6 col-form-label text-right font-weight-bold">Sub Total: </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right"
                :value="subTotal | numberToMoney"
              >
            </div>
          </div>

          <div class=" row">
            <label class="col-sm-6 col-form-label text-right ">VAT Sales: </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right"
                :value="totalVatSales | numberToMoney"
              >
            </div>
          </div>
          <div class="row">
            <label class="col-sm-6 col-form-label text-right ">VAT Exempt Sales: </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right"
                :value="totalVatExempt | numberToMoney"
              >
            </div>
          </div>
          <div class="row">
            <label class="col-sm-6 col-form-label text-right ">VAT({{taxPercentage}}): </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right"
                :value="totalVatAmount | numberToMoney"
              >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-6 col-form-label text-right">Total Discount: </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right"
                :value="totalDiscountAmount | numberToMoney"
              >
            </div>
          </div>
          <div class="form-group row ">
            <label class="col-sm-6 col-form-label form-control-lg text-right font-weight-bold">Total Payable: </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right font-weight-bold form-control-lg"
                :value="totalAmount | numberToMoney"
              >
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-6 col-form-label text-right font-weight-bold">Cash Payment: </label>
            <div class="col-sm-4">
              <number-input :default-value="0" :current-value="cashPayment" :is-decimal="true" @change="cashPayment = $event"/>
            </div>
          </div>
          <div class="form-group row">
            <label class="col-sm-6 col-form-label text-right font-weight-bold">Change: </label>
            <div class="col-sm-4">
              <input
                type="text"
                readonly="readonly"
                class="form-control-plaintext text-right"
                v-bind:class="totalAmount > cashPayment ? 'text-danger' : ''"
                :value="(cashPayment - totalAmount) * 1 | numberToMoney"
              >
            </div>
          </div>
        </div>
        <div class="p-3 text-center border-top">
          <template v-if="!transacting">
            <button @click="changeTogglePrintState" :class="printOnCheckOut?'btn btn-primary':'btn btn-outline-primary'" style="float: left">
              <span><fa icon="print"></fa></span>
            </button>
            <button
              v-bind:disabled="totalAmount > cashPayment"
              @click="checkout"
              type="button"
              class="btn btn-lg btn-success"
            >
              Check Out <fa :icon="'arrow-right'" />
            </button>
          </template>
          <template v-else-if="transacting">
            <span v-if="transactionStatus === null" class="font-weight-bold">Please wait...</span>
            <span v-if="transactionStatus === true" class="font-weight-bold text-success">Transaction Succesful!</span>
          </template>
        </div>
      </div>
    </div>
    <div hidden>
      <Receipt ref="receipt"></Receipt>
    </div>
  </div>
</template>
<script>
// import Vue from 'vue'
import Cart from '../cart-store'
import NumberInput from '@/components/NumberInput'
import Transaction from '../transact.js'
import Receipt from '@/components/Receipt'
export default {
  mounted() {
    this.getPrintOnCheckOutLocalState()
  },
  components: {
    NumberInput,
    Receipt
  },
  props: {
    subTotal: Number,
    totalVatSales: Number,
    totalVatExempt: Number,
    totalVatAmount: Number,
    totalAmount: Number,
    totalDiscountAmount: Number,
    appliedDiscountID: [Number]
  },
  data () {
    return {
      cashPayment: 0,
      taxPercentage: (Cart.state.taxPercentage * 100) + '%',
      transaction: new Transaction(),
      transacting: false,
      transactionStatus: null,
      printOnCheckOut: false
    }
  },
  methods: {
    getPrintOnCheckOutLocalState (){
      if(localStorage.getItem('printOnCheckOut') !== null){
        if(localStorage.getItem('printOnCheckOut') === 'false'){
          this.printOnCheckOut = false
        } else{
          this.printOnCheckOut = true
        }
      }
    },
    changeTogglePrintState (){
      this.printOnCheckOut = !this.printOnCheckOut
      localStorage.setItem('printOnCheckOut', this.printOnCheckOut)
    },
    checkout () {
      this.transacting = true
      this.transactionStatus = null
      this.transaction.transact({
        customer: 'Guest',
        total_amount: Cart.state.totalAmount,
        total_vat_sales: Cart.state.totalVatSales,
        total_vat_exempt_sales: Cart.state.totalVatExemptSales,
        total_vat_zero_rated_sales: Cart.state.totalVatZeroRatedSales,
        total_vat_amount: Cart.state.totalVatAmount,
        total_discount_amount: Cart.state.totalDiscountAmount,
        sub_total_amount: Cart.state.subTotalAmount,
        cash_tendered: this.cashPayment,
        cash_amount_paid: Cart.state.totalAmount,
        discount_id: Cart.state.discountId,
        discount_remarks: Cart.state.discountRemarks,
      }, JSON.parse(JSON.stringify(Cart.getters.items))).then((response) => {
        Cart.commit('setLatestTransactionNUmber', response['number'])
        this.transactionStatus = true
        let funcCallback = () => {
          this.$refs.receipt.print()
        }
        if(this.printOnCheckOut === true){
          this.$refs.receipt._view(response['number']).then(funcCallback)
        }
        setTimeout(() => {
          this.$emit('transaction-created', response)
          $(this.$refs.modal).modal('hide')
          this._reset()
          Cart.commit('reset')
        }, 800)
      }).catch(error => {
        this.transacting = false
        console.log('ooh', error)
      })
    },
    _open () { // open the modal
      $(this.$refs.modal).modal('show')
    },
    _reset(){
      this.transacting = false
      this.transactionStatus = null
      this.cashPayment = 0
    }
  },
  computed: {
  }
}
</script>
